import apiClient from "./apiClient";

const inventoryApi = {
  getInventory: () => {
    return apiClient.get("/inventory");
  },

  updateStock: (medicineId, stockData) => {
    return apiClient.put(
      `/inventory/${medicineId}/stock`,
      stockData
    );
  },

  getLowStockItems: () => {
    return apiClient.get("/inventory/low-stock");
  },

  getOutOfStockItems: () => {
    return apiClient.get("/inventory/out-of-stock");
  },

  getStockHistory: () => {
    return apiClient.get("/inventory/history");
  },
};

export default inventoryApi;
