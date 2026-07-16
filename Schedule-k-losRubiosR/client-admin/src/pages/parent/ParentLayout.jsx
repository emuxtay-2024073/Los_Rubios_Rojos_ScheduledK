import { Outlet } from 'react-router-dom';
import { ClientNavbar } from '../../shared/components/layouts/ClientNavbar.jsx';
import { ClientFooter } from '../../shared/components/layouts/ClientFooter.jsx';

export const ParentLayout = () => {
  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,#F7FBFF_0%,#EEF7FF_100%)] text-gray-800'>
      <ClientNavbar />
      <main className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
};
