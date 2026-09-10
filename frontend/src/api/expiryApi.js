import apiClient from "./apiClient";

const expiryApi = {
  getExpiringMedicines: () => {
    return apiClient.get("/expiry/expiring");
  },

  getExpiredMedicines: () => {
    return apiClient.get("/expiry/expired");
  },

  getExpiryReport: () => {
    return apiClient.get("/expiry/report");
  },
};

export default expiryApi;
