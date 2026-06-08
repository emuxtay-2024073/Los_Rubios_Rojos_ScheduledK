import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import { useState } from 'react';
import {
  Bars3Icon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ClipboardDocumentListIcon,
  RectangleGroupIcon,
  Squares2X2Icon,
  TableCellsIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export const Sidebar = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { label: 'Dashboard', to: '/dashboard', icon: Squares2X2Icon },
    { label: 'Restaurantes', to: '/dashboard/restaurants', icon: BuildingStorefrontIcon },
    { label: 'Mesas', to: '/dashboard/tables', icon: TableCellsIcon },
    { label: 'Menús', to: '/dashboard/menus', icon: RectangleGroupIcon },
    { label: 'Órdenes', to: '/dashboard/orders', icon: ClipboardDocumentListIcon },
    { label: 'Reservaciones', to: '/dashboard/reservations', icon: CalendarDaysIcon },
    { label: 'Reseñas', to: '/dashboard/reviews', icon: ChatBubbleLeftRightIcon },
    ...(isSuperAdmin ? [{ label: 'Usuarios', to: '/dashboard/users', icon: UserGroupIcon }] : []),
  ];

  const isActive = (itemTo) => {
    if (itemTo === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === itemTo || location.pathname.startsWith(`${itemTo}/`);
  };

  return (
    <aside
      className={`shrink-0 border-r border-white/10 bg-[#1f2937] text-white shadow-2xl transition-[width] duration-250 md:min-h-[calc(100vh-4rem)] ${collapsed ? 'md:w-24' : 'md:w-72'}`}
    >
      <div className='flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 md:px-5'>
        <div className={`hidden min-w-0 md:block ${collapsed ? 'md:hidden' : ''}`}>
          <p className='text-xs font-black uppercase tracking-[0.16em] text-[#f59e0b]'>Control gastronómico</p>
          <h2 className='truncate text-lg font-black text-white'>Los Rubios Rojos</h2>
        </div>
        <Bars3Icon className='h-6 w-6 text-[#f59e0b] md:hidden' />
        <button
          type='button'
          onClick={() => setCollapsed((value) => !value)}
          className='hidden rounded-full border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15 md:inline-flex'
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronDoubleRightIcon className='h-4 w-4' /> : <ChevronDoubleLeftIcon className='h-4 w-4' />}
        </button>
      </div>

      <ul className='flex gap-2 overflow-x-auto px-4 py-3 md:flex-col md:overflow-visible md:px-3 md:py-5'>
        {items.map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <li key={item.to} className='shrink-0'>
              <Link
                to={item.to}
                className={`admin-nav-item px-4 py-3 text-sm font-extrabold md:justify-start ${active ? 'active' : ''} ${collapsed ? 'md:justify-center md:px-3' : ''}`}
                title={item.label}
              >
                <Icon className='h-5 w-5 shrink-0' />
                <span className={`whitespace-nowrap ${collapsed ? 'md:hidden' : ''}`}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={`mx-4 mb-5 hidden rounded-2xl border border-white/10 bg-white/10 p-4 md:block ${collapsed ? 'md:hidden' : ''}`}>
        <p className='text-xs font-bold uppercase tracking-[0.14em] text-[#f59e0b]'>Rol activo</p>
        <p className='mt-1 truncate text-sm font-semibold text-white'>{isSuperAdmin ? 'SuperAdministrador' : 'Administrador'}</p>
        <div className='mt-3 admin-progress bg-white/10'>
          <span style={{ width: isSuperAdmin ? '92%' : '76%' }} />
        </div>
      </div>
    </aside>
  );
};
