import { CalendarDaysIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const cards = [
  {
    title: 'Próxima cita',
    value: 'Martes, 10:00',
    description: 'Tu reunión con el equipo académico está confirmada.',
    icon: CalendarDaysIcon,
  },
  {
    title: 'Mensajes',
    value: '3',
    description: 'Nuevas comunicaciones del coordinador y el personal.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    title: 'Estado',
    value: 'Al día',
    description: 'Todos tus documentos y solicitudes están completos.',
    icon: ShieldCheckIcon,
  },
];

export const ParentPage = () => {
  return (
    <div className='space-y-8'>
      <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8 lg:p-10'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-2xl space-y-4'>
            <p className='inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700'>Portal padre de familia</p>
            <h1 className='text-4xl font-black tracking-tight text-gray-900 sm:text-5xl'>Vista para padres</h1>
            <p className='text-base text-gray-700 sm:text-lg'>El coordinador asigna la cita y tú recibes la notificación para conocer la fecha, la hora y los detalles de la reunión.</p>
          </div>
          <div className='rounded-3xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm font-semibold text-sky-800'>Acceso personalizado</div>
        </div>
      </section>

      <section className='grid gap-5 md:grid-cols-3'>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-semibold uppercase tracking-[0.2em] text-sky-700'>{card.title}</p>
                <div className='rounded-2xl bg-sky-50 p-2 text-sky-700'>
                  <Icon className='h-5 w-5' />
                </div>
              </div>
              <p className='mt-5 text-3xl font-black text-gray-900'>{card.value}</p>
              <p className='mt-3 text-sm text-gray-600'>{card.description}</p>
            </article>
          );
        })}
      </section>

      <section className='rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='flex items-end justify-between gap-4'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.25em] text-sky-700'>Tu rol</p>
            <h2 className='mt-2 text-2xl font-bold text-gray-900'>Recibe y confirma la cita</h2>
          </div>
          <span className='rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700'>Asignada por el coordinador</span>
        </div>
        <div className='mt-6 grid gap-4 md:grid-cols-2'>
          <div className='rounded-3xl border border-gray-200 bg-gray-50 p-5'>
            <h3 className='text-lg font-semibold text-gray-900'>Notificación de cita</h3>
            <p className='mt-2 text-sm text-gray-600'>Cuando el coordinador programa una reunión, tú recibirás la notificación con fecha, hora y detalles.</p>
          </div>
          <div className='rounded-3xl border border-gray-200 bg-gray-50 p-5'>
            <h3 className='text-lg font-semibold text-gray-900'>Confirmación de asistencia</h3>
            <p className='mt-2 text-sm text-gray-600'>Podrás revisar la información y responder según corresponda, pero la asignación la realiza el coordinador.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
