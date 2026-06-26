import { axiosAdmin } from '../shared/apis/api.js';

const normalizeResponse = (data, key) => {
  if (Array.isArray(data)) return data;
  if (data?.[key]) return data[key];
  return [];
};

const formDataConfig = () => {
  return undefined;
};

// Appointments (Schedule-K)
export const getAppointments = async () => {
  const { data } = await axiosAdmin.get('/appointments');
  return normalizeResponse(data, 'appointments');
};

export const createAppointment = async (payload) => {
  const { data } = await axiosAdmin.post('/appointments', payload, formDataConfig(payload));
  return data;
};

export const updateAppointment = async (id, payload) => {
  const { data } = await axiosAdmin.put(`/appointments/${id}`, payload, formDataConfig(payload));
  return data;
};

export const deleteAppointment = async (id) => {
  const { data } = await axiosAdmin.delete(`/appointments/${id}`);
  return data;
};

export const getAppointmentHistory = async () => {
  const { data } = await axiosAdmin.get('/appointment-history');
  return normalizeResponse(data, 'history');
};

export const getNotifications = async () => {
  const { data } = await axiosAdmin.get('/notifications');
  return normalizeResponse(data, 'notifications');
};

export const createNotification = async (payload) => {
  const { data } = await axiosAdmin.post('/notifications', payload);
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await axiosAdmin.put(`/notifications/${id}/read`);
  return data;
};
