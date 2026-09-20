import axios from "axios";

const API_URL = "http://localhost:8080/api/medicines";

const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getMedicines = async (token) => {
  const response = await axios.get(
      API_URL,
      authConfig(token)
  );

  return response.data;
};

export const createMedicine = async (medicine, token) => {
  const response = await axios.post(
      API_URL,
      medicine,
      authConfig(token)
  );

  return response.data;
};

export const updateMedicine = async (id, medicine, token) => {
  const response = await axios.put(
      `${API_URL}/${id}`,
      medicine,
      authConfig(token)
  );

  return response.data;
};

export const deleteMedicine = async (id, token) => {
  const response = await axios.delete(
      `${API_URL}/${id}`,
      authConfig(token)
  );

  return response.data;
};