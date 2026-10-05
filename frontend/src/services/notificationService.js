import alertService from "./alertService";

const notificationService = {
  async getNotifications(params = {}) {
    return alertService.getAll(params);
  },

  async acknowledge(id) {
    return alertService.acknowledge(id);
  },
};

export default notificationService;
