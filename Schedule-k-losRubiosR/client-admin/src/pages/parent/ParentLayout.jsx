import { Outlet } from 'react-router-dom';
import { ClientNavbar } from '../../shared/components/layouts/ClientNavbar.jsx';
import { ClientFooter } from '../../shared/components/layouts/ClientFooter.jsx';

export const ParentLayout = () => {
  return (
    <div className='admin-shell flex min-h-screen flex-col'>
      <div className='admin-ambient admin-ambient-top' aria-hidden='true' />
      <div className='admin-ambient admin-ambient-bottom' aria-hidden='true' />
      <ClientNavbar />
      <main className='admin-main flex-1'>
        <div className='admin-page'>
          <Outlet />
        </div>
      </main>
      <ClientFooter />
    </div>
  );
};
