import { useEffect, useState } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { getParentAppointments, getMyNotifications, cancelAppointment } from '../../services/adminApi.js';
import { showError, showSuccess } from '../../shared/utils/toast.js';
import {
  CalendarDaysIcon,
  ShieldCheckIcon,
  SparklesIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import mascotHero from '../../assets/img/REGISTER_IMG.png';
import mascotSmall from '../../assets/img/DENTRO_mg.png';

const formatDate = (value) => {
  if (!value) return 'Fecha desconocida';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });
};

const formatTime = (value) => {
  if (!value) return 'Hora desconocida';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
};

export const ParentPage = () => {
  const user = useAuthStore((state) => state.user);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentToCancel, setSelectedAppointmentToCancel] = useState(null);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [generalMessage, setGeneralMessage] = useState({ text: '', author: '' });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getParentAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || 'No se pudieron cargar las citas';
      showError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleStoredMessage = (raw) => {
      if (!raw) {
        setGeneralMessage({ text: '', author: '' });
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.text) {
          setGeneralMessage(parsed);
        } else {
          setGeneralMessage({ text: String(parsed || ''), author: '' });
        }
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

    loadAppointments();

    return () => {
      if (removeStorageListener) removeStorageListener();
    };
  }, []);

  const pendingAppointments = appointments.filter(
    (appointment) => (appointment.status || '').toString().trim().toUpperCase() === 'PENDING',
  );

  const confirmedAppointments = appointments.filter(
    (appointment) => (appointment.status || '').toString().trim().toUpperCase() === 'CONFIRMED',
  );
  const cancelledAppointments = appointments.filter(
    (appointment) => (appointment.status || '').toString().trim().toUpperCase() === 'CANCELLED',
  );

  const upcomingAppointments = appointments
    .slice()
    .filter((appointment) => {
      const timestamp = new Date(`${appointment.date}T${appointment.startTime}`);
      return !Number.isNaN(timestamp.getTime()) && timestamp >= new Date();
    })
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));

  const getCoordinatorLabel = (appointment) => {
    return (
      appointment?.coordinatorName || appointment?.coordinator || appointment?.__coordinatorName || 'Coordinador asignado'
    );
  };

  const nextAppointment = upcomingAppointments[0] || appointments[0];
  const nextAppointmentLabel = nextAppointment
    ? `${formatDate(nextAppointment.date)} • ${formatTime(nextAppointment.startTime)} - ${formatTime(nextAppointment.endTime)}`
    : 'No hay citas agendadas';

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointmentToCancel(appointment);
    setShowCancelModal(true);
    setProposedDate('');
    setProposedTime('');
  };

  const handleSubmitCancelation = async () => {
    if (!selectedAppointmentToCancel) {
      showError('No se ha seleccionado ninguna cita.');
      return;
    }

    if (!proposedDate || !proposedTime) {
      showError('Por favor completa la fecha y hora propuesta');
      return;
    }

    try {
      setActionLoading(true);
      await cancelAppointment(selectedAppointmentToCancel._id || selectedAppointmentToCancel.id, {
        suggestedDate: proposedDate,
        suggestedTime: proposedTime,
      });
      showSuccess(`Cita cancelada. Se sugirió nueva fecha para ${proposedDate} a las ${proposedTime}`);
      setShowCancelModal(false);
      setSelectedAppointmentToCancel(null);
      setProposedDate('');
      setProposedTime('');
      await loadAppointments();
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || 'No se pudo cancelar la cita';
      showError(apiMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const stats = [
    {
      title: 'Por responder',
      value: pendingAppointments.length,
      description: 'Citas que aún esperan tu respuesta.',
      icon: SparklesIcon,
      badge: pendingAppointments.length === 0 ? 'Sin urgencia' : 'Revisa ahora',
      tone: 'violet',
    },
    {
      title: 'Confirmadas',
      value: confirmedAppointments.length,
      description: 'Citas que ya aceptaste con el coordinador.',
      icon: CalendarDaysIcon,
      badge: confirmedAppointments.length ? 'Bien hecho' : 'Aún no hay',
      tone: 'mint',
    },
    {
      title: 'Canceladas',
      value: cancelledAppointments.length,
      description: 'Citas rechazadas o canceladas.',
      icon: ShieldCheckIcon,
      badge: cancelledAppointments.length ? 'Revisar cambios' : 'Sin registros',
      tone: 'green',
    },
  ];

  return (
    <div className='space-y-8'>
      <section className='admin-hero p-6 sm:p-8 lg:p-10'>
        <div className='admin-reference-grid lg:grid-cols-[1.05fr_0.95fr]'>
          <div className='admin-reference-copy'>
            <span className='admin-kicker'>Portal padre de familia</span>
            <h1 className='admin-display admin-display--admin'>
              ¡Hola{user?.username ? `, ${user.username}` : ''}!
            </h1>
            <p className='admin-hero-copy admin-hero-copy--narrow'>
              El coordinador asigna la cita y tú recibes la notificación para conocer la fecha, la
              hora y los detalles de la reunión. Schedulito te mantiene al tanto de todo.
            </p>
            <span className='admin-soft-pill w-fit'>Acceso personalizado</span>
          </div>

          <div className='admin-reference-stage'>
            <span className='admin-reference-wave' aria-hidden='true' />
            <span className='admin-reference-pill admin-reference-pill--top'>
              <span className='block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#5e5e5e]'>Próxima cita</span>
              <span className='block text-sm font-black text-[#202020]'>{nextAppointmentLabel}</span>
            </span>
            <img src={mascotHero} alt='Schedulito, tu asistente de citas' className='admin-hero-illustration absolute bottom-2 right-2' />
          </div>
        </div>
      </section>

      <section className='admin-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center'>
        <span className='admin-stat-icon mint flex-shrink-0'>
          <MegaphoneIcon className='h-6 w-6' />
        </span>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-bold uppercase tracking-[0.2em] text-[#5648e7]'>Mensaje del coordinador</p>
          {generalMessage?.text ? (
            <>
              <p className='mt-2 text-sm text-[#202020]'>{generalMessage.text}</p>
              {generalMessage.author && (
                <p className='mt-1 text-xs text-[#5e5e5e]'>Publicado por: {generalMessage.author}</p>
              )}
            </>
          ) : (
            <p className='mt-2 text-sm text-[#5e5e5e]'>No hay mensajes generales del coordinador en este momento.</p>
          )}
        </div>
      </section>

      <section className='grid gap-5 lg:grid-cols-[1.35fr_0.85fr]'>
        <article className='admin-panel p-8'>
          <p className='admin-kicker'>Próxima cita</p>
          <h2 className='mt-3 text-3xl font-black text-[#202020]'>{nextAppointment?.title || 'Próxima cita disponible'}</h2>
          <p className='mt-4 text-sm text-[#5e5e5e]'>{nextAppointmentLabel}</p>
          {nextAppointment?.reason && (
            <div className='admin-card mt-6 p-5'>
              <p className='text-sm font-bold text-[#202020]'>Motivo</p>
              <p className='mt-2 text-sm text-[#5e5e5e]'>{nextAppointment.reason}</p>
            </div>
          )}
          <div className='admin-card mt-4 p-4'>
            <p className='text-xs uppercase tracking-[0.18em] text-[#5e5e5e]'>Enviado por</p>
            <p className='mt-1 text-sm font-semibold text-[#202020]'>{getCoordinatorLabel(nextAppointment)}</p>
          </div>

          <div className='mt-6 grid gap-4 sm:grid-cols-3'>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className='admin-card admin-stat-card p-5'>
                  <div className='flex items-center justify-between'>
                    <p className='text-xs font-bold uppercase tracking-[0.16em] text-[#5e5e5e]'>{stat.title}</p>
                    <span className={`admin-stat-icon ${stat.tone} h-9 w-9`}>
                      <Icon className='h-4 w-4' />
                    </span>
                  </div>
                  <p className='mt-3 text-3xl font-black text-[#202020]'>{stat.value}</p>
                  <p className='mt-2 text-sm text-[#5e5e5e]'>{stat.badge}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className='admin-panel p-8'>
          <p className='admin-kicker'>Citas próximas</p>
          <h2 className='mt-3 text-2xl font-black text-[#202020]'>Siguientes citas asignadas</h2>
          <div className='mt-6 space-y-4'>
            {upcomingAppointments.length === 0 ? (
              <div className='portal-empty-state'>
                <img src={mascotSmall} alt='Schedulito esperando citas' />
                <p className='text-sm font-bold text-[#202020]'>Sin citas programadas</p>
                <p className='text-sm text-[#5e5e5e]'>Aquí verás tus próximas citas en cuanto el coordinador las asigne.</p>
              </div>
            ) : (
              upcomingAppointments.slice(0, 4).map((appointment) => (
                <div key={appointment._id || appointment.id} className='admin-card p-4'>
                  <p className='text-sm font-semibold text-[#202020]'>{formatDate(appointment.date)}</p>
                  <p className='mt-1 text-sm text-[#5e5e5e]'>{`${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`}</p>
                  <p className='mt-2 text-sm text-[#202020]'>{appointment.reason || 'Sin información adicional'}</p>
                  <p className='mt-2 text-xs uppercase tracking-[0.18em] text-[#5e5e5e]'>Enviado por: {getCoordinatorLabel(appointment)}</p>
                  {(appointment.status || '').toString().trim().toUpperCase() === 'PENDING' && (
                    <div className='mt-3 flex gap-3'>
                      <button
                        type='button'
                        onClick={() => handleCancelAppointment(appointment)}
                        className='admin-button-danger flex-1 px-4 text-sm'
                        style={{ minHeight: '2.6rem' }}
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        className='admin-button-primary flex-1 px-4 text-sm'
                        style={{ minHeight: '2.6rem' }}
                      >
                        Confirmar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className='admin-panel p-6 sm:p-8'>
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='admin-kicker'>Resumen</p>
            <h2 className='mt-2 text-2xl font-black text-[#202020]'>Citas pendientes</h2>
            <p className='mt-2 text-[#5e5e5e]'>Aquí verás un resumen de las citas que aún requieren tu confirmación.</p>
          </div>
          <span className='admin-soft-pill w-fit'>Asignada por el coordinador</span>
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='admin-card p-6'>
            <p className='admin-kicker'>Total pendientes</p>
            <p className='mt-3 text-4xl font-black text-[#202020]'>{loading ? '...' : pendingAppointments.length}</p>
            <p className='mt-3 text-sm text-[#5e5e5e]'>Citas que están pendientes de tu respuesta.</p>
          </div>

          <div className='space-y-4'>
            {loading ? (
              <div className='admin-card admin-skeleton p-6 text-center text-sm text-[#5e5e5e]'>
                Cargando citas pendientes...
              </div>
            ) : pendingAppointments.length === 0 ? (
              <div className='portal-empty-state'>
                <img src={mascotSmall} alt='Schedulito sin pendientes' />
                <p className='text-sm font-bold text-[#202020]'>Todo al día</p>
                <p className='text-sm text-[#5e5e5e]'>No hay citas pendientes en este momento.</p>
              </div>
            ) : (
              <div className='admin-card p-6'>
                <p className='text-xs font-bold uppercase tracking-[0.25em] text-[#5e5e5e]'>Próxima cita pendiente</p>
                <h3 className='mt-3 text-xl font-bold text-[#202020]'>{nextAppointment ? formatDate(nextAppointment.date) : 'Sin fecha'}</h3>
                <p className='mt-2 text-sm text-[#5e5e5e]'>
                  {nextAppointment ? `${formatTime(nextAppointment.startTime)} - ${formatTime(nextAppointment.endTime)}` : 'Sin hora definida'}
                </p>
                <p className='mt-4 text-sm text-[#202020]'>{nextAppointment?.reason || 'Razón no disponible'}</p>

                {pendingAppointments.length > 1 && (
                  <div className='mt-6 space-y-3'>
                    <p className='text-sm font-semibold text-[#202020]'>Otras citas pendientes</p>
                    <div className='space-y-2'>
                      {pendingAppointments.slice(1, 4).map((appointment) => (
                        <div key={appointment._id || appointment.id} className='rounded-2xl border border-[rgba(32,32,32,0.08)] bg-[rgba(247,251,248,0.9)] p-4'>
                          <p className='text-sm font-semibold text-[#202020]'>{formatDate(appointment.date)}</p>
                          <p className='text-sm text-[#5e5e5e]'>{`${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {showCancelModal && selectedAppointmentToCancel && (
        <div className='portal-modal-backdrop'>
          <div className='w-full max-w-md admin-panel p-8'>
            <div className='mb-6 flex items-start gap-3'>
              <span className='portal-mascot-bubble h-12 w-12 flex-shrink-0'>
                <img src={mascotSmall} alt='Schedulito' />
              </span>
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.3em] text-[#b93144]'>Cancelar cita</p>
                <h2 className='mt-2 text-xl font-black text-[#202020]'>¿Cancelar la cita?</h2>
                <p className='mt-1 text-sm text-[#5e5e5e]'>
                  {formatDate(selectedAppointmentToCancel.date)} a las {formatTime(selectedAppointmentToCancel.startTime)}
                </p>
              </div>
            </div>

            <div className='admin-card mb-6 space-y-4 p-4'>
              <div>
                <label className='text-sm font-semibold text-[#202020]'>Sugiere una nueva fecha</label>
                <input
                  type='date'
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className='admin-input mt-2 w-full px-4 py-2 text-sm'
                />
              </div>

              <div>
                <label className='text-sm font-semibold text-[#202020]'>Sugiere una hora</label>
                <input
                  type='time'
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className='admin-input mt-2 w-full px-4 py-2 text-sm'
                />
              </div>
            </div>

            <div className='flex gap-3'>
              <button
                type='button'
                onClick={() => setShowCancelModal(false)}
                className='admin-button-secondary flex-1 px-4 text-sm'
              >
                Atrás
              </button>
              <button
                type='button'
                onClick={handleSubmitCancelation}
                disabled={actionLoading}
                className='admin-button-danger flex-1 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60'
              >
                {actionLoading ? 'Enviando...' : 'Cancelar cita'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
