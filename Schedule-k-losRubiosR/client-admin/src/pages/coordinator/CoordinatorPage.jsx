import { Link } from 'react-router-dom';
import { CalendarDaysIcon, ClipboardDocumentCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const cards = [
  {
    title: 'Citas del día',
    value: '8',
    description: 'Reuniones programadas para seguimiento con padres.',
    icon: CalendarDaysIcon,
  },
  {
    title: 'Familias atendidas',
    value: '24',
    description: 'Padres y tutores con seguimiento activo.',
    icon: UserGroupIcon,
  },
  {
    title: 'Reportes cerrados',
    value: '12',
    description: 'Informes completados en la semana actual.',
    icon: ClipboardDocumentCheckIcon,
  },
];

export const CoordinatorPage = () => {
  return (
    <div className='space-y-8'>
      <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8 lg:p-10'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-2xl space-y-4'>
            <p className='inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700'>Portal coordinador</p>
            <h1 className='text-4xl font-black tracking-tight text-gray-900 sm:text-5xl'>Vista para coordinadores</h1>
            <p className='text-base text-gray-700 sm:text-lg'>Gestiona reuniones con familias, supervisa el estado de las citas y mantén al día los seguimientos institucionales.</p>
          </div>
          <div className='rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800'>Seguimiento activo</div>
        </div>
      </section>

      <section className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        <Link
          to='/coordinador/citas'
          className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-emerald-300'
        >
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700'>1. Asignar citas</p>
          <h3 className='mt-4 text-xl font-black text-gray-900'>Programar cita</h3>
          <p className='mt-3 text-sm text-gray-600'>Selecciona al padre, define fecha/hora y asigna la reunión.</p>
        </Link>

        <Link
          to='/coordinador/parents'
          className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-emerald-300'
        >
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700'>2. Listado de padres</p>
          <h3 className='mt-4 text-xl font-black text-gray-900'>Ver familias</h3>
          <p className='mt-3 text-sm text-gray-600'>Revisa los padres de familia registrados y su información de contacto.</p>
        </Link>

        <Link
          to='/coordinador/calendar'
          className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-emerald-300'
        >
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700'>5. Calendario personal</p>
          <h3 className='mt-4 text-xl font-black text-gray-900'>Mi agenda</h3>
          <p className='mt-3 text-sm text-gray-600'>Consulta tu calendario personal con citas y horarios asignados.</p>
        </Link>

        <Link
          to='/coordinador/messages'
          className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-emerald-300'
        >
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700'>4. Mensaje general</p>
          <h3 className='mt-4 text-xl font-black text-gray-900'>Enviar notificación</h3>
          <p className='mt-3 text-sm text-gray-600'>Envía un mensaje general a todas las personas que usan la app.</p>
        </Link>

        <Link
          to='/coordinador/citas'
          className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-emerald-300'
        >
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700'>3. Listado de citas</p>
          <h3 className='mt-4 text-xl font-black text-gray-900'>Ver citas</h3>
          <p className='mt-3 text-sm text-gray-600'>Accede al listado de citas programadas y su estado.</p>
        </Link>
      </section>
    </div>
  );
};
