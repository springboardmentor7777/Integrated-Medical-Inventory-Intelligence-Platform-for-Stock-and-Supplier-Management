import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import MedicineList from "./MedicineList";
import "../App.css";

const MedicineDashboard = () => {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [medicines, setMedicines] = useState([
        {
            id: 1,
            name: "Paracetamol",
            category: "Tablet",
            quantity: 100,
            price: 25,
            expiryDate: "2027-12-15"
        },
        {
            id: 2,
            name: "Azithromycin",
            category: "Tablet",
            quantity: 50,
            price: 80,
            expiryDate: "2027-06-20"
        },
        {
            id: 3,
            name: "Cough Syrup",
            category: "Syrup",
            quantity: 8,
            price: 120,
            expiryDate: "2027-03-10"
        },
        {
            id: 4,
            name: "Insulin",
            category: "Injection",
            quantity: 0,
            price: 450,
            expiryDate: "2026-11-25"
        }
    ]);

    useEffect(() => {

        const updatedMedicine =
            location.state?.updatedMedicine;

        const newMedicine =
            location.state?.newMedicine;

        if (updatedMedicine) {

            setMedicines((currentMedicines) =>
                currentMedicines.map((medicine) =>
                    medicine.id === updatedMedicine.id
                        ? updatedMedicine
                        : medicine
                )
            );

            navigate("/medicines", {
                replace: true,
                state: {}
            });

            return;
        }

        if (newMedicine) {

            setMedicines((currentMedicines) => [
                ...currentMedicines,
                newMedicine
            ]);

            navigate("/medicines", {
                replace: true,
                state: {}
            });
        }

    }, [location.state, navigate]);


    const totalMedicines = medicines.length;

    const availableStock = medicines.filter(
        (medicine) => medicine.quantity > 10
    ).length;

    const lowStock = medicines.filter(
        (medicine) =>
            medicine.quantity > 0 &&
            medicine.quantity <= 10
    ).length;

    const outOfStock = medicines.filter(
        (medicine) => medicine.quantity === 0
    ).length;


    const handleDelete = (id) => {

        const medicine = medicines.find(
            (item) => item.id === id
        );

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${medicine.name}?`
        );

        if (!confirmDelete) {
            return;
        }

        setMedicines(
            medicines.filter(
                (item) => item.id !== id
            )
        );
    };


    return (
        <div className="medicine-page">

            <header className="dashboard-header">

                <div>
                    <h1>MediStock</h1>
                    <p>
                        Medicine Inventory Management
                    </p>
                </div>

                <div className="user-section">

                    <span>
                        Welcome, {user?.name}
                    </span>

                    <span className="role-badge">
                        {user?.role}
                    </span>

                    <button
                        onClick={logout}
                        className="logout-btn"
                    >
                        Logout
                    </button>

                </div>

            </header>


            <main className="dashboard-content">

                <div className="page-title">

                    <div>
                        <h2>
                            Medicine Dashboard
                        </h2>

                        <p>
                            Monitor and manage your medicine inventory
                        </p>
                    </div>

                    <div className="page-actions">

                        <button
                            className="inventory-btn"
                            onClick={() =>
                                navigate("/inventory")
                            }
                        >
                            📦 Inventory
                        </button>

                        <button
                            className="add-medicine-btn"
                            onClick={() =>
                                navigate("/add-medicine")
                            }
                        >
                            + Add Medicine
                        </button>

                    </div>

                </div>


                <div className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon">
                            💊
                        </div>

                        <div>
                            <p>
                                Total Medicines
                            </p>

                            <h3>
                                {totalMedicines}
                            </h3>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            📦
                        </div>

                        <div>
                            <p>
                                Available Stock
                            </p>

                            <h3>
                                {availableStock}
                            </h3>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            ⚠️
                        </div>

                        <div>
                            <p>
                                Low Stock
                            </p>

                            <h3>
                                {lowStock}
                            </h3>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            ❌
                        </div>

                        <div>
                            <p>
                                Out of Stock
                            </p>

                            <h3>
                                {outOfStock}
                            </h3>
                        </div>

                    </div>

                </div>


                <MedicineList
                    medicines={medicines}
                    onDelete={handleDelete}
                />

            </main>

        </div>
    );
};

export default MedicineDashboard;