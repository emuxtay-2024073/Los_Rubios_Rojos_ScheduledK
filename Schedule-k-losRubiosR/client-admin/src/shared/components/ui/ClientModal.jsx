export const ClientModal = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/30 px-4 py-10 sm:px-6 sm:py-14'>
      <div className='w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]'>
        <div className='flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-main-blue'>Los Rubios Rojos</p>
            <h3 className='mt-1 text-2xl font-bold text-slate-900'>{title}</h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'
          >
            Cerrar
          </button>
        </div>
        <div className='max-h-[calc(100vh-10rem)] overflow-y-auto p-6 sm:p-8'>
          {children}
        </div>
      </div>
    </div>
  );
};