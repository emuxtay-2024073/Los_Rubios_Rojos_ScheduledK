import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowRightOnRectangleIcon, ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import imgLogo from '../../assets/img/logo_scheduled_img.png';
import mascotImg from '../../assets/img/DENTRO_mg.png';

const CoordinatorHeader = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className='admin-topbar'>
      <div className='admin-topbar__inner'>
        <div className='admin-brand min-w-0'>
          <span className='admin-brand__mark'>
            <img src={imgLogo} alt='Los Rubios Rojos' className='h-9 w-auto object-contain' />
          </span>
          <span className='min-w-0'>
            <span className='admin-brand__title'>Portal coordinador</span>
            <span className='admin-brand__subtitle'>Revisión y gestión de citas</span>
          </span>
        </div>

        <div className='hidden items-center gap-2 xl:flex'>
          <span className='portal-mascot-bubble portal-mascot-float h-11 w-11 flex-shrink-0'>
            <img src={mascotImg} alt='Schedulito' />
          </span>
          <span className='admin-soft-pill'>¡Hola, {user?.username || 'coordinador'}! </span>
        </div>

        <div ref={userMenuRef} className='relative'>
          <button
            type='button'
            onClick={() => setOpen((state) => !state)}
            className='admin-profile-trigger px-3 py-1.5'
            aria-haspopup='menu'
            aria-expanded={open}
          >
            <span className='hidden text-left sm:block'>
              <span className='block truncate text-sm font-bold text-[#202020]'>
                {user?.username || 'Coordinador'}
              </span>
              <span className='block truncate text-xs font-semibold text-[#5E5E5E]'>
                {user?.email || 'usuario@correo.com'}
              </span>
            </span>
            <ChevronDownIcon className='h-4 w-4 text-[#5E5E5E]' />
          </button>

          {open && (
            <div className='animate-fadeIn absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-[1.5rem] border border-[rgba(86,72,231,0.12)] bg-white shadow-[0_30px_70px_rgba(0,0,0,0.12)]'>
              <div className='flex items-center gap-3 border-b border-[rgba(86,72,231,0.08)] bg-[linear-gradient(135deg,rgba(221,245,222,0.9),rgba(255,255,255,0.98),rgba(200,241,204,0.68))] px-5 py-4'>
                <span className='portal-mascot-bubble h-10 w-10 flex-shrink-0'>
                  <img src={mascotImg} alt='Schedulito' />
                </span>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-extrabold text-[#202020]'>{user?.username || 'Coordinador'}</p>
                  <p className='truncate text-xs text-[#5E5E5E]'>{user?.email}</p>
                </div>
              </div>
              <div className='p-3'>
                <span className='admin-dropdown-link cursor-default opacity-80'>
                  <UserCircleIcon className='h-5 w-5' />
                  Cuenta de coordinador
                </span>
                <button type='button' onClick={handleLogout} className='admin-dropdown-link text-[#4438D8]'>
                  <ArrowRightOnRectangleIcon className='h-5 w-5' />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export const CoordinatorLayout = () => {
  return (
    <div className='admin-shell'>
      <div className='admin-ambient admin-ambient-top' aria-hidden='true' />
      <div className='admin-ambient admin-ambient-bottom' aria-hidden='true' />
      <CoordinatorHeader />
      <main className='admin-main'>
        <div className='admin-page'>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
