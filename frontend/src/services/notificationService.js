import alertService from "./alertService";
import api from "./api";

const notificationService = {
  async getNotifications(params = {}) {
    return alertService.getAll(params);
  },

  async getUnreadCount(params = {}) {
    try {
      const response = await api.get('/api/notifications/unread-count', { params });
      return response.data;
    } catch {
      return { unreadCount: 0 };
    }
  },

  async acknowledge(id) {
    return alertService.acknowledge(id);
  },

  async markAsRead(id) {
    return alertService.acknowledge(id);
  }
};

export default notificationService;
