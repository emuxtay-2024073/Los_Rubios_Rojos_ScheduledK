import { useEffect } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { useUserManagementStore } from '../../features/auth/store/useUserManagementStore.js';
import { Spinner } from '../../features/auth/components/Spinner.jsx';
import { BackButton } from '../../shared/components/ui/BackButton.jsx';
import mascotImg from '../../assets/img/DENTRO_mg.png';

const getInitials = (value) => {
  const clean = String(value || '').trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : clean.slice(0, 2).toUpperCase();
};

export const CoordinatorParentsPage = () => {
  const { users, loading, getAllUsers } = useUserManagementStore();

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const parents = users.filter((item) => (item.role || '').toUpperCase() === 'PADRE');

  return (
    <div className='space-y-6'>
      <BackButton />
      <section className='admin-hero p-6 sm:p-8'>
        <div className='admin-reference-copy'>
          <span className='admin-kicker'>Listado de padres</span>
          <h1 className='admin-display admin-display--admin' style={{ fontSize: 'clamp(2.2rem,4vw,3.4rem)' }}>
            Familias registradas
          </h1>
          <p className='admin-hero-copy'>Revisa los padres de familia que están activos en la aplicación.</p>
        </div>
      </section>

      <section className='admin-panel p-6 sm:p-8'>
        <div className='mb-6 flex items-center gap-3'>
          <span className='admin-stat-icon violet'>
            <UserGroupIcon className='h-6 w-6' />
          </span>
          <h2 className='text-xl font-black text-[#202020]'>Padres de familia</h2>
        </div>

        {loading ? (
          <div className='mt-6'>
            <Spinner />
          </div>
        ) : parents.length === 0 ? (
          <div className='portal-empty-state'>
            <img src={mascotImg} alt='Schedulito esperando' />
            <p className='text-sm font-bold text-[#202020]'>Aún no hay padres registrados</p>
            <p className='max-w-xs text-sm text-[#5e5e5e]'>
              En cuanto se registren familias en el sistema aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {parents.map((parent) => (
              <article key={parent._id || parent.id || parent.email} className='admin-card flex items-center gap-4 p-5'>
                <span className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(86,72,231,0.12)] text-sm font-black text-[#5648e7]'>
                  {getInitials(parent.nombres || parent.username || parent.email)}
                </span>
                <div className='min-w-0'>
                  <p className='truncate font-bold text-[#202020]'>{parent.nombres || parent.username || 'Padre sin nombre'}</p>
                  <p className='truncate text-sm text-[#5e5e5e]'>{parent.email}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
