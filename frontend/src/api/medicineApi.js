import apiClient from "./apiClient";

const medicineApi = {
  getAllMedicines: () => {
    return apiClient.get("/medicines");
  },

  getMedicineById: (id) => {
    return apiClient.get(`/medicines/${id}`);
  },

  addMedicine: (medicineData) => {
    return apiClient.post("/medicines", medicineData);
  },

  updateMedicine: (id, medicineData) => {
    return apiClient.put(`/medicines/${id}`, medicineData);
  },

  deleteMedicine: (id) => {
    return apiClient.delete(`/medicines/${id}`);
  },

  searchMedicines: (params) => {
    return apiClient.get("/medicines/search", { params });
  },
};

export default medicineApi;
