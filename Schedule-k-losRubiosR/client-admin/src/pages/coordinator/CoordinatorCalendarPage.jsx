const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const appointments = [
  {
    day: 2,
    title: 'Cita familia Pérez',
    time: '09:30 - 10:00',
    tag: 'Reunión familiar',
    color: 'bg-emerald-100 text-emerald-900',
  },
  {
    day: 4,
    title: 'Sesión pedagógica',
    time: '11:00 - 11:45',
    tag: 'Plan académico',
    color: 'bg-amber-100 text-amber-900',
  },
  {
    day: 5,
    title: 'Revisión de agenda',
    time: '14:00 - 14:30',
    tag: 'Organización',
    color: 'bg-sky-100 text-sky-900',
  },
  {
    day: 6,
    title: 'Cita familia Rodríguez',
    time: '16:00 - 16:30',
    tag: 'Reunión familiar',
    color: 'bg-violet-100 text-violet-900',
  },
];

import { BackButton } from '../../shared/components/ui/BackButton.jsx';

export const CoordinatorCalendarPage = () => {
  return (
    <div className='space-y-8'>
      <BackButton />
      <section className='rounded-[2rem] border border-white/80 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-8 shadow-xl sm:p-10'>
        <div className='max-w-5xl'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700'>Calendario personal</p>
          <h1 className='mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl'>Agenda del coordinador</h1>
          <p className='mt-4 max-w-2xl text-base text-slate-600 sm:text-lg'>Visualiza tus próximas citas y tu disponibilidad semanal en un calendario amplio y estético.</p>
        </div>
      </section>

      <section className='rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl sm:p-8'>
        <div className='grid gap-6 lg:grid-cols-[1.18fr_0.82fr]'>
          <div className='rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-inner'>
            <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-500'>Vista semanal</p>
                <h2 className='mt-3 text-2xl font-black text-slate-900'>Calendario de actividades</h2>
              </div>
              <div className='grid gap-2 sm:grid-cols-3'>
                <div className='rounded-3xl bg-white px-4 py-3 text-sm shadow-sm'>
                  <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>Citas</p>
                  <p className='mt-2 text-xl font-black text-slate-900'>4</p>
                </div>
                <div className='rounded-3xl bg-white px-4 py-3 text-sm shadow-sm'>
                  <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>Libres</p>
                  <p className='mt-2 text-xl font-black text-slate-900'>3</p>
                </div>
                <div className='rounded-3xl bg-white px-4 py-3 text-sm shadow-sm'>
                  <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>Tareas</p>
                  <p className='mt-2 text-xl font-black text-slate-900'>2</p>
                </div>
              </div>
            </div>

            <div className='grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm'>
              <div className='grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                {days.map((day) => (
                  <div key={day} className='py-2'>{day}</div>
                ))}
              </div>
              <div className='grid grid-cols-7 gap-2 text-sm text-slate-600'>
                {Array.from({ length: 35 }).map((_, index) => {
                  const date = index + 1;
                  const appointment = appointments.find((item) => item.day === date);

                  return (
                    <div
                      key={index}
                      className={`min-h-[8rem] overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 ${
                        appointment ? 'bg-slate-50' : 'bg-white'
                      }`}
                    >
                      <div className='mb-3 flex items-center justify-between'>
                        <span className='text-sm font-semibold text-slate-900'>{date <= 31 ? date : ''}</span>
                        {appointment && <span className='h-2.5 w-2.5 rounded-full bg-emerald-500' />}
                      </div>
                      {appointment ? (
                        <div className='space-y-2 rounded-3xl border border-slate-200 bg-white p-3'>
                          <p className='text-sm font-bold text-slate-900'>{appointment.title}</p>
                          <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>{appointment.time}</p>
                          <span className={`inline-flex rounded-full px-2 py-1 text-[0.72rem] font-semibold ${appointment.color}`}>{appointment.tag}</span>
                        </div>
                      ) : (
                        <div className='h-20 rounded-2xl bg-slate-100' />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-500'>Próxima cita</p>
              <h3 className='mt-3 text-2xl font-black text-slate-900'>Cita con familia Pérez</h3>
              <p className='mt-2 text-sm text-slate-600'>Martes 19 de julio • 09:30 - 10:00</p>
              <div className='mt-5 space-y-3'>
                <p className='text-sm text-slate-700'>Tema: Seguimiento académico y propuestas de mejoras.</p>
                <p className='rounded-3xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-900'>Confirmada</p>
              </div>
            </div>

            <div className='rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-500'>Resumen semanal</p>
              <ul className='mt-4 space-y-4'>
                <li className='flex items-start gap-3'>
                  <span className='mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500' />
                  <div>
                    <p className='font-semibold text-slate-900'>4 citas programadas</p>
                    <p className='text-sm text-slate-600'>Mantén el ritmo con las familias asignadas.</p>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='mt-1 h-2.5 w-2.5 rounded-full bg-amber-500' />
                  <div>
                    <p className='font-semibold text-slate-900'>2 reuniones internas</p>
                    <p className='text-sm text-slate-600'>Tiempo reservado para coordinación educativa.</p>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='mt-1 h-2.5 w-2.5 rounded-full bg-sky-500' />
                  <div>
                    <p className='font-semibold text-slate-900'>3 bloques libres</p>
                    <p className='text-sm text-slate-600'>Perfecto para nuevas citas o ajustes.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
