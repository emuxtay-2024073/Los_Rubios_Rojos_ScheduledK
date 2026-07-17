import { useEffect, useState } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { getParentAppointments, getMyNotifications } from '../../services/adminApi.js';
import { showError, showSuccess } from '../../shared/utils/toast.js';
import { CalendarDaysIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

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
    },
    {
      title: 'Confirmadas',
      value: confirmedAppointments.length,
      description: 'Citas que ya aceptaste con el coordinador.',
      icon: CalendarDaysIcon,
      badge: confirmedAppointments.length ? 'Bien hecho' : 'Aún no hay',
    },
    {
      title: 'Canceladas',
      value: cancelledAppointments.length,
      description: 'Citas rechazadas o canceladas.',
      icon: ShieldCheckIcon,
      badge: cancelledAppointments.length ? 'Revisar cambios' : 'Sin registros',
    },
  ];

  return (
    <div className='space-y-8'>
      <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8 lg:p-10'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-2xl space-y-4'>
            <p className='inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700'>Portal padre de familia</p>
            <h1 className='text-4xl font-black tracking-tight text-gray-900 sm:text-5xl'>Vista para padres</h1>
            <p className='text-base text-gray-700 sm:text-lg'>El coordinador asigna la cita y tú recibes la notificación para conocer la fecha, la hora y los detalles de la reunión.</p>
          </div>
          <div className='rounded-3xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm font-semibold text-sky-800'>Acceso personalizado</div>
        </div>
      </section>

      <section className='rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm'>
        <p className='text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700'>Mensaje del coordinador</p>
        {generalMessage?.text ? (
          <>
            <p className='mt-3 text-sm text-slate-700'>{generalMessage.text}</p>
            {generalMessage.author && (
              <p className='mt-2 text-sm text-slate-500'>Publicado por: {generalMessage.author}</p>
            )}
          </>
        ) : (
          <div className='mt-3 rounded-2xl border border-dashed border-emerald-100 bg-emerald-25 p-4 text-sm text-slate-600'>
            No hay mensajes generales del coordinador en este momento.
          </div>
        )}
      </section>

      <section className='grid gap-5 lg:grid-cols-[1.35fr_0.85fr]'>
        <article className='rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-[0.3em] text-sky-700'>Próxima cita</p>
          <h2 className='mt-3 text-3xl font-black text-gray-900'>{nextAppointment?.title || 'Próxima cita disponible'}</h2>
          <p className='mt-4 text-sm text-gray-600'>{nextAppointmentLabel}</p>
          {nextAppointment?.reason && (
            <div className='mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5'>
              <p className='text-sm font-semibold text-slate-900'>Motivo</p>
              <p className='mt-2 text-sm text-slate-700'>{nextAppointment.reason}</p>
            </div>
          )}
          <div className='mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4'>
            <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>Enviado por</p>
            <p className='mt-1 text-sm font-semibold text-slate-900'>{getCoordinatorLabel(nextAppointment)}</p>
          </div>

          <div className='mt-6 grid gap-4 sm:grid-cols-3'>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-semibold uppercase tracking-[0.2em] text-slate-700'>{stat.title}</p>
                    <Icon className='h-5 w-5 text-slate-500' />
                  </div>
                  <p className='mt-3 text-3xl font-black text-gray-900'>{stat.value}</p>
                  <p className='mt-2 text-sm text-gray-600'>{stat.badge}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className='rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-[0.3em] text-sky-700'>Citas próximas</p>
          <h2 className='mt-3 text-2xl font-black text-gray-900'>Siguientes citas asignadas</h2>
          <div className='mt-6 space-y-4'>
            {upcomingAppointments.length === 0 ? (
              <div className='rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500'>
                No hay citas programadas para los próximos días.
              </div>
            ) : (
              upcomingAppointments.slice(0, 4).map((appointment) => (
                <div key={appointment._id || appointment.id} className='rounded-3xl border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-sm font-semibold text-slate-900'>{formatDate(appointment.date)}</p>
                  <p className='mt-1 text-sm text-slate-600'>{`${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`}</p>
                  <p className='mt-2 text-sm text-slate-700'>{appointment.reason || 'Sin información adicional'}</p>
                  <p className='mt-2 text-xs uppercase tracking-[0.18em] text-slate-500'>Enviado por: {getCoordinatorLabel(appointment)}</p>
                  {(appointment.status || '').toString().trim().toUpperCase() === 'PENDING' && (
                    <div className='mt-3 flex gap-3'>
                      <button
                        type='button'
                        onClick={() => handleCancelAppointment(appointment)}
                        className='flex-1 rounded-2xl border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100'
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        className='flex-1 rounded-2xl bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700'
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

      <section className='rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.25em] text-sky-700'>Resumen</p>
            <h2 className='mt-2 text-2xl font-bold text-gray-900'>Citas pendientes</h2>
            <p className='mt-2 text-gray-600'>Aquí verás un resumen de las citas que aún requieren tu confirmación.</p>
          </div>
          <div className='rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700'>Asignada por el coordinador</div>
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-3xl border border-slate-200 bg-slate-50 p-6'>
            <p className='text-sm font-semibold uppercase tracking-[0.25em] text-sky-700'>Total pendientes</p>
            <p className='mt-3 text-4xl font-black text-gray-900'>{loading ? '...' : pendingAppointments.length}</p>
            <p className='mt-3 text-sm text-gray-600'>Citas que están pendientes de tu respuesta.</p>
          </div>

          <div className='space-y-4'>
            {loading ? (
              <div className='rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500'>
                Cargando citas pendientes...
              </div>
            ) : pendingAppointments.length === 0 ? (
              <div className='rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500'>
                No hay citas pendientes en este momento.
              </div>
            ) : (
              <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                <p className='text-sm font-semibold uppercase tracking-[0.25em] text-slate-500'>Próxima cita pendiente</p>
                <h3 className='mt-3 text-xl font-bold text-gray-900'>{nextAppointment ? formatDate(nextAppointment.date) : 'Sin fecha'}</h3>
                <p className='mt-2 text-sm text-gray-600'>
                  {nextAppointment ? `${formatTime(nextAppointment.startTime)} - ${formatTime(nextAppointment.endTime)}` : 'Sin hora definida'}
                </p>
                <p className='mt-4 text-sm text-gray-700'>{nextAppointment?.reason || 'Razón no disponible'}</p>

                {pendingAppointments.length > 1 && (
                  <div className='mt-6 space-y-3'>
                    <p className='text-sm font-semibold text-slate-900'>Otras citas pendientes</p>
                    <div className='space-y-2'>
                      {pendingAppointments.slice(1, 4).map((appointment) => (
                        <div key={appointment._id || appointment.id} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                          <p className='text-sm font-semibold text-slate-900'>{formatDate(appointment.date)}</p>
                          <p className='text-sm text-slate-600'>{`${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`}</p>
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
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl'>
            <div className='mb-6'>
              <p className='text-sm font-semibold uppercase tracking-[0.3em] text-red-700'>Cancelar cita</p>
              <h2 className='mt-3 text-2xl font-black text-slate-900'>¿Cancelar la cita?</h2>
              <p className='mt-2 text-sm text-slate-600'>
                {formatDate(selectedAppointmentToCancel.date)} a las {formatTime(selectedAppointmentToCancel.startTime)}
              </p>
            </div>

            <div className='mb-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4'>
              <div>
                <label className='text-sm font-semibold text-slate-700'>Sugiere una nueva fecha</label>
                <input
                  type='date'
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className='mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100'
                />
              </div>

              <div>
                <label className='text-sm font-semibold text-slate-700'>Sugiere una hora</label>
                <input
                  type='time'
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className='mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100'
                />
              </div>
            </div>

            <div className='flex gap-3'>
              <button
                type='button'
                onClick={() => setShowCancelModal(false)}
                className='flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
              >
                Atrás
              </button>
              <button
                type='button'
                onClick={handleSubmitCancelation}
                disabled={actionLoading}
                className='flex-1 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'
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


