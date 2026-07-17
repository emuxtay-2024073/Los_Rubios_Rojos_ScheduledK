import { useEffect, useState } from 'react';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPassword } from '../components/ForgotPassword.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import { getRoleHomePath } from '../../../shared/utils/roleViews.js';
import logo from '../../../assets/img/logo_scheduled_img.png';
import heroImage from '../../../assets/img/LOGIN_IMG.png';
import bgImage from '../../../assets/img/holahojitas.jpg';

export const AuthPage = () => {
  const clearError = useAuthStore((state) => state.clearError);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [view, setView] = useState('login');

  useEffect(() => {
    if (isAuthenticated) {
      const role = user?.role;
      const homePath = getRoleHomePath(role);
      navigate(homePath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const switchView = (nextView) => {
    clearError();
    setView(nextView);
  };

  return (
    <div className="min-h-screen bg-[#dce3ea] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1460px] overflow-hidden rounded-[2rem] bg-[#fbf6ec] shadow-[0_28px_80px_rgba(30,45,74,0.12)] sm:min-h-[calc(100vh-3rem)]">

        {/* ══════════════ LEFT PANEL ══════════════ */}
        <div
          className="relative hidden w-[46%] flex-col justify-between overflow-hidden rounded-l-[2rem] px-6 py-6 lg:flex xl:w-[48%]"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1e2d4a]/40 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3 px-8 pt-6">
            <img src={logo} alt="Schedule-K" className="h-9 w-auto" />
            <span className="text-[#1e2d4a] font-extrabold text-sm tracking-[0.18em] drop-shadow-sm">
              RUBIOS ROJOS
            </span>
          </div>

          <div className="relative z-10 flex-1" />

          <div
            className="relative z-10 mx-6 mb-8 flex h-[250px] items-center gap-6 rounded-[2rem] px-10 py-12 xl:mx-8 xl:mb-12 xl:px-12"
            style={{
              background: 'rgba(18, 28, 52, 0.60)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/18 transition hover:bg-white/28">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="relative flex-1 pr-28 xl:pr-32">
              <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/70">
                Tu espacio digital
              </p>
              <p className="text-[2.4rem] font-extrabold leading-tight text-white xl:text-[2.8rem]">
                Seguro,
              </p>
              <p className="mt-1 text-[2.4rem] font-extrabold leading-tight text-[#cfe8fb] xl:text-[2.8rem]">
                Fácil y
              </p>
              <p className="mt-1 text-[2.4rem] font-extrabold leading-tight text-white xl:text-[2.8rem]">
                Rápido
              </p>

              <img
                src={heroImage}
                alt="penguin"
                className="absolute bottom-2 right-0 w-[34%] max-w-[190px] object-contain drop-shadow-2xl xl:max-w-[205px]"
              />
            </div>
          </div>
        </div>

        {/* ══════════════ RIGHT PANEL ══════════════ */}
        <div className={`flex-1 bg-[#fbf6ec] flex ${view === 'login' || view === 'forgot' ? 'items-center' : 'items-start'} justify-center overflow-y-auto px-6 py-10 sm:px-10 lg:px-12 xl:px-16`}>
          <div className="w-full max-w-[34rem] xl:max-w-[35rem]">

            {view === 'forgot' ? (
              <ForgotPassword onSwitch={() => switchView('login')} />
            ) : view === 'register' ? (
              <RegisterForm onLogin={() => switchView('login')} />
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="mb-2 text-[3rem] font-black leading-tight text-[#1e2d4a] xl:text-[3.6rem]">
                    ¡Bienvenido de nuevo!
                  </h2>
                  <p className="text-base leading-relaxed text-slate-400 xl:text-lg">
                    Bienvenido a nuestro sistema de gestión de citas, la mejor experiencia para{' '}
                    <span className="font-semibold text-slate-500">COORDINADOR, PADRE O TUTOR</span>
                  </p>
                </div>
                <LoginForm
                  onForgot={() => switchView('forgot')}
                  onRegister={() => switchView('register')}
                />
              </>
            )}

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                RUBIOS ROJOS CORP
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
