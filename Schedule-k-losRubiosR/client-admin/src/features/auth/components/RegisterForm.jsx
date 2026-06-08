import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export const RegisterForm = ({ onLogin }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerUser = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const password = useWatch({ control, name: 'password', defaultValue: '' });

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    const payload = {
      email: data.email,
      password: data.password,
      username: data.username || undefined,
      nombres: data.nombres || undefined,
      apellidos: data.apellidos || undefined,
      numero: data.numero || undefined,
    };

    const { success, message, verificationUrl: link } = await registerUser(payload);

    if (!success) {
      toast.error(message || 'No se pudo crear la cuenta');
      return;
    }

    setSuccessMessage(message);
    setVerificationUrl(link);

    if (link) {
      toast.success('Cuenta creada. Usa el enlace de verificación mostrado.', { duration: 4000 });
      return;
    }

    toast.success('Revisa tu correo para verificar tu cuenta.', { duration: 3000 });
    setTimeout(() => onLogin(), 2500);
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-6 py-5 text-lg text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-[#4a6fa5] focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]/20';
  

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-[3.2rem] font-black text-[#1e2d4a] leading-tight mb-2">Crear cuenta</h2>
        <p className="text-lg text-slate-400 leading-relaxed">Regístrate como padre para gestionar reservas y coordinar con tu institución.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* El rol se asigna por defecto como Padre. Administradores pueden cambiar roles desde el panel de administración. */}

      <div>
        <label htmlFor="email" className="mb-2 block text-base font-semibold text-[#1e2d4a]">
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="correo@example.com"
          className={inputClass}
          {...register('email', {
            required: 'El correo es obligatorio',
          })}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Campos requeridos para Padre */}
      <>
        <>
          <div>
            <label htmlFor="username" className="mb-2 block text-base font-semibold text-[#1e2d4a]">
              Nombre de usuario
            </label>
            <input
              type="text"
              id="username"
              placeholder="usuario123"
              className={inputClass}
              {...register('username', {
                required: 'El nombre de usuario es obligatorio',
              })}
            />
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="nombres" className="mb-2 block text-base font-semibold text-[#1e2d4a]">
              Nombres
            </label>
            <input
              type="text"
              id="nombres"
              placeholder="Juan Carlos"
              className={inputClass}
              {...register('nombres', { required: 'Los nombres son obligatorios' })}
            />
            {errors.nombres && <p className="mt-1 text-xs text-red-500">{errors.nombres.message}</p>}
          </div>

          <div>
            <label htmlFor="apellidos" className="mb-2 block text-base font-semibold text-[#1e2d4a]">
              Apellidos
            </label>
            <input
              type="text"
              id="apellidos"
              placeholder="Pérez Gómez"
              className={inputClass}
              {...register('apellidos', { required: 'Los apellidos son obligatorios' })}
            />
            {errors.apellidos && <p className="mt-1 text-xs text-red-500">{errors.apellidos.message}</p>}
          </div>

          <div>
            <label htmlFor="numero" className="mb-2 block text-base font-semibold text-[#1e2d4a]">
              Número de teléfono
            </label>
            <input
              type="tel"
              id="numero"
              placeholder="50505050"
              className={inputClass}
              {...register('numero', { required: 'El número es obligatorio' })}
            />
            {errors.numero && <p className="mt-1 text-xs text-red-500">{errors.numero.message}</p>}
          </div>
        </>
      </>

      <div>
        <label htmlFor="password" className="mb-2 block text-base font-semibold text-[#1e2d4a]">
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="* * * * * * *"
            className={`${inputClass} pr-12`}
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-.9.27-1.76.75-2.53M9.88 9.88A3 3 0 0115 12m0 0a3 3 0 01-5.12 2.12M3 3l18 18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-base font-semibold text-[#1e2d4a]">
          Confirmar contraseña
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            placeholder="* * * * * * *"
            className={`${inputClass} pr-12`}
            {...register('confirmPassword', {
              required: 'Debes confirmar la contraseña',
              validate: (value) => value === password || 'Las contraseñas no coinciden',
            })}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-.9.27-1.76.75-2.53M9.88 9.88A3 3 0 0115 12m0 0a3 3 0 01-5.12 2.12M3 3l18 18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
      </div>


      {error && <p className="text-center text-sm text-red-500">{error}</p>}
      {/* secretCode ya no aplicable desde frontend; coordinadores se asignan por ADMIN */}
      {successMessage && <p className="text-center text-sm text-emerald-600">{successMessage}</p>}
      {verificationUrl && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-900">
          <p className="font-semibold">El correo no llegó o está en desarrollo.</p>
          <a
            href={verificationUrl}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#4a6fa5] px-4 py-4 text-base font-semibold text-white transition hover:opacity-90"
          >
            Verificar mi cuenta
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#4a6fa5] px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-[#4a6fa5]/25 transition hover:bg-[#3d5d8a] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </button>

      <p className="text-center text-base text-slate-500">
        ¿Ya tienes una cuenta?{' '}
        <button type="button" onClick={onLogin} className="font-semibold text-[#4a6fa5] hover:underline">
          Inicia sesión
        </button>
      </p>
    </form>
    </div>
  );
};
