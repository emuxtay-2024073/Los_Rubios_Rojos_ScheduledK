import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useUserManagementStore } from '../../auth/store/useUserManagementStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { CreateUserModal } from './CreateUserModal.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

const PAGE_SIZE = 8;
const allowedRoleFilters = ['ALL', 'PADRE', 'COORDINADOR', 'ADMIN', 'SUPER_ADMIN'];

const roleBadgeClass = (role = '') => {
  const normalized = role.toUpperCase();
  if (normalized === 'SUPER_ADMIN') return 'admin-status-danger';
  if (normalized === 'ADMIN') return 'admin-status-warning';
  if (normalized === 'COORDINADOR') return 'admin-status-success';
  return 'admin-status-neutral';
};

export const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { users, loading, error, getAllUsers, createUser, updateUserRole } =
    useUserManagementStore();
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const roleFilterParam = (searchParams.get('role') || 'ALL').toUpperCase();
  const roleFilter = allowedRoleFilters.includes(roleFilterParam)
    ? roleFilterParam
    : 'ALL';

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((candidate) => {
      const username = (candidate.username || '').toLowerCase();
      const email = (candidate.email || '').toLowerCase();
      const role = (candidate.role || '').toUpperCase();
      const names = `${candidate.nombres || ''} ${candidate.apellidos || ''}`.toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        username.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        names.includes(normalizedSearch);
      const matchesRole = roleFilter === 'ALL' ? true : role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const stats = useMemo(() => {
    const admins = users.filter((candidate) =>
      ['ADMIN', 'SUPER_ADMIN'].includes((candidate.role || '').toUpperCase()),
    ).length;
    const active = users.filter((candidate) =>
      Boolean(candidate.isVerified ?? candidate.verified ?? candidate.emailConfirmed),
    ).length;
    const parents = users.filter(
      (candidate) => (candidate.role || '').toUpperCase() === 'PADRE',
    ).length;
    return { active, admins, pending: users.length - active, parents, total: users.length };
  }, [users]);

  const handleCreate = async (payload) => {
    const response = await createUser(payload);
    if (response.success) {
      showSuccess('Usuario creado correctamente. Debe verificar su correo.');
      return true;
    }

    showError(response.error || 'No se pudo crear el usuario');
    return false;
  };

  const handleUpdateUserRole = async (candidate, nextRole) => {
    const currentRole = (candidate.role || 'PADRE').toUpperCase();
    if (currentRole === nextRole) return;

    const isVerified = Boolean(
      candidate.isVerified ?? candidate.verified ?? candidate.emailConfirmed,
    );

    if (!isVerified) {
      showError('El usuario debe verificar su correo antes de cambiar su rol');
      return;
    }

    const confirmed = window.confirm(
      `Cambiar el rol de ${candidate.email} de ${currentRole} a ${nextRole}?`,
    );
    if (!confirmed) return;

    const response = await updateUserRole(candidate._id || candidate.id, nextRole);
    if (response.success) {
      showSuccess(`Rol actualizado a ${nextRole}.`);
      return;
    }

    showError(response.error || 'No se pudo actualizar el rol del usuario');
  };

  if (loading && users.length === 0) return <Spinner />;

  return (
    <div className='admin-page space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='admin-kicker'>Gestión institucional</p>
          <h1 className='admin-title mt-2'>Usuarios y permisos</h1>
          <p className='admin-subtitle mt-2 text-sm'>
            Control de accesos, familias registradas, roles académicos y estado de
            verificación.
          </p>
        </div>
      </div>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <article className='admin-card p-5'>
          <UsersIcon className='h-7 w-7 text-[#5648E7]' />
          <p className='mt-3 text-sm font-bold text-[#5E5E5E]'>Usuarios registrados</p>
          <p className='mt-2 text-3xl font-black text-[#202020]'>{stats.total}</p>
        </article>
        <article className='admin-card p-5'>
          <ShieldCheckIcon className='h-7 w-7 text-[#5648E7]' />
          <p className='mt-3 text-sm font-bold text-[#5E5E5E]'>Usuarios activos</p>
          <p className='mt-2 text-3xl font-black text-[#202020]'>{stats.active}</p>
        </article>
        <article className='admin-card p-5'>
          <UserGroupIcon className='h-7 w-7 text-[#5648E7]' />
          <p className='mt-3 text-sm font-bold text-[#5E5E5E]'>Padres registrados</p>
          <p className='mt-2 text-3xl font-black text-[#202020]'>{stats.parents}</p>
        </article>
        <article className='admin-card p-5'>
          <p className='text-sm font-bold text-[#5E5E5E]'>Pendientes</p>
          <p className='mt-2 text-3xl font-black text-[#202020]'>{stats.pending}</p>
          <div className='mt-3 admin-progress'>
            <span style={{ width: `${stats.total ? (stats.active / stats.total) * 100 : 0}%` }} />
          </div>
        </article>
      </section>

      <section className='admin-panel overflow-hidden'>
        <div className='border-b border-[rgba(32,32,32,0.08)] p-5'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-[1fr_260px]'>
            <label className='relative block'>
              <MagnifyingGlassIcon className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5E5E5E]' />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder='Buscar por nombre, username o email'
                className='admin-input w-full px-11 py-3 text-sm'
              />
            </label>
            <select
              value={roleFilter}
              onChange={(event) => {
                if (event.target.value === 'ALL') {
                  setSearchParams({});
                } else {
                  setSearchParams({ role: event.target.value });
                }
                setPage(1);
              }}
              className='admin-input w-full px-4 py-3 text-sm font-semibold'
            >
              <option value='ALL'>Todos los roles</option>
              <option value='PADRE'>PADRE</option>
              <option value='COORDINADOR'>COORDINADOR</option>
              <option value='ADMIN'>ADMIN</option>
              <option value='SUPER_ADMIN'>SUPER_ADMIN</option>
            </select>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='admin-table min-w-full text-sm'>
            <thead>
              <tr>
                <th className='px-5 py-4 text-left'>Email</th>
                <th className='px-5 py-4 text-left'>Perfil</th>
                <th className='px-5 py-4 text-left'>Rol</th>
                <th className='px-5 py-4 text-left'>Estado</th>
                <th className='px-5 py-4 text-left'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td className='px-5 py-10 text-center text-[#5E5E5E]' colSpan={5}>
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((candidate) => {
                  const isVerified = Boolean(
                    candidate.isVerified ?? candidate.verified ?? candidate.emailConfirmed,
                  );
                  const currentRole = (candidate.role || 'PADRE').toUpperCase();
                  const fullName = `${candidate.nombres || ''} ${candidate.apellidos || ''}`.trim();

                  return (
                    <tr
                      key={candidate._id || candidate.id || candidate.email}
                      className='border-t border-[rgba(32,32,32,0.08)]'
                    >
                      <td className='px-5 py-4 font-extrabold text-[#202020]'>
                        {candidate.email || '-'}
                      </td>
                      <td className='px-5 py-4 text-[#5E5E5E]'>
                        <p className='font-semibold text-[#202020]'>
                          {fullName || `@${candidate.username || 'sin-usuario'}`}
                        </p>
                        <p className='text-xs font-medium text-[#5E5E5E]'>
                          @{candidate.username || 'sin-usuario'}
                        </p>
                      </td>
                      <td className='px-5 py-4'>
                        {isSuperAdmin && currentRole !== 'SUPER_ADMIN' && currentRole !== 'ADMIN' ? (
                          <select
                            value={currentRole}
                            onChange={(event) => handleUpdateUserRole(candidate, event.target.value)}
                            disabled={loading}
                            className='admin-input px-3 py-2 text-sm font-semibold'
                          >
                            <option value='PADRE'>PADRE</option>
                            <option value='COORDINADOR'>COORDINADOR</option>
                          </select>
                        ) : (
                          <span className={`admin-status ${roleBadgeClass(candidate.role)}`}>
                            {currentRole}
                          </span>
                        )}
                      </td>
                      <td className='px-5 py-4'>
                        <span
                          className={`admin-status ${
                            isVerified ? 'admin-status-success' : 'admin-status-warning'
                          }`}
                        >
                          {isVerified ? 'Activo' : 'Pendiente'}
                        </span>
                      </td>
                      <td className='px-5 py-4'>
                        {currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN' ? (
                          <span className='admin-status admin-status-warning'>Protegido</span>
                        ) : isSuperAdmin ? (
                          <span className='text-xs font-bold uppercase tracking-[0.14em] text-[#5E5E5E]'>
                            Ajustable
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className='flex flex-col gap-3 border-t border-[rgba(32,32,32,0.08)] bg-[rgba(247,251,248,0.8)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-xs font-bold text-[#5E5E5E]'>
            Mostrando {(currentPage - 1) * PAGE_SIZE + (paginatedUsers.length ? 1 : 0)}
            {' - '}
            {(currentPage - 1) * PAGE_SIZE + paginatedUsers.length} de {filteredUsers.length}
          </p>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className='admin-button-secondary px-4 py-2 text-sm disabled:opacity-50'
            >
              Anterior
            </button>
            <span className='rounded-full bg-white px-3 py-2 text-sm font-black text-[#202020] ring-1 ring-[rgba(32,32,32,0.08)]'>
              {currentPage} / {totalPages}
            </span>
            <button
              type='button'
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
              className='admin-button-secondary px-4 py-2 text-sm disabled:opacity-50'
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      <CreateUserModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreate={handleCreate}
        loading={loading}
        error={error}
      />
    </div>
  );
};
