import { useEffect, useMemo, useState } from 'react';
import { getAppointments } from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { showError } from '../shared/utils/toast.js';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
};

export const Reservations = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  if (loading) return <Spinner />;

  return (
    <div className='admin-page space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='admin-kicker'>Citas y Reservaciones</p>
          <h1 className='admin-title mt-2'>Citas</h1>
          <p className='admin-subtitle mt-2 text-sm'>Gestiona citas, horarios y estado de cada reservación.</p>
        </div>
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
    </div>
  );
};
