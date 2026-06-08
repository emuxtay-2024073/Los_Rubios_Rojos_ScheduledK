import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { forgotPassword } from '../../../shared/apis/auth.js';
import toast from 'react-hot-toast';

export const ForgotPassword = ({ onSwitch }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true);
      setMessage('');
      const { data } = await forgotPassword(email);
      const successMessage =
        data?.message || data?.Message || 'Solicitud enviada. Revisa tu correo para continuar.';
      setMessage(successMessage);
      toast.success(successMessage);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        'No se pudo enviar la solicitud de recuperación.';
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-base font-semibold text-[#1e2d4a]">
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="correo@example.com"
          className="w-full rounded-xl border border-slate-200 bg-white px-6 py-5 text-lg text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-[#4a6fa5] focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]/20"
          {...register('email', {
            required: 'Este campo es obligatorio',
          })}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {message && <p className="text-center text-sm text-slate-700">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#4a6fa5] px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-[#4a6fa5]/25 transition hover:bg-[#3d5d8a] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Enviando...' : 'Enviar recuperación'}
      </button>

      <p className="text-center text-base text-slate-500">
        ¿Recordaste tu contraseña?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-[#4a6fa5] hover:underline"
        >
          Iniciar Sesión
        </button>
      </p>
    </form>
  );
};
