import apiClient from "./apiClient";

const authApi = {
  login: (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },

  register: (userData) => {
    return apiClient.post("/auth/register", userData);
  },

  getProfile: () => {
    return apiClient.get("/users/profile");
  },

  updateProfile: (userData) => {
    return apiClient.put("/users/profile", userData);
  },

  forgotPassword: (email) => {
    return apiClient.post("/auth/forgot-password", { email });
  },
};

export default authApi;
