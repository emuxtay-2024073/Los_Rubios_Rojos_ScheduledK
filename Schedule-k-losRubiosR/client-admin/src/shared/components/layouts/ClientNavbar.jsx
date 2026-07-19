import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import imgLogo from '../../../assets/img/logo_scheduled_img.png';
import mascotImg from '../../../assets/img/DENTRO_mg.png';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

export const ClientNavbar = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const userRole = user?.role ? String(user.role).toUpperCase() : '';
  const basePath = userRole === 'PADRE' ? '/padre' : '/cliente';
  const navItems = [
    { label: 'Ver mis citas', to: `${basePath}/reservations` },
  ];

  useEffect(() => {
    const onDoc = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className='admin-topbar'>
      <div className='admin-topbar__inner'>
        <Link to={basePath} className='admin-brand'>
          <span className='admin-brand__mark'>
            <img src={imgLogo} alt='Los Rubios Rojos' className='h-9 w-auto object-contain' />
          </span>
          <span className='min-w-0'>
            <span className='admin-brand__title'>Los Rubios Rojos</span>
            <span className='admin-brand__subtitle'>{userRole === 'PADRE' ? 'Portal de familia' : 'Experiencia cliente'}</span>
          </span>
        </Link>

        <div className='hidden flex-1 items-center justify-center xl:flex'>
          <div className='admin-menu'>
            <NavLink
              to={basePath}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={({ isActive }) => `admin-menu-link ${isActive ? 'active' : ''}`}
            >
              Inicio
            </NavLink>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `admin-menu-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-2 sm:gap-3'>
          <span className='portal-mascot-bubble portal-mascot-float hidden h-11 w-11 flex-shrink-0 lg:inline-flex'>
            <img src={mascotImg} alt='Schedulito' />
          </span>

          <div className='relative' ref={ref}>
            {user ? (
              <button
                type='button'
                onClick={() => setOpen((state) => !state)}
                className='admin-profile-trigger px-3 py-1.5'
                aria-haspopup='menu'
                aria-expanded={open}
              >
                <span className='hidden text-left sm:block'>
                  <span className='block truncate text-sm font-bold text-[#202020]'>
                    {user.username || user.email || 'Usuario'}
                  </span>
                </span>
                <ChevronDownIcon className='h-4 w-4 text-[#5E5E5E]' />
              </button>
            ) : null}

            {open && (
              <div className='animate-fadeIn absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-[1.5rem] border border-[rgba(86,72,231,0.12)] bg-white shadow-[0_30px_70px_rgba(0,0,0,0.12)]'>
                <div className='flex items-center gap-3 border-b border-[rgba(86,72,231,0.08)] bg-[linear-gradient(135deg,rgba(221,245,222,0.9),rgba(255,255,255,0.98),rgba(200,241,204,0.68))] px-5 py-4'>
                  <span className='portal-mascot-bubble h-10 w-10 flex-shrink-0'>
                    <img src={mascotImg} alt='Schedulito' />
                  </span>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-extrabold text-[#202020]'>{user?.username || 'Usuario'}</p>
                    <p className='truncate text-xs text-[#5E5E5E]'>{user?.email}</p>
                  </div>
                </div>
                <div className='p-3'>
                  <button type='button' onClick={handleLogout} className='admin-dropdown-link text-[#4438D8]'>
                    <ArrowRightOnRectangleIcon className='h-5 w-5' />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
