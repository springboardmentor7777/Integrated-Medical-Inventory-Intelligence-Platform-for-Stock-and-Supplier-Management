import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/stock-logs`;
const authConfig = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export const getStockLogsByMedicine = async (medicineId, token) => {
    const response = await axios.get(
        `${API_URL}/medicine/${medicineId}`,
        authConfig(token)
    );

    return response.data;
};