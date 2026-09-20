import axios from "axios";

const API_URL = "http://localhost:8080/api/stock-logs";

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