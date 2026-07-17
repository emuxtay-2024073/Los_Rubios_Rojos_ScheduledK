import { axiosAdmin } from '../shared/apis/api.js';

const normalizeResponse = (data, key) => {
  if (Array.isArray(data)) return data;
  if (data?.[key]) return data[key];
  return [];
};

const formDataConfig = () => undefined;

// Appointments (Schedule-K)
export const getAppointments = async () => {
  const { data } = await axiosAdmin.get('/api/appointments');
  return normalizeResponse(data, 'appointments');
};

export const createAppointment = async (payload) => {
  const { data } = await axiosAdmin.post('/api/appointments', payload, formDataConfig(payload));
  return data;
};

export const updateAppointment = async (id, payload) => {
  const { data } = await axiosAdmin.put(`/api/appointments/${id}/reschedule`, payload, formDataConfig(payload));
  return data;
};

export const deleteAppointment = async (id) => {
  const { data } = await axiosAdmin.delete(`/api/appointments/${id}`);
  return data;
};

export const getParentAppointments = async () => {
  const { data } = await axiosAdmin.get('/api/appointments/my-history');
  return normalizeResponse(data, 'appointments');
};

export const getCalendarNotes = async (year, month) => {
  const { data } = await axiosAdmin.get('/api/calendar-notes', {
    params: { year, month },
  });
  return Array.isArray(data) ? data : [];
};

export const createCalendarNote = async (payload) => {
  const { data } = await axiosAdmin.post('/api/calendar-notes', payload);
  return data;
};

export const confirmAppointment = async (id) => {
  const { data } = await axiosAdmin.patch(`/api/appointments/${id}/confirm`);
  return data;
};

export const cancelAppointment = async (id, payload) => {
  const { data } = await axiosAdmin.patch(`/api/appointments/${id}/cancel`, payload);
  return data;
};

export const getAppointmentHistory = async () => {
  const { data } = await axiosAdmin.get('/api/appointments/history');
  return normalizeResponse(data, 'history');
};

export const getNotifications = async () => {
  const { data } = await axiosAdmin.get('/api/notifications');
  return normalizeResponse(data, 'notifications');
};

export const getMyNotifications = async () => {
  const { data } = await axiosAdmin.get('/api/notifications/my');
  return normalizeResponse(data, 'notifications');
};

export const createNotification = async (payload) => {
  const { data } = await axiosAdmin.post('/api/notifications/broadcast', payload);
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await axiosAdmin.put(`/api/notifications/${id}/read`);
  return data;
};
