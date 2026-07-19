import logo from '../../../assets/img/logo_scheduled_img.png';

export const ClientFooter = () => {
  return (
    <footer className='relative mt-6 border-t border-[rgba(86,72,231,0.08)] bg-white/80 backdrop-blur'>
      <div className='mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-[#5e5e5e] sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8'>
        <div className='flex items-center gap-3'>
          <img src={logo} alt='Los Rubios Rojos' className='h-8 w-auto opacity-80' />
          <div>
            <p className='font-bold text-[#202020]'>Los Rubios Rojos · Schedule-K</p>
            <p className='text-xs text-[#5e5e5e]'>Sistema de gestión de citas.</p>
          </div>
        </div>
        <p className='text-xs uppercase tracking-[0.18em] text-[#5e5e5e]'>Hecho con ❤️ para nuestras familias</p>
      </div>
    </footer>
  );
};
