import api from './api';

const notificationService = {
  async getNotifications(limit = 50) {
    const response = await api.get(`/notifications?limit=${limit}`);
    // normalize to return the inner data array
    return response.data.data;
  },

  async getCount() {
    const response = await api.get('/notifications/count');
    // normalize to return inner { count }
    return response.data.data;
  },

  async createNotification(payload) {
    const response = await api.post('/notifications', payload);
    return response.data;
  },

  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  }
};

export default notificationService;
