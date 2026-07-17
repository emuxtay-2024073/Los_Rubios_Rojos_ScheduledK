import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../features/auth/store/authStore.js';
import { getAppointments, createAppointment, updateAppointment } from '../services/adminApi.js';
import { useUserManagementStore } from '../features/auth/store/useUserManagementStore.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { showError, showSuccess } from '../shared/utils/toast.js';
import { ClientButton } from '../shared/components/ui/ClientButton.jsx';
import { ClientInput } from '../shared/components/ui/ClientInput.jsx';
import { ClientModal } from '../shared/components/ui/ClientModal.jsx';
import { BackButton } from '../shared/components/ui/BackButton.jsx';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-GT', { dateStyle: 'medium' });
};

const formatTime = (value) => {
  if (!value) return 'Sin hora';
  return new Date(value).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
};

export const Reservations = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    parentId: '',
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStart, setRescheduleStart] = useState('');
  const [rescheduleEnd, setRescheduleEnd] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const role = user?.role?.toUpperCase();
  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'ADMIN_ROLE'].includes(role);

  const { users, getAllUsers } = useUserManagementStore();

  const parents = useMemo(
    () => users.filter((item) => (item.role || '').toUpperCase() === 'PADRE'),
    [users],
  );

  const parentLabel = (parentId) => {
    const parent = parents.find((item) => item._id === parentId || item.id === parentId);
    return parent?.username || parent?.email || parent?.name || parentId || 'Padre desconocido';
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showError('No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    getAllUsers(undefined, { force: true });
  }, [getAllUsers]);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const query = search.toLowerCase();
        return (
          appointment.parentId?.toLowerCase().includes(query) ||
          appointment.reason?.toLowerCase().includes(query) ||
          appointment.status?.toLowerCase().includes(query)
        );
      }),
    [appointments, search],
  );

  const validateForm = () => {
    const errors = {};

    if (!form.parentId) errors.parentId = 'Selecciona un padre.';
    if (!form.date) errors.date = 'Selecciona una fecha.';
    if (!form.startTime) errors.startTime = 'Selecciona la hora de inicio.';
    if (!form.endTime) errors.endTime = 'Selecciona la hora de fin.';
    if (!form.reason.trim()) errors.reason = 'La razón es obligatoria.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenReschedule = (appointment) => {
    if (isAdmin) {
      showError('Los administradores no pueden reagendar citas.');
      return;
    }

    setSelectedAppointment(appointment);
    setRescheduleDate(appointment.date ? new Date(appointment.date).toISOString().slice(0, 10) : '');
    setRescheduleStart(appointment.startTime ? new Date(appointment.startTime).toISOString().slice(11, 16) : '');
    setRescheduleEnd(appointment.endTime ? new Date(appointment.endTime).toISOString().slice(11, 16) : '');
    setRescheduleOpen(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedAppointment) {
      showError('Selecciona una cita para reagendar.');
      return;
    }

    if (!rescheduleDate || !rescheduleStart || !rescheduleEnd) {
      showError('Completa la fecha y las horas de inicio y fin.');
      return;
    }

    if (isAdmin) {
      showError('Los administradores no pueden reagendar citas.');
      return;
    }

    try {
      setRescheduleLoading(true);
      await updateAppointment(selectedAppointment._id, {
        date: rescheduleDate,
        startTime: rescheduleStart,
        endTime: rescheduleEnd,
      });
      showSuccess('Cita reagendada correctamente.');
      setRescheduleOpen(false);
      setSelectedAppointment(null);
      setRescheduleDate('');
      setRescheduleStart('');
      setRescheduleEnd('');
      loadAppointments();
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || 'No se pudo reagendar la cita';
      showError(apiMessage);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      showError('Revisa los campos del formulario antes de enviar.');
      return;
    }

    if (isAdmin) {
      showError('Los administradores no pueden crear citas.');
      return;
    }

    try {
      setSaving(true);
      await createAppointment({
        parentId: form.parentId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        reason: form.reason.trim(),
      });
      showSuccess('Cita creada correctamente');
      setForm({
        parentId: '',
        date: '',
        startTime: '',
        endTime: '',
        reason: '',
      });
      setFormErrors({});
      setCreateOpen(false);
      loadAppointments();
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || 'No se pudo crear la cita';
      showError(apiMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className='admin-page space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div className='flex flex-col gap-4'>
          <BackButton />
          <div>
            <p className='admin-kicker'>Citas y Reservaciones</p>
            <h1 className='admin-title mt-2'>Citas</h1>
            <p className='admin-subtitle mt-2 text-sm'>Gestiona citas, horarios y estado de cada reservación.</p>
            {isAdmin && (
              <p className='mt-2 text-sm text-slate-500'>Modo solo lectura para administradores. No se puede crear, reagendar ni cancelar citas desde aquí.</p>
            )}
          </div>
        </div>
        {!isAdmin && (
          <ClientButton onClick={() => setCreateOpen(true)}>Agregar cita</ClientButton>
        )}
      </div>

      <div className='admin-panel overflow-hidden'>
        <div className='p-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className='text-sm font-bold text-[#6B7280]'>Total citas</p>
              <p className='mt-2 text-3xl font-black text-[#1F2937]'>{appointments.length}</p>
            </div>
            <input
              type='search'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Buscar padre, razón o estado'
              className='admin-input w-full max-w-xs px-4 py-3 text-sm'
            />
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='admin-table min-w-full text-left'>
            <thead className='text-sm'>
              <tr>
                <th className='px-5 py-4'>Padre</th>
                <th className='px-5 py-4'>Fecha</th>
                <th className='px-5 py-4'>Hora inicio</th>
                <th className='px-5 py-4'>Hora fin</th>
                <th className='px-5 py-4'>Estado</th>
                <th className='px-5 py-4'>Razón</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment._id} className='border-t border-[#7C2D12]/10'>
                  <td className='px-5 py-4'>{parentLabel(appointment.parentId)}</td>
                  <td className='px-5 py-4'>{formatDate(appointment.date)}</td>
                  <td className='px-5 py-4'>{formatTime(appointment.startTime)}</td>
                  <td className='px-5 py-4'>{formatTime(appointment.endTime)}</td>
                  <td className='px-5 py-4'>
                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                      <span className='admin-status admin-status-success'>
                        {appointment.status || 'PENDING'}
                      </span>
                      {appointment.status?.toString().trim().toUpperCase() === 'CANCELLED' && !isAdmin && (
                        <button
                          type='button'
                          onClick={() => handleOpenReschedule(appointment)}
                          className='rounded-full border border-emerald-600 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100'
                        >
                          Reagendar
                        </button>
                      )}
                    </div>
                  </td>
                  <td className='px-5 py-4'>{appointment.reason || 'Sin razón'}</td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan='6' className='px-5 py-8 text-center text-sm text-gray-500'>
                    No hay citas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClientModal open={createOpen} title='Agregar nueva cita' onClose={() => setCreateOpen(false)}>
        <div className='mx-auto w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
          <form onSubmit={handleCreateSubmit} className='grid gap-5 sm:grid-cols-2'>
            <div className='sm:col-span-2'>
              <label className='block space-y-1.5'>
                <span className='text-sm font-medium text-gray-900'>Padre</span>
                <select
                  value={form.parentId}
                  onChange={(event) => setForm({ ...form, parentId: event.target.value })}
                  className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-main-blue focus:ring-2 focus:ring-main-blue/20'
                >
                  <option value=''>Selecciona un padre</option>
                  {parents.map((parent) => (
                    <option key={parent._id || parent.id} value={parent._id || parent.id}>
                      {parent.username || parent.email || parent.name || parent._id || parent.id}
                    </option>
                  ))}
                </select>
              </label>
              {formErrors.parentId && <p className='mt-2 text-sm text-rose-600'>{formErrors.parentId}</p>}
            </div>

            <div className='sm:col-span-2'>
              <label className='block space-y-1.5'>
                <span className='text-sm font-medium text-gray-900'>Razón de la cita</span>
                <textarea
                  rows='4'
                  value={form.reason}
                  onChange={(event) => setForm({ ...form, reason: event.target.value })}
                  className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-main-blue focus:ring-2 focus:ring-main-blue/20'
                  placeholder='Describe la razón de la cita'
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

            <div className='sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end'>
              <ClientButton type='button' variant='secondary' onClick={() => setCreateOpen(false)}>
                Cancelar
              </ClientButton>
              <ClientButton type='submit' disabled={saving} className='disabled:cursor-not-allowed disabled:opacity-60'>
                {saving ? 'Guardando...' : 'Guardar cita'}
              </ClientButton>
            </div>
          </form>
        </div>
      </ClientModal>

      <ClientModal open={rescheduleOpen} title='Reagendar cita cancelada' onClose={() => setRescheduleOpen(false)}>
        <div className='mx-auto w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
          <div className='grid gap-5 sm:grid-cols-2'>
            <div className='sm:col-span-2'>
              <p className='text-sm font-medium text-gray-900'>Padre</p>
              <p className='mt-2 text-base font-semibold text-slate-900'>{parentLabel(selectedAppointment?.parentId)}</p>
            </div>

            {selectedAppointment?.suggestionMessage && (
              <div className='sm:col-span-2'>
                <p className='text-sm font-medium text-gray-900'>Sugerencia del padre</p>
                <p className='mt-2 text-sm text-slate-700 whitespace-pre-wrap'>{selectedAppointment.suggestionMessage}</p>
              </div>
            )}

            <div>
              <ClientInput
                label='Nueva fecha'
                type='date'
                value={rescheduleDate}
                onChange={(event) => setRescheduleDate(event.target.value)}
              />
            </div>

            <div>
              <ClientInput
                label='Nueva hora de inicio'
                type='time'
                value={rescheduleStart}
                onChange={(event) => setRescheduleStart(event.target.value)}
              />
            </div>

            <div>
              <ClientInput
                label='Nueva hora de fin'
                type='time'
                value={rescheduleEnd}
                onChange={(event) => setRescheduleEnd(event.target.value)}
              />
            </div>

            <div className='sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end'>
              <ClientButton type='button' variant='secondary' onClick={() => setRescheduleOpen(false)}>
                Cancelar
              </ClientButton>
              <ClientButton
                type='button'
                onClick={handleRescheduleSubmit}
                disabled={rescheduleLoading}
                className='disabled:cursor-not-allowed disabled:opacity-60'
              >
                {rescheduleLoading ? 'Reagendando...' : 'Reagendar cita'}
              </ClientButton>
            </div>
          </div>
        </div>
      </ClientModal>
    </div>
  );
};
