import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AcademicCapIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../features/auth/store/authStore.js';
import { useUserManagementStore } from '../features/auth/store/useUserManagementStore.js';
import {
  getAppointments,
  getAppointmentHistory,
  getMyNotifications,
} from '../services/adminApi.js';
import heroPenguin from '../assets/img/LOGIN_IMG.png';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-GT', {
    dateStyle: 'medium',
  });
};

const formatTime = (value) => {
  if (!value) return 'Sin horario';
  return new Date(value).toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isSameDay = (value, date) => {
  if (!value) return false;
  const current = new Date(value);
  return (
    current.getFullYear() === date.getFullYear() &&
    current.getMonth() === date.getMonth() &&
    current.getDate() === date.getDate()
  );
};

const isSameMonth = (value, date) => {
  if (!value) return false;
  const current = new Date(value);
  return (
    current.getFullYear() === date.getFullYear() &&
    current.getMonth() === date.getMonth()
  );
};

const normalizeStatus = (status = '') => status.toString().trim().toLowerCase();

const getAppointmentBadge = (status) => {
  const normalized = normalizeStatus(status);

  if (
    normalized.includes('confirm') ||
    normalized.includes('approved') ||
    normalized.includes('aprob')
  ) {
    return { label: 'Confirmada', className: 'admin-status-success' };
  }

  if (
    normalized.includes('complete') ||
    normalized.includes('complet') ||
    normalized.includes('closed')
  ) {
    return { label: 'Completada', className: 'admin-status-completed' };
  }

  if (
    normalized.includes('cancel') ||
    normalized.includes('rechaz') ||
    normalized.includes('denied')
  ) {
    return { label: 'Cancelada', className: 'admin-status-danger' };
  }

  return { label: 'Pendiente', className: 'admin-status-warning' };
};

const getAppointmentLabel = (reservation) => {
  if (reservation?.reason) return reservation.reason;
  if (reservation?.parentId) return reservation.parentId;
  return 'Por confirmar';
};

const DashboardSkeleton = () => (
  <div className='admin-page space-y-8'>
    <section className='admin-hero p-6 lg:p-8'>
      <div className='grid gap-8 lg:grid-cols-[1.1fr_0.9fr]'>
        <div className='space-y-4'>
          <div className='admin-skeleton h-4 w-36 rounded-full' />
          <div className='admin-skeleton h-16 w-full max-w-xl rounded-[1.75rem]' />
          <div className='admin-skeleton h-28 w-full max-w-2xl rounded-[1.75rem]' />
          <div className='flex gap-3'>
            <div className='admin-skeleton h-14 w-48 rounded-full' />
            <div className='admin-skeleton h-14 w-48 rounded-full' />
          </div>
        </div>
        <div className='admin-skeleton min-h-[380px] rounded-[2rem]' />
      </div>
    </section>

    <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className='admin-card p-6'>
          <div className='admin-skeleton h-4 w-28 rounded-full' />
          <div className='mt-5 admin-skeleton h-10 w-24 rounded-full' />
          <div className='mt-4 admin-skeleton h-3 w-40 rounded-full' />
        </div>
      ))}
    </section>

    <section className='grid gap-6 xl:grid-cols-[0.95fr_1.05fr]'>
      <div className='admin-panel p-6'>
        <div className='admin-skeleton h-5 w-48 rounded-full' />
        <div className='mt-6 grid gap-4 md:grid-cols-2'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='admin-skeleton h-32 rounded-[1.5rem]' />
          ))}
        </div>
      </div>
      <div className='admin-panel p-6'>
        <div className='admin-skeleton h-5 w-40 rounded-full' />
        <div className='mt-6 space-y-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className='admin-skeleton h-16 rounded-[1.25rem]' />
          ))}
        </div>
      </div>
    </section>
  </div>
);

