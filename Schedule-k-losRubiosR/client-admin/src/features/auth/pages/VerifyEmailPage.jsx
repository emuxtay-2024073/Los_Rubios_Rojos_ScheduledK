import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
import logo from '../../../assets/img/logo_scheduled_img.png';

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = new URLSearchParams(location.search).get('token');

  const handleFinish = useCallback(
    (status) => {
      if (status === 'success') {
        setTimeout(() => navigate('/login'), 4500);
      }
    },
    [navigate],
  );

  const { status, message } = useVerifyEmail(token, handleFinish);

  const renderIcon = () => {
    if (status === 'success') {
      return (
        <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm ring-8 ring-emerald-50'>
          <CheckCircleIcon className='h-16 w-16' />
        </div>
      );
    }

    if (status === 'loading') {
      return (
        <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm ring-8 ring-white/60'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-solid border-slate-300 border-t-transparent' />
        </div>
      );
    }

    return (
      <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 text-rose-700 shadow-sm ring-8 ring-rose-50'>
        <ExclamationTriangleIcon className='h-14 w-14' />
      </div>
    );
  };

  const renderTitle = () => {
    if (status === 'success') return 'Cuenta verificada con exito';
    if (status === 'loading') return 'Verificando tu cuenta...';
    return 'No se pudo verificar tu cuenta';
  };

  const renderSubtitle = () => {
    if (status === 'success') {
      return 'Tu correo fue confirmado correctamente. Ahora puedes iniciar sesion con tu email y contrasena.';
    }

    if (status === 'loading') {
      return 'Estamos confirmando el enlace enviado a tu correo. Un momento, por favor.';
    }

    return (
      message ||
      'El enlace de verificacion es invalido o ha expirado. Comprueba el correo de confirmacion e intenta de nuevo.'
    );
  };

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(216,48,48,0.16),transparent_34%),linear-gradient(135deg,#fff9ee_0%,#f7dfb8_48%,#fff3db_100%)] px-4 py-10'>
      <div className='mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center'>
        <section className='w-full max-w-2xl rounded-lg border border-white/70 bg-white/90 px-6 py-9 text-center shadow-2xl backdrop-blur md:px-12 md:py-12'>
          <img src={logo} alt='Los Rubios Rojos Logo' className='mx-auto mb-7 h-24 w-auto' />

          <div className='flex justify-center'>{renderIcon()}</div>

          <p className='mb-3 text-xs font-bold uppercase tracking-[0.24em] text-main-blue'>
            Los Rubios Rojos
          </p>
          <h1 className='text-3xl font-bold text-gray-900 md:text-4xl'>{renderTitle()}</h1>
          <p className='mx-auto mt-4 max-w-xl text-base leading-7 text-gray-700'>{renderSubtitle()}</p>

          {status === 'success' && (
            <div className='mx-auto mt-7 max-w-md rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800'>
              Ya puedes entrar con el mismo correo y contrasena que registraste.
            </div>
          )}

          <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
            {status !== 'loading' && (
              <button
                type='button'
                onClick={() => navigate('/login')}
                className='inline-flex min-h-11 items-center justify-center rounded-full bg-main-blue px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/10 transition hover:opacity-90'
              >
                Iniciar sesion
              </button>
            )}
          </div>

          {status === 'success' && (
            <p className='mt-4 text-sm text-gray-600'>Te llevaremos al login en unos segundos.</p>
          )}
        </section>
      </div>
    </div>
  );
};
