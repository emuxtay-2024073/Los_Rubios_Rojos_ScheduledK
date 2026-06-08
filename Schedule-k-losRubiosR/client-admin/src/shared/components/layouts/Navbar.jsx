import { BellIcon, ChartBarSquareIcon } from '@heroicons/react/24/outline';
import { AvatarUser } from '../ui/AvatarUser.jsx';
import imgLogo from '../../../assets/img/logo_scheduled_img.png';

export const Navbar = () => {
  return (
    <nav className='sticky top-0 z-50 border-b border-[#7C2D12]/10 bg-white/90 shadow-[0_10px_35px_rgba(124,45,18,0.08)] backdrop-blur-xl'>
      <div className='mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF7ED] ring-1 ring-[#7C2D12]/10'>
            <img
              src={imgLogo}
              alt='Los Rubios Rojos Logo'
              className='h-8 w-auto object-contain'
            />
          </div>
          <div className='min-w-0'>
            <p className='truncate text-sm font-black text-[#1F2937]'>Los Rubios Rojos Admin</p>
            <p className='hidden text-xs font-semibold text-[#6B7280] sm:block'>
              Centro de control gastronómico
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 sm:gap-3'>
          <div className='hidden items-center gap-2 rounded-full border border-[#7C2D12]/10 bg-[#FFF7ED] px-3 py-2 text-xs font-bold text-[#7C2D12] md:flex'>
            <ChartBarSquareIcon className='h-4 w-4 text-[#DC2626]' />
            Operación en vivo
          </div>
          <button
            type='button'
            className='relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#7C2D12]/10 bg-white text-[#1F2937] shadow-sm transition hover:-translate-y-0.5 hover:text-[#DC2626]'
            aria-label='Notificaciones'
          >
            <BellIcon className='h-5 w-5' />
            <span className='absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F59E0B]' />
          </button>
          <AvatarUser />
        </div>
      </div>
    </nav>
  );
};
