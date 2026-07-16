import { useEffect, useMemo, useState } from 'react';
import { getAppointments, createAppointment } from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { showError, showSuccess } from '../shared/utils/toast.js';
import { ClientButton } from '../shared/components/ui/ClientButton.jsx';
import { ClientInput } from '../shared/components/ui/ClientInput.jsx';
import { ClientModal } from '../shared/components/ui/ClientModal.jsx';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
};

export const Reservations = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
  }, []);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const query = search.toLowerCase();
        return (
          appointment.customerName?.toLowerCase().includes(query) ||
          appointment.customerEmail?.toLowerCase().includes(query) ||
          appointment.customerPhone?.toLowerCase().includes(query) ||
          appointment.title?.toLowerCase().includes(query)
        );
      }),
    [appointments, search],
  );

  const appointmentDateTime = `${form.appointmentDate || ''}T${form.appointmentTime || ''}`;
  const appointmentDate = appointmentDateTime ? new Date(appointmentDateTime) : null;
  const isDateValid = appointmentDate && !Number.isNaN(appointmentDate.getTime()) && appointmentDate > new Date();

  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) errors.title = 'El título es obligatorio.';
    if (!form.customerName.trim()) errors.customerName = 'El nombre es obligatorio.';
    if (!form.customerEmail.trim()) errors.customerEmail = 'El correo electrónico es obligatorio.';
    if (!form.customerPhone.trim()) errors.customerPhone = 'El teléfono es obligatorio.';
    if (!form.appointmentDate) errors.appointmentDate = 'Selecciona una fecha.';
    if (!form.appointmentTime) errors.appointmentTime = 'Selecciona una hora.';
    if (!isDateValid) errors.appointmentDate = 'La fecha y hora deben ser futuras.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      showError('Revisa los campos del formulario antes de enviar.');
      return;
    }

    try {
      setSaving(true);
      await createAppointment({
        title: form.title.trim(),
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
        appointmentDate: appointmentDateTime,
        notes: form.notes.trim(),
      });
      setSubmitted(true);
      showSuccess('Cita creada correctamente');
      setForm({
        title: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        appointmentDate: '',
        appointmentTime: '',
        notes: '',
      });
      setFormErrors({});
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
        <div>
          <p className='admin-kicker'>Citas y Reservaciones</p>
          <h1 className='admin-title mt-2'>Citas</h1>
          <p className='admin-subtitle mt-2 text-sm'>Gestiona citas, horarios y estado de cada reservación.</p>
        </div>
        <ClientButton onClick={() => setCreateOpen(true)}>Agregar cita</ClientButton>
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
            placeholder='Buscar cliente, título, correo o teléfono'
            className='admin-input w-full max-w-xs px-4 py-3 text-sm'
          />
        </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='admin-table min-w-full text-left'>
            <thead className='text-sm'>
              <tr>
                <th className='px-5 py-4'>Título</th>
                <th className='px-5 py-4'>Cliente</th>
                <th className='px-5 py-4'>Contacto</th>
                <th className='px-5 py-4'>Fecha y hora</th>
                <th className='px-5 py-4'>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment._id} className='border-t border-[#7C2D12]/10'>
                  <td className='px-5 py-4'>{appointment.title || 'Sin título'}</td>
                  <td className='px-5 py-4'>{appointment.customerName || 'N/A'}</td>
                  <td className='px-5 py-4'>
                    <p>{appointment.customerEmail || 'Sin correo'}</p>
                    <p className='text-xs text-gray-500'>{appointment.customerPhone || 'Sin teléfono'}</p>
                  </td>
                  <td className='px-5 py-4'>{formatDate(appointment.appointmentDate)}</td>
                  <td className='px-5 py-4'>
                    <span className='admin-status admin-status-success'>
                      {appointment.status ?? 'Programada'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan='5' className='px-5 py-8 text-center text-sm text-gray-500'>
                    No hay citas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClientModal open={createOpen} title='Agregar nueva cita' onClose={() => setCreateOpen(false)}>
        <div className='mx-auto w-full max-w-xl rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
          <form onSubmit={handleCreateSubmit} className='grid gap-5 sm:grid-cols-2'>
            <div className='sm:col-span-2'>
              <ClientInput
                label='Título de la cita'
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder='Ej: Reunión con familia'
              />
              {formErrors.title && <p className='mt-2 text-sm text-rose-600'>{formErrors.title}</p>}
            </div>

          <div>
            <ClientInput
              label='Nombre completo'
              value={form.customerName}
              onChange={(event) => setForm({ ...form, customerName: event.target.value })}
            />
            {formErrors.customerName && <p className='mt-2 text-sm text-rose-600'>{formErrors.customerName}</p>}
          </div>

          <div>
            <ClientInput
              label='Correo electrónico'
              type='email'
              value={form.customerEmail}
              onChange={(event) => setForm({ ...form, customerEmail: event.target.value })}
            />
            {formErrors.customerEmail && <p className='mt-2 text-sm text-rose-600'>{formErrors.customerEmail}</p>}
          </div>

          <div>
            <ClientInput
              label='Teléfono'
              value={form.customerPhone}
              onChange={(event) => setForm({ ...form, customerPhone: event.target.value })}
            />
            {formErrors.customerPhone && <p className='mt-2 text-sm text-rose-600'>{formErrors.customerPhone}</p>}
          </div>

          <div>
            <ClientInput
              label='Fecha'
              type='date'
              value={form.appointmentDate}
              onChange={(event) => setForm({ ...form, appointmentDate: event.target.value })}
            />
            {formErrors.appointmentDate && <p className='mt-2 text-sm text-rose-600'>{formErrors.appointmentDate}</p>}
          </div>

          <div>
            <ClientInput
              label='Hora'
              type='time'
              value={form.appointmentTime}
              onChange={(event) => setForm({ ...form, appointmentTime: event.target.value })}
            />
            {formErrors.appointmentTime && <p className='mt-2 text-sm text-rose-600'>{formErrors.appointmentTime}</p>}
          </div>

          <label className='sm:col-span-2 block space-y-1.5'>
            <span className='text-sm font-medium text-gray-900'>Notas</span>
            <textarea
              rows='4'
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-main-blue focus:ring-2 focus:ring-main-blue/20'
              placeholder='Detalles adicionales sobre la cita'
            />
          </label>

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
    </div>
  );
};
