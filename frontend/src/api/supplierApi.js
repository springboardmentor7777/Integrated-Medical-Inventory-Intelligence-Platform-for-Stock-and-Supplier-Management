import apiClient from "./apiClient";

const supplierApi = {
  getAllSuppliers: () => {
    return apiClient.get("/suppliers");
  },

  getSupplierById: (id) => {
    return apiClient.get(`/suppliers/${id}`);
  },

  addSupplier: (supplierData) => {
    return apiClient.post("/suppliers", supplierData);
  },

  updateSupplier: (id, supplierData) => {
    return apiClient.put(`/suppliers/${id}`, supplierData);
  },

  deleteSupplier: (id) => {
    return apiClient.delete(`/suppliers/${id}`);
  },

  getSupplierPurchases: (id) => {
    return apiClient.get(`/suppliers/${id}/purchases`);
  },
};

export default supplierApi;
