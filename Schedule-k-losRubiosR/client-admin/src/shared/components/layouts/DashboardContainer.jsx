import { Navbar } from './Navbar.jsx';

export const DashboardContainer = ({ children }) => {
  return (
    <div className='admin-shell'>
      <div className='admin-ambient admin-ambient-top' aria-hidden='true' />
      <div className='admin-ambient admin-ambient-bottom' aria-hidden='true' />
      <Navbar />
      <main className='admin-main'>
        {children}
      </main>
    </div>
  );
};
