import { useEffect, useState } from 'react';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPassword } from '../components/ForgotPassword.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
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
      const role = user?.role?.toUpperCase();
      if (role?.includes('ADMIN')) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/cliente', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const switchView = (nextView) => {
    clearError();
    setView(nextView);
  };

  return (
    /* Full-screen wrapper — sin scroll, ocupa todo el viewport */
    <div className="h-screen w-screen flex overflow-hidden bg-[#dce3ea]">

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div
        className="hidden md:flex w-[48%] flex-col relative overflow-hidden rounded-[1.6rem] justify-between px-6 py-6 shadow-lg"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Soft vignette at bottom so the tagline card stands out */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1e2d4a]/40 pointer-events-none" />

        {/* ── Logo top-left ── */}
        <div className="relative z-10 flex items-center gap-3 px-8 pt-6">
          <img src={logo} alt="Schedule-K" className="h-9 w-auto" />
          <span className="text-[#1e2d4a] font-extrabold text-sm tracking-[0.18em] drop-shadow-sm">
            SCHEDULE-K
          </span>
        </div>

        {/* ── Spacer ── */}
        <div className="relative z-10 flex-1" />

        {/* ── Tagline card — glassmorphism strip at the bottom ── */}
        <div
          className="relative z-10 mx-8 mb-12 rounded-[2rem] px-12 py-14 flex items-center gap-6 h-[260px]"
          style={{
            background: 'rgba(18, 28, 52, 0.60)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Arrow button */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/18 hover:bg-white/28 transition flex items-center justify-center cursor-pointer">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="flex-1 relative pr-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/70 mb-1">
              Your Digital Workspace
            </p>
            <p className="text-[2.8rem] font-extrabold leading-tight text-white">
              The ultimate tool
            </p>
            <p className="text-[2.8rem] font-extrabold leading-tight text-[#cfe8fb] mt-1">
              For coordination
            </p>

            {/* penguin inside card, absolutely positioned to the right and slightly lifted */}
            <img src={heroImage} alt="penguin" className="absolute right-6 bottom-6 w-[34%] max-w-[200px] object-contain drop-shadow-2xl -translate-y-4" />
          </div>
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div className={`flex-1 bg-[#fbf6ec] flex ${view === 'login' || view === 'forgot' ? 'items-center' : 'items-start'} justify-center px-12 py-12 overflow-y-auto`}>
        <div className="w-full max-w-[36rem]">

          {view === 'forgot' ? (
            <ForgotPassword onSwitch={() => switchView('login')} />
          ) : view === 'register' ? (
            <RegisterForm onLogin={() => switchView('login')} />
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-[3.6rem] font-black text-[#1e2d4a] leading-tight mb-2">
                  Welcome Back!
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Welcome to our SCHEDULE-K, the best experience for{' '}
                  <span className="font-semibold text-slate-500">COORDINATOR/PARENT</span>
                </p>
              </div>
              <LoginForm
                onForgot={() => switchView('forgot')}
                onRegister={() => switchView('register')}
              />
            </>
          )}

          {/* Footer divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] text-slate-400 tracking-[0.22em] font-semibold">SCHEDULED-K</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

        </div>
      </div>

    </div>
  );
};
