import { useEffect } from 'react';
import { useUserManagementStore } from '../../features/auth/store/useUserManagementStore.js';
import { Spinner } from '../../features/auth/components/Spinner.jsx';
import { BackButton } from '../../shared/components/ui/BackButton.jsx';

export const CoordinatorParentsPage = () => {
  const { users, loading, getAllUsers } = useUserManagementStore();

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const parents = users.filter((item) => (item.role || '').toUpperCase() === 'PADRE');

  return (
    <div className='space-y-6'>
      <BackButton />
      <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700'>Listado de padres</p>
          <h1 className='mt-4 text-3xl font-black text-gray-900'>Familias registradas</h1>
          <p className='mt-3 text-sm text-gray-600'>Revisa los padres de familia que están activos en la aplicación.</p>
        </div>
      </section>

      <section className='rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm'>
        <h2 className='text-xl font-bold text-gray-900'>Padres de familia</h2>
        {loading ? (
          <div className='mt-6'>
            <Spinner />
          </div>
        ) : parents.length === 0 ? (
          <p className='mt-4 text-sm text-gray-600'>Aún no hay padres registrados en el sistema.</p>
        ) : (
          <div className='mt-6 space-y-4'>
            {parents.map((parent) => (
              <article key={parent._id || parent.id || parent.email} className='rounded-3xl border border-gray-200 p-4'>
                <p className='font-semibold text-gray-900'>{parent.nombres || parent.username || 'Padre sin nombre'}</p>
                <p className='text-sm text-gray-600'>{parent.email}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
