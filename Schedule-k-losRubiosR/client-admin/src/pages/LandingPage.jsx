import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore.js';
import logo from '../assets/img/logo_scheduled_img.png';

export const LandingPage = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6'>
      <div className='max-w-3xl w-full rounded-[2rem] border border-slate-200 bg-white/95 p-10 shadow-2xl'>
        <div className='flex flex-col items-center gap-6 text-center'>
          <img src={logo} alt='Los Rubios Rojos' className='h-24 w-auto' />
          <div>
            <h1 className='text-4xl font-black tracking-tight text-gray-900 sm:text-5xl'>Los Rubios Rojos</h1>
            <p className='mt-4 text-gray-600 text-lg sm:text-xl'>Bienvenido al sistema de reserva y gestión de citas.</p>
          </div>
          <div className='space-y-4'>
            <p className='text-sm text-gray-500'>
              Presiona el botón para iniciar tu experiencia y acceder a la plataforma.
            </p>
            <StartButton />
          </div>
          <p className='text-sm text-gray-500'>
            Si eres coordinador, accederás a la vista de coordinador; si eres padre o tutor, te llevaremos a tu vista de tutor.
          </p>
        </div>
      </div>
    </div>
  );
};

const StartButton = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const handleStart = () => {
    if (isAuthenticated) {
      const role = user?.role?.toUpperCase();
      if (role?.includes('ADMIN')) navigate('/dashboard');
      else navigate('/cliente');
    } else {
      navigate('/login');
    }
  };

  return (
    <button
      onClick={handleStart}
      className='inline-flex items-center justify-center rounded-full bg-main-blue px-8 py-3 text-base font-semibold text-white transition hover:bg-main-blue/90'
    >
      Inicia tu experiencia
    </button>
  );
};
