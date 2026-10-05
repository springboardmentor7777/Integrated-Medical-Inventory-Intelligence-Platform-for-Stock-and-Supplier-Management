import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/suppliers`;
export const getSuppliers = async (token) => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const addSupplier = async (supplier, token) => {
  const response = await axios.post(API_URL, supplier, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateSupplier = async (id, supplier, token) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    supplier,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteSupplier = async (id, token) => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};