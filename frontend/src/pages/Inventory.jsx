import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8082/api";

const Inventory = () => {

    const { user } = useAuth();
    const navigate = useNavigate();

    const [inventory, setInventory] = useState([]);
    const [medicines, setMedicines] = useState([]);

    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);

    const [newInventory, setNewInventory] = useState({
        medicineId: "",
        quantity: ""
    });

    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`
    });


    // =========================
    // GET ALL INVENTORY
    // =========================

    const fetchInventory = async () => {

        try {

            const response = await fetch(
                `${API_URL}/inventory`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Inventory API failed: ${response.status}`
                );
            }

            const data = await response.json();

            setInventory(data);

        } catch (error) {

            console.error(
                "Error fetching inventory:",
                error
            );

            setError(
                "Unable to load inventory from the server."
            );
        }
    };


    // =========================
    // GET MEDICINES
    // Used for Add Inventory
    // =========================

    const fetchMedicines = async () => {

        try {

            const response = await fetch(
                `${API_URL}/medicines`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Medicine API failed: ${response.status}`
                );
            }

            const data = await response.json();

            setMedicines(data);

        } catch (error) {

            console.error(
                "Error fetching medicines:",
                error
            );
        }
    };


    // =========================
    // LOAD DATA
    // =========================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            await Promise.all([
                fetchInventory(),
                fetchMedicines()
            ]);

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


    // =========================
    // UPDATE STOCK
    // =========================

    const updateStock = async (
        inventoryId,
        currentQuantity,
        change
    ) => {

        const newQuantity =
            currentQuantity + change;

        if (newQuantity < 0) {
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/inventory/${inventoryId}/stock`,
                {
                    method: "PUT",

                    headers: getHeaders(),

                    body: JSON.stringify({
                        quantity: newQuantity
                    })
                }
            );


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    `Stock update failed: ${response.status}`
                );
            }


            const updatedInventory =
                await response.json();


            setInventory((currentInventory) =>
                currentInventory.map((item) =>
                    item.id === inventoryId
                        ? updatedInventory
                        : item
                )
            );


        } catch (error) {

            console.error(
                "Error updating stock:",
                error
            );

            alert(
                "Failed to update stock."
            );
        }
    };


    // =========================
    // ADD INVENTORY
    // =========================

    const handleAddInventory = async (e) => {

        e.preventDefault();

        if (
            !newInventory.medicineId ||
            newInventory.quantity === ""
        ) {
            alert(
                "Please select a medicine and enter quantity."
            );
            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/inventory`,
                {
                    method: "POST",

                    headers: getHeaders(),

                    body: JSON.stringify({
                        medicineId: Number(
                            newInventory.medicineId
                        ),

                        quantity: Number(
                            newInventory.quantity
                        )
                    })
                }
            );


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    `Add inventory failed: ${response.status}`
                );
            }


            const addedInventory =
                await response.json();


            setInventory((currentInventory) => [
                ...currentInventory,
                addedInventory
            ]);


            setNewInventory({
                medicineId: "",
                quantity: ""
            });

            setShowAddForm(false);


        } catch (error) {

            console.error(
                "Error adding inventory:",
                error
            );

            alert(
                "Failed to add inventory."
            );
        }
    };


    // =========================
    // FILTER INVENTORY
    // =========================

    const filteredInventory =
        inventory.filter((item) => {

            const matchesSearch =
                item.medicineName
                    ?.toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );


            const matchesStock =
                stockFilter === "" ||
                item.status === stockFilter;


            return (
                matchesSearch &&
                matchesStock
            );
        });


    // =========================
    // DASHBOARD COUNTS
    // =========================

    const totalItems =
        inventory.length;

    const availableStock =
        inventory.filter(
            (item) => item.status === "IN_STOCK"
        ).length;

    const lowStock =
        inventory.filter(
            (item) => item.status === "LOW_STOCK"
        ).length;

    const outOfStock =
        inventory.filter(
            (item) => item.status === "OUT_OF_STOCK"
        ).length;


    // =========================
    // STATUS DISPLAY
    // =========================

    const getStatusText = (status) => {

        if (status === "IN_STOCK") {
            return "Available";
        }

        if (status === "LOW_STOCK") {
            return "Low Stock";
        }

        if (status === "OUT_OF_STOCK") {
            return "Out of Stock";
        }

        return status;
    };


    const getStatusClass = (status) => {

        if (status === "IN_STOCK") {
            return "available";
        }

        if (status === "LOW_STOCK") {
            return "low-stock";
        }

        if (status === "OUT_OF_STOCK") {
            return "out-of-stock";
        }

        return "";
    };


    return (
        <div className="medicine-page">

            {/* ================= HEADER ================= */}

            <header className="dashboard-header">

                <div>

                    <h1>MediStock</h1>

                    <p>
                        Medicine Inventory Management
                    </p>

                </div>


                <div className="user-section">

                    <div className="user-info">

                        <span className="welcome-name">
                            Welcome, {user?.name} ({user?.role})
                        </span>

                    </div>

                    <button
                        onClick={() =>
                            navigate("/medicines")
                        }
                        className="back-button"
                    >
                        ← Back to Medicines
                    </button>

                </div>

            </header>


            {/* ================= MAIN ================= */}

            <main className="dashboard-content">

                <div className="page-title">

                    <div>

                        <h2>
                            Inventory Management
                        </h2>

                        <p>
                            Monitor and manage medicine stock
                        </p>

                    </div>


                    <div className="page-actions">

                        <button
                            className="add-medicine-btn"
                            onClick={() =>
                                setShowAddForm(
                                    !showAddForm
                                )
                            }
                        >
                            + Add Inventory
                        </button>

                    </div>

                </div>


                {/* ================= STATS ================= */}

                <div className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon">
                            📦
                        </div>

                        <div>

                            <p>
                                Total Items
                            </p>

                            <h3>
                                {totalItems}
                            </h3>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            ✅
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


                {/* ================= ADD INVENTORY FORM ================= */}

                {showAddForm && (

                    <form
                        className="medicine-form"
                        onSubmit={handleAddInventory}
                    >

                        <h3>
                            Add Inventory
                        </h3>


                        <div className="form-group">

                            <label>
                                Medicine
                            </label>

                            <select
                                value={
                                    newInventory.medicineId
                                }
                                onChange={(e) =>
                                    setNewInventory({
                                        ...newInventory,
                                        medicineId:
                                            e.target.value
                                    })
                                }
                                required
                            >

                                <option value="">
                                    Select medicine
                                </option>

                                {medicines.map(
                                    (medicine) => (

                                        <option
                                            key={
                                                medicine.id
                                            }
                                            value={
                                                medicine.id
                                            }
                                        >
                                            {medicine.name}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div className="form-group">

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    newInventory.quantity
                                }
                                onChange={(e) =>
                                    setNewInventory({
                                        ...newInventory,
                                        quantity:
                                            e.target.value
                                    })
                                }
                                required
                            />

                        </div>


                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() =>
                                    setShowAddForm(false)
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="add-medicine-btn"
                            >
                                Add Inventory
                            </button>

                        </div>

                    </form>

                )}


                {/* ================= SEARCH & FILTER ================= */}

                <section className="medicine-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Inventory Stock
                            </h2>

                        </div>

                    </div>


                    <div className="medicine-toolbar">

                        <input
                            type="text"
                            placeholder="🔍 Search medicine..."
                            className="search-input"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />


                        <select
                            className="filter-select"
                            value={stockFilter}
                            onChange={(e) =>
                                setStockFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                All Stock
                            </option>

                            <option value="IN_STOCK">
                                Available
                            </option>

                            <option value="LOW_STOCK">
                                Low Stock
                            </option>

                            <option value="OUT_OF_STOCK">
                                Out of Stock
                            </option>

                        </select>

                    </div>


                    {/* ================= TABLE ================= */}

                    <div className="medicine-table-container">

                        {loading ? (

                            <p>
                                Loading inventory...
                            </p>

                        ) : error ? (

                            <p className="error-message">
                                {error}
                            </p>

                        ) : (

                            <table className="medicine-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Medicine
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Reorder Level
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Stock Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredInventory.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="empty-state"
                                            >
                                                No inventory found
                                            </td>

                                        </tr>

                                    ) : (

                                        filteredInventory.map(
                                            (item) => (

                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                >

                                                    <td>

                                                        <strong>
                                                            {
                                                                item.medicineName
                                                            }
                                                        </strong>

                                                    </td>


                                                    <td>
                                                        {
                                                            item.quantity
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            item.reorderLevel
                                                        }
                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`stock-status ${getStatusClass(
                                                                item.status
                                                            )}`}
                                                        >
                                                            {getStatusText(
                                                                item.status
                                                            )}
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <button
                                                            className="edit-btn"
                                                            onClick={() =>
                                                                updateStock(
                                                                    item.id,
                                                                    item.quantity,
                                                                    -1
                                                                )
                                                            }
                                                            disabled={
                                                                item.quantity ===
                                                                0
                                                            }
                                                        >
                                                            −
                                                        </button>


                                                        <span
                                                            style={{
                                                                margin: "0 12px",
                                                                fontWeight:
                                                                    "600"
                                                            }}
                                                        >
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>


                                                        <button
                                                            className="edit-btn"
                                                            onClick={() =>
                                                                updateStock(
                                                                    item.id,
                                                                    item.quantity,
                                                                    1
                                                                )
                                                            }
                                                        >
                                                            +
                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )

                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
};

export default Inventory;