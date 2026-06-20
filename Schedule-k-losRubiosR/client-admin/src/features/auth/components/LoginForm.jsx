import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';

export const LoginForm = ({ onForgot, onRegister }) => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const [verificationUrl, setVerificationUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setVerificationUrl('');
    const res = await login(data);

    if (res.success) {
      const role = res.role || user?.role || 'CLIENTE';
      const isAdmin = role?.toUpperCase()?.includes('ADMIN');
      navigate(isAdmin ? '/dashboard' : '/cliente');
      toast.success(`Bienvenido ${isAdmin ? 'administrador' : 'cliente'}!`, { duration: 3000 });
      return;
    }

    if (res.verificationUrl) {
      setVerificationUrl(res.verificationUrl);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-6 py-5 text-lg text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-[#4a6fa5] focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]/20';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-2 block text-base font-semibold text-[#1e2d4a]">
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          placeholder="Ingresa tu correo"
          className={inputClass}
          {...register('email', { required: 'Este campo es obligatorio' })}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="mb-2 block text-base font-semibold text-[#1e2d4a]">
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Ingresa tu contraseña"
            className={`${inputClass} pr-12`}
            {...register('password', { required: 'Este campo es obligatorio' })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            tabIndex={-1}
          >
            {showPassword ? (
              /* eye-off */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-.9.27-1.76.75-2.53M9.88 9.88A3 3 0 0115 12m0 0a3 3 0 01-5.12 2.12M3 3l18 18" />
              </svg>
            ) : (
              /* eye */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Forgot password */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgot}
          className="text-base text-slate-500 hover:text-[#4a6fa5] transition"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* API error */}
      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}

      {/* Unverified account */}
      {verificationUrl && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-900">
          <p className="font-semibold">Tu cuenta todavía no está verificada.</p>
          <a
            href={verificationUrl}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#4a6fa5] px-4 py-4 text-base font-semibold text-white transition hover:opacity-90"
          >
            Verificar mi cuenta
          </a>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#4a6fa5] px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-[#4a6fa5]/25 transition hover:bg-[#3d5d8a] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>

      {/* Register link */}
      <p className="text-center text-base text-slate-500">
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={onRegister}
          className="font-semibold text-[#4a6fa5] hover:underline"
        >
          Regístrate
        </button>
      </p>
    </form>
  );
};
