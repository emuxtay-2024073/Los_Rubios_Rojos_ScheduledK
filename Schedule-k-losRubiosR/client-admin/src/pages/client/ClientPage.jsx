import { Link } from 'react-router-dom';

export const ClientPage = () => {
  return (
    <div className='space-y-10'>
      <section className='grid items-center gap-8 overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10'>
        <div className='space-y-6'>
          <p className='inline-flex rounded-full border border-main-blue/20 bg-surface-soft px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-main-blue'>
            Portal cliente
          </p>
          <div className='space-y-4'>
            <h1 className='max-w-2xl text-4xl font-black tracking-tight text-gray-900 sm:text-5xl'>
              Schedule-K - Sistema de Gestión de Citas
            </h1>
            <p className='max-w-2xl text-base text-gray-700 sm:text-lg'>
              Gestiona tus citas de manera eficiente. Accede a tu calendario,
              revisa tus próximas citas y mantente organizado.
            </p>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Link
              to='/cliente/reservations'
              className='rounded-3xl border border-main-blue bg-main-blue px-6 py-4 text-center font-bold text-white shadow-lg transition hover:bg-main-blue/90'
            >
              Ver mis Reservas
            </Link>
          </div>
        </div>
        <div className='grid gap-4'>
          <div className='rounded-3xl border border-gray-200 bg-card p-6 shadow-sm'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-main-blue'>Bienvenido</p>
            <p className='mt-3 text-lg font-semibold text-gray-900'>
              Tu portal personal para gestionar citas
            </p>
          </div>
        </div>
      </section>

      <section className='space-y-5'>
        <div className='flex items-end justify-between gap-4'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>Acciones rápidas</p>
            <h2 className='mt-1 text-2xl font-bold text-gray-900'>Gestiona tus citas</h2>
          </div>
          <Link to='/cliente/reservations' className='text-sm font-semibold text-main-blue hover:underline'>
            Ver todas
          </Link>
        </div>
        <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
          <Link
            to='/cliente/reservations'
            className='rounded-3xl border border-gray-200 bg-card p-6 shadow-sm transition hover:border-main-blue hover:shadow-md'
          >
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-main-blue'>Reservas</p>
            <p className='mt-3 text-lg font-semibold text-gray-900'>Ver mis citas</p>
          </Link>
        </div>
      </section>
    </div>
  );
};