export const Dashboard = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.toUpperCase();
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'ADMIN_ROLE'].includes(role);
  const { users, getAllUsers } = useUserManagementStore();

  const [appointments, setAppointments] = useState([]);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generalMessage, setGeneralMessage] = useState({ text: '', author: '' });

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const [appointmentsResult, historyResult] = await Promise.allSettled([
          getAppointments(),
          getAppointmentHistory(),
        ]);

        const appointmentsList =
          appointmentsResult.status === 'fulfilled'
            ? Array.isArray(appointmentsResult.value)
              ? appointmentsResult.value
              : appointmentsResult.value?.appointments || []
            : [];

        const historyList =
          historyResult.status === 'fulfilled'
            ? Array.isArray(historyResult.value)
              ? historyResult.value
              : historyResult.value?.history || []
            : [];

        if (!cancelled) {
          setAppointments(appointmentsList);
          setAppointmentHistory(historyList);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleStoredMessage = (raw) => {
      if (!raw) {
        setGeneralMessage({ text: '', author: '' });
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.text) setGeneralMessage(parsed);
        else setGeneralMessage({ text: String(parsed || ''), author: '' });
      } catch {
        setGeneralMessage({ text: raw, author: '' });
      }
    };

    const loadGeneralMessage = async () => {
      try {
        const notifications = await getMyNotifications();
        if (Array.isArray(notifications) && notifications.length > 0) {
          const latest = notifications[0];
          setGeneralMessage({ text: latest.message || '', author: latest.coordinatorName || latest.coordinatorId || '' });
        }
      } catch (error) {
        console.error('Error cargando mensajes generales:', error);
      }
    };

    let removeStorageListener = null;

    if (typeof window !== 'undefined') {
      loadGeneralMessage();

      const storedMessage = window.localStorage.getItem('general-app-message');
      if (storedMessage) handleStoredMessage(storedMessage);

      const onStorage = (e) => {
        if (e.key === 'general-app-message') {
          handleStoredMessage(e.newValue);
        }
      };

      window.addEventListener('storage', onStorage);
      removeStorageListener = () => window.removeEventListener('storage', onStorage);

      try {
        const bc = new BroadcastChannel('general-app-message');
        bc.onmessage = (ev) => handleStoredMessage(JSON.stringify(ev.data));
        const removeBc = () => bc.close();
        const prev = removeStorageListener;
        removeStorageListener = () => {
          if (prev) prev();
          removeBc();
        };
      } catch (e) {
        /* ignore BroadcastChannel absence */
      }
    }

    return () => {
      if (removeStorageListener) removeStorageListener();
    };
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      getAllUsers(undefined, { force: true });
    }
  }, [getAllUsers, isSuperAdmin]);

  useEffect(() => {
    if (!location.hash) return;

    const sectionId = location.hash.replace('#', '');
    const target = document.getElementById(sectionId);

    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [location.hash]);

  const dashboardSummary = useMemo(() => {
    const today = new Date();
    const parentUsers = users.filter(
      (item) => (item.role || '').toUpperCase() === 'PADRE',
    );
    const coordinatorUsers = users.filter((item) => {
      const role = (item.role || '').toUpperCase();
      return role === 'COORDINADOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';
    });

    const verifiedUsers = users.filter((item) =>
      Boolean(item.isVerified ?? item.verified ?? item.emailConfirmed),
    );

    const appointmentsToday = appointments.filter((item) =>
      isSameDay(item.date || item.createdAt, today),
    );

    const completedMonthly = appointments.filter((item) => {
      const badge = getAppointmentBadge(item.status);
      return (
        isSameMonth(item.date || item.createdAt, today) &&
        ['Confirmada', 'Completada'].includes(badge.label)
      );
    });

    const uniqueFamilies = new Set(
      appointments.map((item) => item.parentId).filter(Boolean),
    );

    const confirmationRate = appointments.length
      ? Math.round(
          (appointments.filter((item) => {
            const badge = getAppointmentBadge(item.status);
            return ['Confirmada', 'Completada'].includes(badge.label);
          }).length /
            appointments.length) *
            100,
        )
      : 0;

    const recentAppointments = [...appointments]
      .sort((a, b) => {
        const firstDate = new Date(a.date || a.createdAt || 0).getTime();
        const secondDate = new Date(b.date || b.createdAt || 0).getTime();
        return firstDate - secondDate;
      })
      .slice(0, 6);

    return {
      scheduledToday: appointmentsToday.length,
      parentCount: parentUsers.length || uniqueFamilies.size,
      teacherCount: coordinatorUsers.length,
      monthlyCompleted: completedMonthly.length,
      verifiedCount: verifiedUsers.length,
      totalUsers: users.length,
      confirmationRate,
      recentAppointments,
    };
  }, [appointments, users]);

  const quickActions = useMemo(
    () => [
      {
        title: 'Nueva Cita',
        description: 'Programa reuniones y asigna horarios en pocos pasos.',
        to: '/dashboard/reservations',
        icon: CalendarDaysIcon,
      },
      {
        title: 'Reprogramar Cita',
        description: 'Actualiza la agenda del día y reorganiza prioridades.',
        to: '/dashboard/reservations',
        icon: ArrowPathIcon,
      },
      {
        title: 'Gestionar Padres',
        description: 'Consulta familias, seguimiento y estado de verificación.',
        to: isSuperAdmin ? '/dashboard/users?role=PADRE' : '/dashboard#padres',
        icon: UsersIcon,
      },
      {
        title: 'Gestionar Docentes',
        description: 'Visualiza responsables académicos y su disponibilidad.',
        to: isSuperAdmin ? '/dashboard/users?role=COORDINADOR' : '/dashboard#docentes',
        icon: AcademicCapIcon,
      },
    ],
    [isSuperAdmin],
  );

  const currentDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('es-GT', {
        dateStyle: 'full',
      }).format(new Date()),
    [],
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className='admin-page space-y-8 pb-6'>
      <section id='dashboard' className='admin-section-anchor admin-hero p-6 lg:p-8'>
        <div className='admin-reference-grid'>
          <div className='admin-reference-copy'>
            <div className='inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/78 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#5648E7] shadow-[0_18px_40px_rgba(0,0,0,0.06)] backdrop-blur'>
              <span className='h-2.5 w-2.5 rounded-full bg-[#5648E7]' />
              {currentDateLabel}
            </div>

            <div className='space-y-5'>
              <p className='admin-kicker'>Centro de control institucional</p>
              <h1 className='admin-display admin-display--admin'>
                PANEL DE
                <br />
                ADMINISTRADORES
              </h1>
              <p className='admin-hero-copy admin-hero-copy--narrow'>
                Bienvenido al panel de administradores. Desde aquí puedes supervisar
                citas entre coordinadores y padres de familia, validar usuarios,
                revisar indicadores institucionales y mantener toda la operación
                académica organizada desde un único centro inteligente.
              </p>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row'>
              {!isAdmin && (
                <Link to='/dashboard/reservations' className='admin-button-primary px-7 py-4 text-sm'>
                  GESTIONAR CITAS
                </Link>
              )}
            </div>

            <div className='flex flex-wrap gap-3 pt-2'>
              <div className='admin-soft-pill'>
                <CalendarDaysIcon className='h-4 w-4' />
                {dashboardSummary.scheduledToday} citas programadas hoy
              </div>
              <div className='admin-soft-pill'>
                <ArrowTrendingUpIcon className='h-4 w-4' />
                {dashboardSummary.confirmationRate}% de confirmación institucional
              </div>
            </div>
          </div>

          <div className='admin-reference-stage'>
            <div className='admin-reference-pill admin-reference-pill--top'>
              <span className='text-xs font-bold uppercase tracking-[0.18em] text-[#5E5E5E]'>
                Notificaciones
              </span>
              <p className='mt-2 text-2xl font-black text-[#202020]'>3</p>
            </div>

            <div className='admin-reference-pill admin-reference-pill--bottom'>
              <span className='text-xs font-bold uppercase tracking-[0.18em] text-[#5E5E5E]'>
                Cobertura activa
              </span>
              <p className='mt-2 text-2xl font-black text-[#202020]'>
                {dashboardSummary.teacherCount}
              </p>
            </div>

            <div className='admin-reference-wave' aria-hidden='true' />
            <div className='admin-reference-badge' aria-hidden='true'>
              SK
            </div>

            <img
              src={heroPenguin}
              alt='Pingüino institucional para administradores'
              className='admin-reference-penguin'
            />
          </div>
        </div>
      </section>

      {/* Simplified dashboard: each segment is its own admin view. */}
      <section className='admin-panel p-6 rounded-[2rem] border border-slate-200 bg-white/80 shadow-sm'>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {!isAdmin && (
            <Link to='/dashboard/reservations' className='admin-module-card'>
              <h3 className='text-lg font-bold'>Módulo Citas</h3>
              <p className='mt-2 text-sm text-slate-600'>Ver y gestionar citas en su propio espacio.</p>
            </Link>
          )}

          <Link to='/dashboard/users' className='admin-module-card'>
            <h3 className='text-lg font-bold'>Módulo Usuarios</h3>
            <p className='mt-2 text-sm text-slate-600'>Listar y actualizar roles de usuarios (Admin).</p>
          </Link>

          <Link to='/dashboard/admin-home' className='admin-module-card'>
            <h3 className='text-lg font-bold'>Panel Administrativo</h3>
            <p className='mt-2 text-sm text-slate-600'>Vistas y utilidades administrativas separadas.</p>
          </Link>
        </div>
      </section>
    </div>
  );
};
