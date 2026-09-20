import axios from "axios";

const API_URL = "http://localhost:8080/api/inventory";

const authConfig = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export const getInventory = async (token) => {
    const response = await axios.get(
        API_URL,
        authConfig(token)
    );

    return response.data;
};

export const addStock = async (medicineId, quantity, token) => {
    const response = await axios.post(
        `${API_URL}?medicineId=${medicineId}&quantity=${quantity}`,
        {},
        authConfig(token)
    );

    return response.data;
};

export const updateStock = async (medicineId, quantity, token) => {
    const response = await axios.put(
        `${API_URL}/${medicineId}?quantity=${quantity}`,
{},
authConfig(token)
);

return response.data;
};

