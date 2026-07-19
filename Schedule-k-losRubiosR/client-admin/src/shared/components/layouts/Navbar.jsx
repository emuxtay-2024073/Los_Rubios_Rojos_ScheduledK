import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { } from '@heroicons/react/24/outline';
import { AvatarUser } from '../ui/AvatarUser.jsx';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import imgLogo from '../../../assets/img/logo_scheduled_img.png';

const buildNavItems = (isAdmin, isSuperAdmin) => [
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  {
    id: 'padres',
    label: 'Padres',
    to: isAdmin
      ? { pathname: '/dashboard/users', search: '?role=PADRE' }
      : { pathname: '/dashboard', hash: '#padres' },
  },
  {
    id: 'docentes',
    label: 'Docentes',
    to: isAdmin
      ? { pathname: '/dashboard/users', search: '?role=COORDINADOR' }
      : { pathname: '/dashboard', hash: '#docentes' },
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    to: isAdmin ? '/dashboard/users' : { pathname: '/dashboard', hash: '#usuarios' },
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
    const hashValue = String(hash || '').replace('#', '').toLowerCase().trim();
    if (hashValue) return hashValue;
  }

  return 'dashboard';
};

export const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.toUpperCase();
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN' || isSuperAdmin;
  
  const location = useLocation();

  const navItems = useMemo(() => buildNavItems(isAdmin, isSuperAdmin), [isAdmin, isSuperAdmin]);
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
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-2 sm:gap-3'>
          <AvatarUser />
        </div>
      </div>

      
    </nav>
  );
};
