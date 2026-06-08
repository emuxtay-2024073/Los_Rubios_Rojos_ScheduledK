import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { activateAdminRole } from '../../../shared/apis';
import { showError, showSuccess } from '../../../shared/utils/toast.js';
import logo from '../../../assets/img/logo_scheduled_img.png';

const activationPromiseByToken = new Map();
const activationResultByToken = new Map();
const toastShownByToken = new Map();

export const ActivateAdminPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (!token) {
        const invalidMessage = 'Token de activacion invalido.';
        setStatus('error');
        setMessage(invalidMessage);

        if (!toastShownByToken.get('invalid-admin-token')) {
          showError(invalidMessage);
          toastShownByToken.set('invalid-admin-token', true);
        }
        return;
      }

      const cached = activationResultByToken.get(token);
      if (cached) {
        if (isMounted) {
          setStatus(cached.status);
          setMessage(cached.message);
        }
        return;
      }

      let promise = activationPromiseByToken.get(token);
      if (!promise) {
        promise = activateAdminRole(token)
          .then((res) => {
            const result = {
              status: 'success',
              message:
                res.data?.message ||
                'Rol admin activado correctamente. Inicia sesion nuevamente para obtener tus permisos.',
            };
            activationResultByToken.set(token, result);
            return result;
          })
          .catch((err) => {
            const result = {
              status: 'error',
              message:
                err.response?.data?.message ||
                'El enlace de activacion admin es invalido o ha expirado.',
            };
            activationResultByToken.set(token, result);
            return result;
          })
          .finally(() => {
            activationPromiseByToken.delete(token);
          });

        activationPromiseByToken.set(token, promise);
      }

      const result = await promise;

      if (isMounted) {
        setStatus(result.status);
        setMessage(result.message);
      }

      if (!toastShownByToken.get(token)) {
        toastShownByToken.set(token, true);
        result.status === 'success' ? showSuccess(result.message) : showError(result.message);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const goToLogin = useCallback(() => navigate('/login'), [navigate]);

  const isSuccess = status === 'success';
  const isLoading = status === 'loading';

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(216,48,48,0.16),transparent_34%),linear-gradient(135deg,#fff9ee_0%,#f7dfb8_48%,#fff3db_100%)] px-4 py-10'>
      <div className='mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center'>
        <section className='w-full max-w-2xl rounded-lg border border-white/70 bg-white/90 px-6 py-9 text-center shadow-2xl backdrop-blur md:px-12 md:py-12'>
          <img src={logo} alt='Los Rubios Rojos Logo' className='mx-auto mb-7 h-24 w-auto' />

          <div className='flex justify-center'>
            {isSuccess ? (
              <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm ring-8 ring-emerald-50'>
                <CheckCircleIcon className='h-16 w-16' />
              </div>
            ) : isLoading ? (
              <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm ring-8 ring-white/60'>
                <div className='h-12 w-12 animate-spin rounded-full border-4 border-solid border-slate-300 border-t-transparent' />
              </div>
            ) : (
              <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 text-rose-700 shadow-sm ring-8 ring-rose-50'>
                <ExclamationTriangleIcon className='h-14 w-14' />
              </div>
            )}
          </div>

          <p className='mb-3 text-xs font-bold uppercase tracking-[0.24em] text-main-blue'>
            Los Rubios Rojos
          </p>
          <h1 className='text-3xl font-bold text-gray-900 md:text-4xl'>
            {isSuccess
              ? 'Rol admin activado'
              : isLoading
                ? 'Activando rol admin...'
                : 'No se pudo activar admin'}
          </h1>
          <p className='mx-auto mt-4 max-w-xl text-base leading-7 text-gray-700'>
            {message ||
              'Estamos validando el enlace temporal enviado a tu correo. Un momento, por favor.'}
          </p>

          {!isLoading && (
            <button
              type='button'
              onClick={goToLogin}
              className='mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-main-blue px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/10 transition hover:opacity-90'
            >
              Iniciar sesion
            </button>
          )}
        </section>
      </div>
    </div>
  );
};
