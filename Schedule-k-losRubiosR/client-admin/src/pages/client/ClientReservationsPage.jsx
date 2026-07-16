import { useState } from 'react';
import { ClientButton } from '../../shared/components/ui/ClientButton.jsx';
import { ClientInput } from '../../shared/components/ui/ClientInput.jsx';
import { ClientModal } from '../../shared/components/ui/ClientModal.jsx';
import { createAppointment } from '../../services/adminApi.js';
import { showError, showSuccess } from '../../shared/utils/toast.js';

const emptyForm = {
  title: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  appointmentDate: '',
  appointmentTime: '',
  notes: '',
};

export const ClientReservationsPage = () => {
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const appointmentDateTime = `${form.appointmentDate || ''}T${form.appointmentTime || ''}`;
  const appointmentDate = appointmentDateTime ? new Date(appointmentDateTime) : null;
  const isDateValid = appointmentDate && !Number.isNaN(appointmentDate.getTime()) && appointmentDate > new Date();

  const canSubmit =
    form.title.trim() &&
    form.customerName.trim() &&
    form.customerEmail.trim() &&
    form.customerPhone.trim() &&
    form.appointmentDate &&
    form.appointmentTime &&
    isDateValid;

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

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      showError('Revisa los campos del formulario antes de enviar.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      customerPhone: form.customerPhone.trim(),
      appointmentDate: appointmentDateTime,
      notes: form.notes.trim(),
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

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8'>
      <div className='grid gap-8 lg:grid-cols-[1.1fr_0.9fr]'>
        <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
          <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>Citas</p>
          <h1 className='mt-1 text-3xl font-black text-gray-900'>Agenda tu cita</h1>
          <p className='mt-2 text-gray-700'>
            Programa una cita seleccionando fecha, hora y proporcionando tus datos de contacto.
          </p>

          <div className='mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <form onSubmit={onSubmit} className='mx-auto w-full max-w-3xl grid gap-6 sm:grid-cols-2'>
              <div className='sm:col-span-2'>
                <ClientInput
                  label='Título de la cita'
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder='Ej: Reunión con coordinador'
                />
                {formErrors.title && <p className='mt-2 text-sm text-rose-600'>{formErrors.title}</p>}
              </div>

          <div className='space-y-1'>
            <ClientInput
              label='Nombre completo'
              value={form.customerName}
              onChange={(event) => setForm({ ...form, customerName: event.target.value })}
            />
            {formErrors.customerName && <p className='mt-2 text-sm text-rose-600'>{formErrors.customerName}</p>}
          </div>

          <div className='space-y-1'>
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

          <label className='block space-y-1.5 sm:col-span-2'>
            <span className='text-sm font-medium text-gray-900'>Notas</span>
            <textarea
              rows='4'
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-main-blue focus:ring-2 focus:ring-main-blue/20'
              placeholder='Detalles adicionales sobre la cita'
            />
          </label>

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
          <h3 className='mt-2 text-2xl font-bold'>{form.title || 'Título de la cita'}</h3>
          <p className='mt-4 text-white/90'>{form.customerName || 'Tu nombre aquí'}</p>
          <p className='mt-1 text-white/90'>{form.customerEmail || 'correo@ejemplo.com'}</p>
          <p className='mt-1 text-white/90'>{form.customerPhone || 'Teléfono'}</p>
          <p className='mt-4 text-sm text-white/85'>
            {form.appointmentDate || 'Fecha'} - {form.appointmentTime || 'Hora'}
          </p>
        </article>
      </section>

      <ClientModal open={submitted} title='Cita creada' onClose={() => setSubmitted(false)}>
        <div className='space-y-4'>
          <p className='text-gray-700'>Tu cita quedó registrada correctamente.</p>
          <div className='flex justify-end'>
            <ClientButton onClick={() => setSubmitted(false)}>Entendido</ClientButton>
          </div>
        </div>
      </ClientModal>
    </div>
  </div>
  );
};
