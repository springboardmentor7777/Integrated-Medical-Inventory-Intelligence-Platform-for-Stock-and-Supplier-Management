import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import MedicineList from "./MedicineList";
import "../App.css";

const API_URL = "http://localhost:8082/api";

const MedicineDashboard = () => {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [medicines, setMedicines] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`
    });

    const fetchMedicines = async () => {

        const response = await fetch(
            `${API_URL}/medicines`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(`Medicine API failed: ${response.status}`);
        }

        return await response.json();
    };

    const fetchInventory = async () => {

        const response = await fetch(
            `${API_URL}/inventory`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(`Inventory API failed: ${response.status}`);
        }

        return await response.json();
    };

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [medicineData, inventoryData] = await Promise.all([
                fetchMedicines(),
                fetchInventory()
            ]);

            setMedicines(medicineData);
            setInventory(inventoryData);

        } catch (error) {

            console.error("Error loading data:", error);

            setError(
                "Unable to load medicines. Please check the backend and authorization token."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        if (user?.token) {
            loadData();
        } else {
            setLoading(false);
            setError("Authorization token is missing.");
        }

    }, [user?.token]);


    const getQuantity = (medicineId) => {

        const item = inventory.find(
            (inventoryItem) =>
                inventoryItem.medicineId === medicineId
        );

        return item ? item.quantity : 0;
    };


    const medicinesWithStock = medicines.map((medicine) => ({
        ...medicine,
        quantity: getQuantity(medicine.id)
    }));


    const totalMedicines = medicinesWithStock.length;

    const availableStock = medicinesWithStock.filter(
        (medicine) => medicine.quantity > 10
    ).length;

    const lowStock = medicinesWithStock.filter(
        (medicine) =>
            medicine.quantity > 0 &&
            medicine.quantity <= 10
    ).length;

    const outOfStock = medicinesWithStock.filter(
        (medicine) => medicine.quantity === 0
    ).length;


    const handleDelete = async (id) => {

        const medicine = medicines.find(
            (item) => item.id === id
        );

        if (!medicine) {
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${medicine.name}?`
        );

        if (!confirmDelete) {
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/medicines/${id}`,
                {
                    method: "DELETE",
                    headers: getHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Delete failed: ${response.status}`
                );
            }

            setMedicines((currentMedicines) =>
                currentMedicines.filter(
                    (item) => item.id !== id
                )
            );

            setInventory((currentInventory) =>
                currentInventory.filter(
                    (item) => item.medicineId !== id
                )
            );

        } catch (error) {

            console.error("Error deleting medicine:", error);

            alert("Failed to delete medicine.");
        }
    };


    return (
        <div className="medicine-page">

            <header className="dashboard-header">

                <div>
                    <h1>MediStock</h1>
                    <p>Medicine Inventory Management</p>
                </div>

                <div className="user-section">

                    <div className="user-info">
                        <span className="welcome-name">
                            Welcome, {user?.name} ({user?.role})
                        </span>
                    </div>

                    <button
                        onClick={logout}
                        className="logout-button"
                    >
                        Logout
                    </button>

                </div>

            </header>


            <main className="dashboard-content">

                <div className="page-title">

                    <div>
                        <h2>Medicine Dashboard</h2>

                        <p>
                            Monitor and manage your medicine inventory
                        </p>
                    </div>

                    <div className="page-actions">

                        <button
                            className="inventory-btn"
                            onClick={() => navigate("/inventory")}
                        >
                            📦 Inventory
                        </button>

                        <button
                            className="add-medicine-btn"
                            onClick={() => navigate("/add-medicine")}
                        >
                            ➕ Add Medicine
                        </button>

                    </div>

                </div>


                <div className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon">
                            💊
                        </div>

                        <div>
                            <p>Total Medicines</p>
                            <h3>{totalMedicines}</h3>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            📦
                        </div>

                        <div>
                            <p>Available Stock</p>
                            <h3>{availableStock}</h3>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            ⚠️
                        </div>

                        <div>
                            <p>Low Stock</p>
                            <h3>{lowStock}</h3>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            ❌
                        </div>

                        <div>
                            <p>Out of Stock</p>
                            <h3>{outOfStock}</h3>
                        </div>

                    </div>

                </div>


                {loading && (
                    <p>Loading medicines...</p>
                )}


                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}


                {!loading && !error && (
                    <MedicineList
                        medicines={medicinesWithStock}
                        onDelete={handleDelete}
                        onRefresh={loadData}
                    />
                )}

            </main>

        </div>
    );
};

export default MedicineDashboard;