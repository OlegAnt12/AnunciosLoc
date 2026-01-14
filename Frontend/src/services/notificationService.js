import api from './api';

export default {
  getNotifications: (limit = 50) => api.get('/notifications', { params: { limit } }),
  getCount: () => api.get('/notifications/count'),
  createNotification: (payload) => api.post('/notifications', payload),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  // New: mark all as read
  markAllAsRead: () => api.put('/notifications/read')
};