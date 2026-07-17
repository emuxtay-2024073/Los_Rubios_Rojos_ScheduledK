import { useEffect, useState } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { ClientButton } from '../../shared/components/ui/ClientButton.jsx';
import { ClientInput } from '../../shared/components/ui/ClientInput.jsx';
import { ClientModal } from '../../shared/components/ui/ClientModal.jsx';
import {
  createAppointment,
  getParentAppointments,
  confirmAppointment,
  cancelAppointment,
} from '../../services/adminApi.js';
import { showError, showSuccess } from '../../shared/utils/toast.js';

const emptyForm = {
  date: '',
  startTime: '',
  endTime: '',
  reason: '',
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusLabel = (status) => {
  const normalized = (status || '').toString().trim().toUpperCase();
  if (normalized === 'CONFIRMED') return 'Confirmada';
  if (normalized === 'CANCELLED') return 'Cancelada';
  if (normalized === 'COMPLETED') return 'Completada';
  if (normalized === 'RESCHEDULED') return 'Reprogramada';
  return 'Pendiente';
};

export const ClientReservationsPage = () => {
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState(null);
  const [rejectMessage, setRejectMessage] = useState('');

  const role = (user?.role || '').toUpperCase();
  const isParent = role === 'PADRE';

  useEffect(() => {
    if (!isParent) return;

    const loadAppointments = async () => {
      setLoadingAppointments(true);
      try {
        const data = await getParentAppointments();
        setAppointments(data);
      } catch (error) {
        const apiMessage = error?.response?.data?.message || error?.message || 'No se pudieron cargar las citas';
        showError(apiMessage);
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, [isParent]);

  const appointmentDateTime = `${form.date || ''}T${form.startTime || ''}`;
  const appointmentDate = appointmentDateTime ? new Date(appointmentDateTime) : null;
  const isDateValid = appointmentDate && !Number.isNaN(appointmentDate.getTime()) && appointmentDate > new Date();

  const canSubmit =
    Boolean(user?.id) &&
    form.reason.trim() &&
    form.date &&
    form.startTime &&
    form.endTime &&
    isDateValid;

  const validateForm = () => {
    const errors = {};

    if (!user?.id) errors.user = 'Debes iniciar sesión para agendar una cita.';
    if (!form.date) errors.date = 'Selecciona una fecha.';
    if (!form.startTime) errors.startTime = 'Selecciona la hora de inicio.';
    if (!form.endTime) errors.endTime = 'Selecciona la hora de fin.';
    if (!form.reason.trim()) errors.reason = 'Describe la razón de la cita.';
    if (!isDateValid) errors.date = 'La fecha y hora deben ser futuras.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      showError('Revisa los campos del formulario antes de enviar.');
      return;
    }

    const payload = {
      parentId: user.id,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      reason: form.reason.trim(),
    };

    try {
      setLoading(true);
      await createAppointment(payload);
      setSubmitted(true);
      showSuccess('Cita creada correctamente');
      setForm(emptyForm);
      setFormErrors({});
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || 'No se pudo crear la cita';
      showError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const data = await getParentAppointments();
      setAppointments(data);
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || 'No se pudieron actualizar las citas';
      showError(apiMessage);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleConfirm = async (id) => {
    setActionLoadingId(id);
    try {
      await confirmAppointment(id);
      showSuccess('Cita confirmada correctamente');
      await refreshAppointments();
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || 'No se pudo confirmar la cita';
      showError(apiMessage);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (id) => {
    setSelectedRejectId(id);
    setRejectMessage('');
    setRejectOpen(true);
  };

  const handleCancel = async (id, message) => {
    setActionLoadingId(id);
    try {
      await cancelAppointment(id, { suggestionMessage: message });
      showSuccess('Cita rechazada correctamente');
      setRejectOpen(false);
      setSelectedRejectId(null);
      setRejectMessage('');
      await refreshAppointments();
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || 'No se pudo rechazar la cita';
      showError(apiMessage);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8'>
      {isParent ? (
        <div className='space-y-8'>
          <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
            <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>Citas</p>
            <h1 className='mt-1 text-3xl font-black text-gray-900'>Citas asignadas</h1>
            <p className='mt-2 text-gray-700'>
              Revisa las citas que te asignó tu coordinador y responde según tus disponibilidades.
            </p>

            <div className='mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
              {loadingAppointments ? (
                <p className='text-sm text-gray-600'>Cargando citas asignadas...</p>
              ) : appointments.length === 0 ? (
                <div className='rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center'>
                  <p className='text-lg font-semibold text-gray-900'>Aún no tienes citas asignadas</p>
                  <p className='mt-2 text-sm text-gray-600'>Cuando el coordinador programe una reunión, aparecerá aquí.</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {appointments.map((appointment) => {
                    const appointmentId = appointment._id || appointment.id;
                    return (
                      <article key={appointmentId} className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
                        <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
                          <div>
                            <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>Fecha</p>
                            <h2 className='mt-1 text-xl font-bold text-gray-900'>{formatDate(appointment.date)}</h2>
                            <p className='mt-2 text-sm text-gray-600'>
                              {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                            </p>
                          </div>
                          <div className='inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700'>
                            {getStatusLabel(appointment.status)}
                          </div>
                        </div>

                        <div className='mt-6 grid gap-4 md:grid-cols-[1fr_auto]'>
                          <div>
                            <p className='text-sm font-semibold text-gray-900'>Razón</p>
                            <p className='mt-2 text-gray-600'>{appointment.reason}</p>
                          </div>
                          <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                            {appointment.status === 'PENDING' ? (
                              <>
                                <ClientButton
                                  type='button'
                                  onClick={() => void handleConfirm(appointmentId)}
                                  disabled={actionLoadingId === appointmentId}
                                  className='min-w-[10rem]'
                                >
                                  {actionLoadingId === appointmentId ? 'Procesando...' : 'Confirmar'}
                                </ClientButton>
                                <ClientButton
                                  type='button'
                                  onClick={() => openRejectModal(appointmentId)}
                                  disabled={actionLoadingId === appointmentId}
                                  className='min-w-[10rem] bg-rose-600 hover:bg-rose-700'
                                >
                                  {actionLoadingId === appointmentId ? 'Procesando...' : 'Rechazar'}
                                </ClientButton>
                              </>
                            ) : (
                              <p className='self-center text-sm text-slate-600'>No se puede modificar esta cita.</p>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className='grid gap-8 lg:grid-cols-[1.1fr_0.9fr]'>
          <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
            <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>Citas</p>
            <h1 className='mt-1 text-3xl font-black text-gray-900'>Agenda tu cita</h1>
            <p className='mt-2 text-gray-700'>
              Programa una cita seleccionando fecha, hora y explicando el motivo de la reunión.
            </p>

            <div className='mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
              <form onSubmit={onSubmit} className='mx-auto w-full max-w-3xl grid gap-6 sm:grid-cols-2'>
                <div className='sm:col-span-2'>
                  <label className='block space-y-1.5'>
                    <span className='text-sm font-medium text-gray-900'>Razón de la cita</span>
                    <textarea
                      rows='4'
                      value={form.reason}
                      onChange={(event) => setForm({ ...form, reason: event.target.value })}
                      className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-main-blue focus:ring-2 focus:ring-main-blue/20'
                      placeholder='Describe el motivo de la cita'
                    />
                  </label>
                  {formErrors.reason && <p className='mt-2 text-sm text-rose-600'>{formErrors.reason}</p>}
                </div>

                <div>
                  <ClientInput
                    label='Fecha'
                    type='date'
                    value={form.date}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                  />
                  {formErrors.date && <p className='mt-2 text-sm text-rose-600'>{formErrors.date}</p>}
                </div>

                <div>
                  <ClientInput
                    label='Hora inicio'
                    type='time'
                    value={form.startTime}
                    onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                  />
                  {formErrors.startTime && <p className='mt-2 text-sm text-rose-600'>{formErrors.startTime}</p>}
                </div>

                <div>
                  <ClientInput
                    label='Hora fin'
                    type='time'
                    value={form.endTime}
                    onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                  />
                  {formErrors.endTime && <p className='mt-2 text-sm text-rose-600'>{formErrors.endTime}</p>}
                </div>

                <div className='sm:col-span-2'>
                  <ClientButton type='submit' disabled={!canSubmit || loading} className='w-full disabled:cursor-not-allowed disabled:opacity-60'>
                    {loading ? 'Enviando...' : 'Agendar cita'}
                  </ClientButton>
                </div>
              </form>
            </div>
          </section>

          <section className='space-y-5 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>Vista previa</p>
              <h2 className='mt-1 text-2xl font-bold text-gray-900'>Confirmación visual</h2>
            </div>
            <article className='rounded-3xl bg-[linear-gradient(135deg,rgba(86,72,231,0.95),rgba(124,114,240,0.92))] p-6 text-white shadow-lg'>
              <p className='text-sm uppercase tracking-[0.25em] text-white/80'>Cita programada</p>
              <h3 className='mt-2 text-2xl font-bold'>{form.reason || 'Razón de la cita'}</h3>
              <p className='mt-4 text-white/90'>{user?.email || 'correo@ejemplo.com'}</p>
              <p className='mt-4 text-sm text-white/85'>
                {form.date || 'Fecha'} · {form.startTime || 'Hora inicio'} – {form.endTime || 'Hora fin'}
              </p>
            </article>
          </section>
        </div>
      )}

      <ClientModal open={submitted} title='Cita creada' onClose={() => setSubmitted(false)}>
        <div className='space-y-4'>
          <p className='text-gray-700'>Tu cita quedó registrada correctamente.</p>
          <div className='flex justify-end'>
            <ClientButton onClick={() => setSubmitted(false)}>Entendido</ClientButton>
          </div>
        </div>
      </ClientModal>

      <ClientModal open={rejectOpen} title='Rechazar cita' onClose={() => setRejectOpen(false)}>
        <div className='space-y-4'>
          <p className='text-gray-700'>Escribe un mensaje para que el coordinador sepa qué día u hora te queda mejor.</p>
          <label className='block space-y-2'>
            <span className='text-sm font-medium text-gray-900'>Sugerencia para reprogramar</span>
            <textarea
              rows='4'
              value={rejectMessage}
              onChange={(event) => setRejectMessage(event.target.value)}
              className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-main-blue focus:ring-2 focus:ring-main-blue/20'
              placeholder='Por ejemplo: Me queda mejor el martes por la tarde, o el jueves después de las 4pm.'
            />
          </label>
          <div className='flex justify-end gap-3'>
            <ClientButton type='button' onClick={() => setRejectOpen(false)} className='bg-slate-200 text-slate-700 hover:bg-slate-300'>Cancelar</ClientButton>
            <ClientButton
              type='button'
              onClick={() => void handleCancel(selectedRejectId, rejectMessage)}
              disabled={actionLoadingId === selectedRejectId}
            >
              {actionLoadingId === selectedRejectId ? 'Procesando...' : 'Enviar rechazo'}
            </ClientButton>
          </div>
        </div>
      </ClientModal>
    </div>
  );
};
