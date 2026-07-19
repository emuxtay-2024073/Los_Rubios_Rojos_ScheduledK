import logo from '../../../assets/img/logo_scheduled_img.png';

export const ClientModal = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div className='portal-modal-backdrop'>
      <div className='w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[rgba(86,72,231,0.12)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]'>
        <div className='flex flex-col gap-3 border-b border-[rgba(86,72,231,0.08)] bg-[linear-gradient(135deg,rgba(221,245,222,0.65),rgba(255,255,255,0.98))] px-6 py-5 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <img src={logo} alt='Los Rubios Rojos' className='h-9 w-auto object-contain' />
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#5648e7]'>Los Rubios Rojos</p>
              <h3 className='mt-1 text-2xl font-bold text-[#202020]'>{title}</h3>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='admin-button-secondary self-start px-4 py-2 text-sm sm:self-auto'
          >
            Cerrar
          </button>
        </div>
        <div className='max-h-[calc(100vh-14rem)] overflow-y-auto p-6 sm:p-8'>
          {children}
        </div>
      </div>
    </div>
  );
};
