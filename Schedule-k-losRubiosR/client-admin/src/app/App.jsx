//1ro. Importaciones dependencias o librerias de REACT (completas o desestructuradas)
//2do. Librerias o dependencias de terceros
//3ro. Componentes o funciones propias (Las que programamos).
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes.jsx';
import { useAuthStore } from '../features/auth/store/authStore.js';
import { UiConfirmHost } from '../features/auth/components/ConfirmModal.jsx';

export const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoadingAuth = useAuthStore((state) => state.isLoadingAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoadingAuth) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600' />
          <p className='text-slate-600'>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position='top-center'
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            fontWeight: '600',
            fontSize: '1rem',
            borderRadius: '8px',
          },
        }}
      />
      <AppRoutes />
      <UiConfirmHost />
    </>
  );
};
