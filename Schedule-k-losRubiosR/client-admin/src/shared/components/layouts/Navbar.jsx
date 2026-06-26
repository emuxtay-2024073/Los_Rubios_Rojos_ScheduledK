import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AvatarUser } from '../ui/AvatarUser.jsx';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import imgLogo from '../../../assets/img/logo_scheduled_img.png';

const buildNavItems = (isSuperAdmin) => [
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { id: 'citas', label: 'Citas', to: { pathname: '/dashboard', hash: '#citas' } },
  {
    id: 'padres',
    label: 'Padres',
    to: isSuperAdmin
      ? { pathname: '/dashboard/users', search: '?role=PADRE' }
      : { pathname: '/dashboard', hash: '#padres' },
  },
  {
    id: 'docentes',
    label: 'Docentes',
    to: isSuperAdmin
      ? { pathname: '/dashboard/users', search: '?role=COORDINADOR' }
      : { pathname: '/dashboard', hash: '#docentes' },
  },
  { id: 'reportes', label: 'Reportes', to: { pathname: '/dashboard', hash: '#reportes' } },
  {
    id: 'usuarios',
    label: 'Usuarios',
    to: isSuperAdmin ? '/dashboard/users' : { pathname: '/dashboard', hash: '#usuarios' },
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    to: { pathname: '/dashboard', hash: '#configuracion' },
  },
];

const getActiveNavId = ({ pathname, search, hash }) => {
  const params = new URLSearchParams(search);
  const roleFilter = params.get('role')?.toUpperCase();

  if (pathname.startsWith('/dashboard/users')) {
    if (roleFilter === 'PADRE') return 'padres';
    if (roleFilter === 'COORDINADOR') return 'docentes';
    return 'usuarios';
  }

  if (pathname.startsWith('/dashboard/reservations')) {
    return 'citas';
  }

  if (pathname === '/dashboard' && hash) {
    const normalized = hash.replace('#', '').toLowerCase();
    if (normalized) return normalized;
  }

  return 'dashboard';
};

export const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = useMemo(() => buildNavItems(isSuperAdmin), [isSuperAdmin]);
  const activeNavId = getActiveNavId(location);

  return (
    <nav className='admin-topbar'>
      <div className='admin-topbar__inner'>
        <div className='flex min-w-0 items-center gap-3'>
          <Link to='/dashboard' className='admin-brand'>
            <span className='admin-brand__mark'>
              <img src={imgLogo} alt='ScheduledK' className='h-9 w-auto object-contain' />
            </span>
            <span className='min-w-0'>
              <span className='admin-brand__title'>Rubios Rojos</span>
              <span className='admin-brand__subtitle'>Academic Management</span>
            </span>
          </Link>
        </div>

        <div className='hidden flex-1 items-center justify-center xl:flex'>
          <div className='admin-menu'>
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className={`admin-menu-link ${item.id === activeNavId ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-2 sm:gap-3'>
          <div className='hidden rounded-full border border-[rgba(86,72,231,0.12)] bg-white/80 px-4 py-2 text-xs font-bold text-[#5648E7] shadow-[0_12px_30px_rgba(86,72,231,0.08)] lg:flex'>
            Centro institucional en línea
          </div>
          <button
            type='button'
            className='admin-icon-button relative'
            aria-label='Notificaciones'
          >
            <BellIcon className='h-5 w-5' />
            <span className='admin-notification-badge'>3</span>
          </button>
          <AvatarUser />
          <button
            type='button'
            className='admin-icon-button xl:hidden'
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <XMarkIcon className='h-5 w-5' /> : <Bars3Icon className='h-5 w-5' />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className='admin-mobile-menu xl:hidden'>
          <div className='admin-mobile-menu__panel'>
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className={`admin-mobile-link ${item.id === activeNavId ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
