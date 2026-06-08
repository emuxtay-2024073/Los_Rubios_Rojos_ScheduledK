import { Outlet } from 'react-router-dom';
import { ClientNavbar } from '../../shared/components/layouts/ClientNavbar.jsx';
import { ClientFooter } from '../../shared/components/layouts/ClientFooter.jsx';

export const ClientLayout = () => {
  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,rgba(216,48,48,0.12),transparent_28%),linear-gradient(180deg,#FFF9EE_0%,#FFF3DB_100%)] text-gray-800'>
      <ClientNavbar />
      <main className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
};