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
  getOrders,
  getReservationsForRestaurant,
  getRestaurants,
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

const getStudentLabel = (reservation) => {
  if (reservation?.studentName) return reservation.studentName;

  if (reservation?.customerEmail) {
    const [localPart] = reservation.customerEmail.split('@');
    return localPart
      .split(/[._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  if (reservation?.numberOfGuests) {
    return `${reservation.numberOfGuests} integrante(s)`;
  }

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
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const { users, getAllUsers } = useUserManagementStore();

  const [restaurants, setRestaurants] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const [restaurantsResult, ordersResult] = await Promise.allSettled([
          getRestaurants(),
          getOrders(),
        ]);

        const restaurantsList =
          restaurantsResult.status === 'fulfilled'
            ? Array.isArray(restaurantsResult.value)
              ? restaurantsResult.value
              : restaurantsResult.value?.restaurants || []
            : [];

        const reservationsResult = await Promise.allSettled(
          restaurantsList.map(async (restaurant) => {
            const items = await getReservationsForRestaurant(restaurant._id);
            const reservationItems = Array.isArray(items) ? items : [];

            return reservationItems.map((reservation) => ({
              ...reservation,
              __campusName: restaurant.name,
              __coordinatorName: restaurant.manager || restaurant.name || 'Coordinación general',
            }));
          }),
        );

        const reservationList = reservationsResult.flatMap((result) =>
          result.status === 'fulfilled' ? result.value : [],
        );

        if (!cancelled) {
          setRestaurants(restaurantsList);
          setReservations(reservationList);
          setOrders(
            ordersResult.status === 'fulfilled'
              ? Array.isArray(ordersResult.value)
                ? ordersResult.value
                : ordersResult.value?.orders || []
              : [],
          );
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

    const reservationsToday = reservations.filter((item) =>
      isSameDay(item.reservationDate || item.createdAt, today),
    );

    const completedMonthly = reservations.filter((item) => {
      const badge = getAppointmentBadge(item.status);
      return (
        isSameMonth(item.reservationDate || item.createdAt, today) &&
        ['Confirmada', 'Completada'].includes(badge.label)
      );
    });

    const uniqueFamilies = new Set(
      reservations.map((item) => item.customerEmail || item.customerName).filter(Boolean),
    );
    const uniqueCoordinators = new Set(
      reservations.map((item) => item.__coordinatorName).filter(Boolean),
    );

    const confirmationRate = reservations.length
      ? Math.round(
          (reservations.filter((item) => {
            const badge = getAppointmentBadge(item.status);
            return ['Confirmada', 'Completada'].includes(badge.label);
          }).length /
            reservations.length) *
            100,
        )
      : 0;

    const monthlyOrders = orders.filter((item) =>
      isSameMonth(item.createdAt || item.updatedAt, today),
    ).length;

    const recentAppointments = [...reservations]
      .sort((a, b) => {
        const firstDate = new Date(a.reservationDate || a.createdAt || 0).getTime();
        const secondDate = new Date(b.reservationDate || b.createdAt || 0).getTime();
        return firstDate - secondDate;
      })
      .slice(0, 6);

    return {
      scheduledToday: reservationsToday.length,
      parentCount: parentUsers.length || uniqueFamilies.size,
      teacherCount: coordinatorUsers.length || uniqueCoordinators.size || restaurants.length,
      monthlyCompleted: completedMonthly.length,
      verifiedCount: verifiedUsers.length,
      totalUsers: users.length,
      confirmationRate,
      monthlyOrders,
      recentAppointments,
    };
  }, [orders, reservations, restaurants.length, users]);

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
      {
        title: 'Reportes',
        description: 'Revisa tendencias, cumplimiento y actividad institucional.',
        to: '/dashboard/reviews',
        icon: ChartBarSquareIcon,
      },
      {
        title: 'Configuración',
        description: 'Ajusta sedes, catálogos y parámetros operativos.',
        to: '/dashboard/restaurants',
        icon: Cog6ToothIcon,
      },
    ],
    [isSuperAdmin],
  );

  const reportCards = useMemo(
    () => [
      {
        label: 'Índice de confirmación',
        value: `${dashboardSummary.confirmationRate}%`,
        helper: 'Citas confirmadas o completadas respecto al total operativo.',
      },
      {
        label: 'Usuarios verificados',
        value: dashboardSummary.totalUsers
          ? `${dashboardSummary.verifiedCount}/${dashboardSummary.totalUsers}`
          : 'Sin datos',
        helper: 'Personas con acceso institucional validado.',
      },
      {
        label: 'Actividad mensual',
        value: `${dashboardSummary.monthlyOrders} eventos`,
        helper: 'Señales operativas detectadas en el mes actual.',
      },
    ],
    [dashboardSummary],
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
              <Link to='/dashboard/reservations' className='admin-button-primary px-7 py-4 text-sm'>
                GESTIONAR CITAS
              </Link>
              <Link
                to={{ pathname: '/dashboard', hash: '#reportes' }}
                className='admin-button-secondary px-7 py-4 text-sm'
              >
                VER REPORTES
              </Link>
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

            <div className='admin-report-card'>
              <p className='admin-report-card__eyebrow'>Resumen Admin</p>
              <h3 className='admin-report-card__title'>Control rápido</h3>
              <div className='admin-report-card__grid'>
                <div>
                  <span>Citas hoy</span>
                  <strong>{dashboardSummary.scheduledToday}</strong>
                </div>
                <div>
                  <span>Usuarios</span>
                  <strong>{dashboardSummary.totalUsers}</strong>
                </div>
                <div>
                  <span>Completadas</span>
                  <strong>{dashboardSummary.monthlyCompleted}</strong>
                </div>
                <div>
                  <span>Confirmación</span>
                  <strong>{dashboardSummary.confirmationRate}%</strong>
                </div>
              </div>
              <div className='admin-report-card__lines' aria-hidden='true'>
                <span />
                <span />
                <span />
              </div>
            </div>

            <img
              src={heroPenguin}
              alt='Pingüino institucional para administradores'
              className='admin-reference-penguin'
            />
          </div>
        </div>
      </section>

      <section id='citas' className='admin-section-anchor grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          {
            label: 'Citas Programadas',
            value: dashboardSummary.scheduledToday,
            helper: 'Total del día',
            icon: CalendarDaysIcon,
            accent: 'violet',
          },
          {
            label: 'Padres Registrados',
            value: dashboardSummary.parentCount,
            helper: 'Base general institucional',
            icon: UserGroupIcon,
            accent: 'mint',
          },
          {
            label: 'Docentes Disponibles',
            value: dashboardSummary.teacherCount,
            helper: 'Cobertura actual',
            icon: AcademicCapIcon,
            accent: 'green',
          },
          {
            label: 'Reuniones Completadas',
            value: dashboardSummary.monthlyCompleted,
            helper: 'Acumulado mensual',
            icon: ClipboardDocumentCheckIcon,
            accent: 'neutral',
          },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className='admin-card admin-stat-card p-6'
              style={{ animation: `adminRise 420ms ease ${index * 70}ms both` }}
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <p className='text-sm font-bold text-[#5E5E5E]'>{card.label}</p>
                  <p className='mt-4 text-[2rem] font-black leading-none text-[#202020]'>
                    {card.value}
                  </p>
                  <p className='mt-3 text-sm text-[#5E5E5E]'>{card.helper}</p>
                </div>
                <div className={`admin-stat-icon ${card.accent}`}>
                  <Icon className='h-6 w-6' />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className='grid gap-6 xl:grid-cols-[1.02fr_0.98fr]'>
        <div id='padres' className='admin-section-anchor admin-panel p-6 lg:p-7'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='admin-kicker'>Acciones rápidas</p>
              <h2 className='mt-2 text-2xl font-black text-[#202020]'>
                Centro de gestión inmediata
              </h2>
            </div>
            <span className='admin-status admin-status-neutral'>
              Flujo ágil
            </span>
          </div>

          <div className='mt-6 grid gap-4 md:grid-cols-2'>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.to}
                  className='admin-quick-action'
                  style={{ animation: `adminRise 420ms ease ${index * 60}ms both` }}
                >
                  <div className='admin-quick-action__icon'>
                    <Icon className='h-6 w-6' />
                  </div>
                  <div>
                    <h3 className='text-lg font-extrabold text-[#202020]'>{action.title}</h3>
                    <p className='mt-2 text-sm leading-6 text-[#5E5E5E]'>
                      {action.description}
                    </p>
                  </div>
                  <ChevronRightIcon className='h-5 w-5 text-[#5648E7]' />
                </Link>
              );
            })}
          </div>
        </div>

        <div id='docentes' className='admin-section-anchor admin-panel p-6 lg:p-7'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='admin-kicker'>Pulso institucional</p>
              <h2 className='mt-2 text-2xl font-black text-[#202020]'>
                Resumen de coordinación
              </h2>
            </div>
            <span className='admin-status admin-status-success'>
              Estable
            </span>
          </div>

          <div className='mt-6 space-y-4'>
            {[
              {
                label: 'Familias activas',
                value: dashboardSummary.parentCount,
                progress: Math.min(100, dashboardSummary.parentCount * 8 + 18),
              },
              {
                label: 'Cobertura docente',
                value: dashboardSummary.teacherCount,
                progress: Math.min(100, dashboardSummary.teacherCount * 18 + 14),
              },
              {
                label: 'Cierre mensual',
                value: dashboardSummary.monthlyCompleted,
                progress: Math.min(100, dashboardSummary.monthlyCompleted * 12 + 10),
              },
            ].map((item) => (
              <div key={item.label} className='admin-data-strip'>
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <p className='text-sm font-bold text-[#202020]'>{item.label}</p>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#5E5E5E]'>
                      Coordinación académica
                    </p>
                  </div>
                  <span className='text-2xl font-black text-[#5648E7]'>{item.value}</span>
                </div>
                <div className='mt-4 admin-progress'>
                  <span style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id='reportes' className='admin-section-anchor grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
        <div className='admin-panel overflow-hidden p-6 lg:p-7'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className='admin-kicker'>Citas recientes</p>
              <h2 className='mt-2 text-2xl font-black text-[#202020]'>
                Agenda institucional más reciente
              </h2>
            </div>
            <Link to='/dashboard/reservations' className='admin-button-secondary px-5 py-3 text-sm'>
              Abrir módulo de citas
            </Link>
          </div>

          <div className='mt-6 overflow-x-auto'>
            <table className='admin-table min-w-full text-left text-sm'>
              <thead>
                <tr>
                  <th className='px-4 py-4'>Padre</th>
                  <th className='px-4 py-4'>Estudiante</th>
                  <th className='px-4 py-4'>Docente</th>
                  <th className='px-4 py-4'>Fecha</th>
                  <th className='px-4 py-4'>Hora</th>
                  <th className='px-4 py-4'>Estado</th>
                  <th className='px-4 py-4'>Acción</th>
                </tr>
              </thead>
              <tbody>
                {dashboardSummary.recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan='7' className='px-4 py-10 text-center text-sm text-[#5E5E5E]'>
                      Aún no hay citas recientes para mostrar.
                    </td>
                  </tr>
                ) : (
                  dashboardSummary.recentAppointments.map((appointment) => {
                    const badge = getAppointmentBadge(appointment.status);
                    return (
                      <tr key={appointment._id || `${appointment.customerEmail}-${appointment.createdAt}`}>
                        <td className='px-4 py-4 font-semibold text-[#202020]'>
                          {appointment.customerName || 'Padre por confirmar'}
                        </td>
                        <td className='px-4 py-4 text-[#5E5E5E]'>
                          {getStudentLabel(appointment)}
                        </td>
                        <td className='px-4 py-4 text-[#5E5E5E]'>
                          {appointment.__coordinatorName}
                        </td>
                        <td className='px-4 py-4 text-[#5E5E5E]'>
                          {formatDate(appointment.reservationDate || appointment.createdAt)}
                        </td>
                        <td className='px-4 py-4 text-[#5E5E5E]'>
                          {formatTime(appointment.reservationDate || appointment.createdAt)}
                        </td>
                        <td className='px-4 py-4'>
                          <span className={`admin-status ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          <Link
                            to='/dashboard/reservations'
                            className='text-sm font-bold text-[#5648E7] transition hover:text-[#4438D8]'
                          >
                            Gestionar
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='admin-panel p-6 lg:p-7'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='admin-kicker'>Reportes clave</p>
                <h2 className='mt-2 text-2xl font-black text-[#202020]'>
                  Indicadores ejecutivos
                </h2>
              </div>
              <span className='admin-status admin-status-warning'>
                En vivo
              </span>
            </div>

            <div className='mt-6 space-y-4'>
              {reportCards.map((card) => (
                <article key={card.label} className='admin-data-strip'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <p className='text-sm font-bold text-[#202020]'>{card.label}</p>
                      <p className='mt-1 text-sm text-[#5E5E5E]'>{card.helper}</p>
                    </div>
                    <p className='text-xl font-black text-[#5648E7]'>{card.value}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div id='usuarios' className='admin-section-anchor admin-panel p-6 lg:p-7'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='admin-kicker'>Usuarios y configuración</p>
                <h2 className='mt-2 text-2xl font-black text-[#202020]'>
                  Operación institucional
                </h2>
              </div>
              <span className='admin-status admin-status-neutral'>
                Premium
              </span>
            </div>

            <div className='mt-6 grid gap-4 md:grid-cols-2'>
              <Link
                to={isSuperAdmin ? '/dashboard/users' : '/dashboard#usuarios'}
                className='admin-mini-panel'
              >
                <div className='admin-mini-panel__icon'>
                  <UsersIcon className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='text-lg font-extrabold text-[#202020]'>Usuarios</h3>
                  <p className='mt-2 text-sm leading-6 text-[#5E5E5E]'>
                    Accesos, permisos y seguimiento de verificación.
                  </p>
                </div>
              </Link>

              <Link
                id='configuracion'
                to='/dashboard/restaurants'
                className='admin-mini-panel'
              >
                <div className='admin-mini-panel__icon'>
                  <Cog6ToothIcon className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='text-lg font-extrabold text-[#202020]'>Configuración</h3>
                  <p className='mt-2 text-sm leading-6 text-[#5E5E5E]'>
                    Ajustes de sedes, catálogos y módulos operativos.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
