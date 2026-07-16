import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import imgLogo from '../../assets/img/logo_scheduled_img.png';

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
    <header className='sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm'>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-3'>
          <img src={imgLogo} alt='Los Rubios Rojos' className='h-11 w-auto object-contain' />
          <div>
            <p className='text-sm font-semibold text-slate-900'>Portal coordinador</p>
            <p className='text-xs text-slate-500'>Revisión y gestión de citas</p>
          </div>
        </div>

        <div ref={userMenuRef} className='relative'>
          <button
            type='button'
            onClick={() => setOpen((state) => !state)}
            className='inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-white px-5 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50'
          >
            <span>{user?.email || 'usuario@correo.com'}</span>
            <ChevronDownIcon className='h-4 w-4' />
          </button>

          {open && (
            <div className='absolute right-0 mt-2 w-44 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg'>
              <button
                type='button'
                onClick={handleLogout}
                className='w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100'
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const CoordinatorLayout = () => {
  return (
    <div className='min-h-screen bg-[#f8fbff] text-slate-900'>
      <CoordinatorHeader />
      <main className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <Outlet />
      </main>
    </div>
  );
};
