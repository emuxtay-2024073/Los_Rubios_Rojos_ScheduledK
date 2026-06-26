import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, updateUserRole } from '../../shared/apis/auth.js';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { showError, showSuccess } from '../../shared/utils/toast.js';

export const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data.users || []);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la lista de usuarios.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const verified = users.filter((u) => u.isVerified).length;
    const padres = users.filter((u) => (u.role || '').toUpperCase() === 'PADRE').length;
    const coordinadores = users.filter((u) => (u.role || '').toUpperCase() === 'COORDINADOR').length;
    const admins = users.filter((u) => {
      const role = (u.role || '').toUpperCase();
      return role === 'ADMIN' || role === 'SUPER_ADMIN';
    }).length;

    return { total, verified, padres, coordinadores, admins };
  }, [users]);

  const featuredUsers = useMemo(() => users.slice(0, 3), [users]);

  const handleRoleChange = async (userId, currentRole) => {
    if (!isSuperAdmin) {
      showError('Solo los SUPER_ADMIN pueden cambiar roles');
      return;
    }

    const newRole = currentRole === 'Padre' ? 'Coordinador' : 'Padre';
    const confirmed = window.confirm(`¿Cambiar rol de ${currentRole} a ${newRole}?`);
    if (!confirmed) return;

    try {
      await updateUserRole(userId, { role: newRole });
      showSuccess(`Rol actualizado a ${newRole}`);
      // Reload users
      const data = await getAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      showError('No se pudo actualizar el rol');
    }
  };

  const roleBadgeClass = (role) => {
    const normalized = (role || '').toUpperCase();
    if (normalized === 'SUPER_ADMIN') return 'bg-red-100 text-red-700';
    if (normalized === 'ADMIN') return 'bg-purple-100 text-purple-700';
    if (normalized === 'COORDINADOR') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const statusBadgeClass = (isVerified) => {
    return isVerified 
      ? 'bg-green-100 text-green-700' 
      : 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className='space-y-10'>
      <section className='grid items-center gap-8 overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10'>
        <div className='space-y-6'>
          <p className='inline-flex rounded-full border border-main-blue/20 bg-surface-soft px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-main-blue'>
            Portal administrador
          </p>
          <div className='space-y-4'>
            <h1 className='max-w-2xl text-4xl font-black tracking-tight text-gray-900 sm:text-5xl'>
              Gestión de usuarios y permisos del sistema
            </h1>
            <p className='max-w-2xl text-base text-gray-700 sm:text-lg'>
              Administra usuarios, asigna roles de coordinador, verifica cuentas y mantén el
              control de accesos con una interfaz adaptada al diseño del sistema.
            </p>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <article className='rounded-3xl border border-gray-200 bg-card p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-main-blue'>Usuarios totales</p>
              <p className='mt-3 text-3xl font-black text-gray-900'>{stats.total}</p>
            </article>
            <article className='rounded-3xl border border-gray-200 bg-card p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-main-blue'>Verificados</p>
              <p className='mt-3 text-3xl font-black text-gray-900'>{stats.verified}</p>
            </article>
          </div>
        </div>
        <div className='grid gap-4'>
          {loading ? (
            <>
              <div className='h-44 animate-pulse rounded-3xl bg-gray-100' />
              <div className='h-32 animate-pulse rounded-3xl bg-gray-100' />
            </>
          ) : (
            <>
              {featuredUsers[0] && (
                <article className='overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg'>
                  <div className='h-44 bg-[linear-gradient(135deg,rgba(86,72,231,0.95),rgba(86,72,231,0.65),rgba(68,56,216,0.8))] p-6 text-white'>
                    <p className='text-xs font-semibold uppercase tracking-[0.3em] text-white/80'>
                      Usuario destacado
                    </p>
                    <h3 className='mt-2 text-2xl font-bold'>
                      {featuredUsers[0].nombres || featuredUsers[0].username || 'Usuario'}
                    </h3>
                    <p className='mt-2 text-sm text-white/90'>{featuredUsers[0].email}</p>
                  </div>
                  <div className='space-y-4 p-5'>
                    <div className='flex flex-wrap gap-2 text-xs font-semibold text-gray-700'>
                      <span className={`rounded-full px-3 py-1 ${roleBadgeClass(featuredUsers[0].role)}`}>
                        {featuredUsers[0].role || 'Sin rol'}
                      </span>
                      <span className={`rounded-full px-3 py-1 ${statusBadgeClass(featuredUsers[0].isVerified)}`}>
                        {featuredUsers[0].isVerified ? 'Verificado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </article>
              )}
              <article className='rounded-3xl border border-gray-200 bg-card p-4 shadow-sm'>
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-main-blue'>Padres</p>
                <p className='mt-3 text-3xl font-black text-gray-900'>{stats.padres}</p>
              </article>
            </>
          )}
        </div>
      </section>

      {error && (
        <section className='rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700'>
          {error}
        </section>
      )}

      <section className='space-y-5'>
        <div className='flex items-end justify-between gap-4'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>
              Estadísticas
            </p>
            <h2 className='mt-1 text-2xl font-bold text-gray-900'>Resumen de roles</h2>
          </div>
          {isSuperAdmin && (
            <Link to='/dashboard/users' className='text-sm font-semibold text-main-blue hover:underline'>
              Ver todos los usuarios
            </Link>
          )}
        </div>
        <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
          {[
            { label: 'Padres', value: stats.padres, color: 'bg-blue-50' },
            { label: 'Coordinadores', value: stats.coordinadores, color: 'bg-green-50' },
            { label: 'Administradores', value: stats.admins, color: 'bg-purple-50' },
            { label: 'Pendientes', value: stats.total - stats.verified, color: 'bg-yellow-50' },
          ].map((stat, index) => (
            <article
              key={stat.label}
              className='overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg'
            >
              <div className={`h-32 ${stat.color} p-5`}>
                <p className='text-xs font-semibold uppercase tracking-[0.3em] text-gray-600'>
                  {stat.label}
                </p>
                <p className='mt-4 text-3xl font-black text-gray-900'>{stat.value}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className='space-y-5'>
        <div className='flex items-end justify-between gap-4'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>
              Usuarios recientes
            </p>
            <h2 className='mt-1 text-2xl font-bold text-gray-900'>Últimos registrados</h2>
          </div>
        </div>
        <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {(loading ? Array.from({ length: 3 }) : featuredUsers).map((userItem, index) =>
            loading ? (
              <div key={index} className='h-80 animate-pulse rounded-3xl bg-gray-100' />
            ) : (
              <article
                key={userItem.id || userItem._id}
                className='overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg'
              >
                <div className='h-32 bg-[linear-gradient(135deg,rgba(86,72,231,0.9),rgba(68,56,216,0.8))] p-5 text-white'>
                  <p className='text-xs font-semibold uppercase tracking-[0.3em] text-white/80'>
                    {userItem.role || 'Usuario'}
                  </p>
                  <h3 className='mt-2 text-xl font-bold'>
                    {userItem.nombres || userItem.username || 'Sin nombre'}
                  </h3>
                  <p className='mt-2 text-sm text-white/90'>{userItem.email}</p>
                </div>
                <div className='space-y-4 p-5'>
                  <p className='text-sm text-gray-600'>
                    {userItem.apellidos ? `${userItem.nombres} ${userItem.apellidos}` : 'Sin apellidos'}
                  </p>
                  <div className='flex flex-wrap gap-2 text-xs font-semibold text-gray-700'>
                    <span className={`rounded-full px-3 py-1 ${roleBadgeClass(userItem.role)}`}>
                      {userItem.role || 'Sin rol'}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${statusBadgeClass(userItem.isVerified)}`}>
                      {userItem.isVerified ? 'Verificado' : 'Pendiente'}
                    </span>
                  </div>
                  {isSuperAdmin && userItem.isVerified && (userItem.role || '').toUpperCase() !== 'SUPER_ADMIN' && (userItem.role || '').toUpperCase() !== 'ADMIN' && (
                    <button
                      onClick={() => handleRoleChange(userItem.id || userItem._id, userItem.role)}
                      className='w-full rounded-full bg-main-blue px-4 py-2 text-sm font-medium text-white transition hover:opacity-90'
                    >
                      Cambiar a {userItem.role === 'Padre' ? 'Coordinador' : 'Padre'}
                    </button>
                  )}
                </div>
              </article>
            ),
          )}
        </div>
      </section>
    </div>
  );
};
