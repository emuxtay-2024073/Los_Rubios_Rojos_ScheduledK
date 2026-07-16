import { BackButton } from '../../shared/components/ui/BackButton.jsx';

export const CoordinatorMessagesPage = () => {
  return (
    <div className='space-y-6'>
      <BackButton />
      <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700'>Mensaje general</p>
          <h1 className='mt-4 text-3xl font-black text-gray-900'>Comunicar a todos</h1>
          <p className='mt-3 text-sm text-gray-600'>Envía un mensaje general a todas las personas que usan la aplicación.</p>
        </div>
      </section>

      <section className='rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='h-[24rem] rounded-3xl bg-slate-50 p-6 text-gray-600'>
          <p className='text-sm font-semibold'>Función de mensaje general</p>
          <p className='mt-3 text-sm text-gray-500'>Aquí puedes integrar el módulo de envío de notificaciones o correo masivo para comunicar novedades a todos.</p>
        </div>
      </section>
    </div>
  );
};
