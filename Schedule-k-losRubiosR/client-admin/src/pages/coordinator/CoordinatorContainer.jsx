import { Outlet } from 'react-router-dom';

export const CoordinatorContainer = () => {
  return (
    <div className='min-h-screen bg-[#f8fbff] text-slate-900'>
      <main className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <Outlet />
      </main>
    </div>
  );
};
