import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import defaultAvatarImg from '../../../assets/img/avatarDefault-1749508519496.png';

const isLegacyBrokenDefaultAvatar = (value) => {
  if (!value || typeof value !== 'string') return false;
  const normalized = value.toLowerCase();
  return (
    normalized.includes('avatardefault-1749508519496') ||
    normalized.includes('/image/upload/v1769785926')
  );
};

export const AvatarUser = () => {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const avatarSrc =
    user?.profilePicture &&
    user.profilePicture.trim() !== '' &&
    !isLegacyBrokenDefaultAvatar(user.profilePicture)
      ? user.profilePicture
      : defaultAvatarImg;

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        type='button'
        onClick={() => setOpen((value) => !value)}
        className='admin-profile-trigger'
        aria-haspopup='menu'
        aria-expanded={open}
      >
        <img
          src={avatarSrc}
          alt={user?.username || 'Usuario'}
          className='h-11 w-11 rounded-full object-cover ring-2 ring-[rgba(86,72,231,0.14)]'
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = defaultAvatarImg;
          }}
        />
        <span className='hidden min-w-0 text-left lg:block'>
          <span className='block truncate text-sm font-bold text-[#202020]'>
            {user?.username || 'Panel institucional'}
          </span>
          <span className='block truncate text-xs font-semibold text-[#5E5E5E]'>
            {isSuperAdmin ? 'Superadministrador' : 'Administrador'}
          </span>
        </span>
        <ChevronDownIcon className='hidden h-4 w-4 text-[#5E5E5E] lg:block' />
      </button>

      {open && (
        <div className='animate-fadeIn absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-[1.5rem] border border-[rgba(86,72,231,0.12)] bg-white shadow-[0_30px_70px_rgba(0,0,0,0.12)]'>
          <div className='border-b border-[rgba(86,72,231,0.08)] bg-[linear-gradient(135deg,rgba(221,245,222,0.9),rgba(255,255,255,0.98),rgba(200,241,204,0.68))] px-5 py-4'>
            <p className='truncate text-base font-extrabold text-[#202020]'>{user?.username}</p>
            <p className='truncate text-sm text-[#5E5E5E]'>{user?.email}</p>
          </div>

          <div className='p-3'>
            <Link to='/dashboard' className='admin-dropdown-link'>
              <UserCircleIcon className='h-5 w-5' />
              Mi panel
            </Link>

            {isSuperAdmin && (
              <Link to='/dashboard/users' className='admin-dropdown-link'>
                <UserCircleIcon className='h-5 w-5' />
                Gestión de usuarios
              </Link>
            )}

            <button
              type='button'
              onClick={handleLogout}
              className='admin-dropdown-link text-[#4438D8]'
            >
              <ArrowRightOnRectangleIcon className='h-5 w-5' />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
