import api from './api';

const notificationService = {
  /**
   * Retrieve notifications (supports optional query params like status, userId, targetRole)
   */
  async getNotifications(params = {}) {
    const response = await api.get('/api/notifications', { params });
    return response.data;
  },

  /**
   * Retrieve unread count for UI badge counters
   */
  async getUnreadCount(params = {}) {
    const response = await api.get('/api/notifications/unread-count', { params });
    return response.data;
  },

  /**
   * Acknowledge / mark a notification as read
   */
  async acknowledge(id) {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id) {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data;
  }
};

export default notificationService;
