import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    getInventory,
    addStock,
    updateStock
} from "../services/inventoryService";
import { getStockLogsByMedicine } from "../services/stockLogService";
import "../styles/Inventory.css";

function Inventory() {
    const { token } = useAuth();

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stockQuantity, setStockQuantity] = useState({});
    const [stockLogs, setStockLogs] = useState({});

    useEffect(() => {
        loadInventory();
    }, []);

    async function loadInventory() {
        try {
            const data = await getInventory(token);
            setInventory(data);

            for (const item of data) {
                if (item.medicine?.id) {
                    await loadStockLogs(item.medicine.id);
                }
            }
        } catch (error) {
            console.error("Failed to load inventory:", error);
            setError("Failed to load inventory. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function loadStockLogs(medicineId) {
        try {
            const data = await getStockLogsByMedicine(
                medicineId,
                token
            );

            setStockLogs((prev) => ({
                ...prev,
                [medicineId]: data,
            }));
        } catch (error) {
            console.error("Failed to load stock logs:", error);
        }
    }

    async function handleAddStock(medicineId) {
        const quantity = stockQuantity[medicineId];

        if (!quantity || Number(quantity) <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        try {
            await addStock(
                medicineId,
                Number(quantity),
                token
            );

            setStockQuantity((prev) => ({
                ...prev,
                [medicineId]: "",
            }));

            await loadInventory();

            alert("Stock added successfully.");
        } catch (error) {
            console.error("Failed to add stock:", error);
            alert("Could not add stock.");
        }
    }

    async function handleUpdateStock(medicineId) {
        const quantity = stockQuantity[medicineId];

        if (
            quantity === "" ||
            quantity === undefined ||
            Number(quantity) < 0
        ) {
            alert("Please enter a valid quantity.");
            return;
        }

        try {
            await updateStock(
                medicineId,
                Number(quantity),
                token
            );

            setStockQuantity((prev) => ({
                ...prev,
                [medicineId]: "",
            }));

            await loadInventory();

            alert("Stock updated successfully.");
        } catch (error) {
            console.error("Failed to update stock:", error);
            alert("Could not update stock.");
        }
    }

    function formatDate(dateString) {
        if (!dateString) {
            return "Date unavailable";
        }

        return new Date(dateString).toLocaleString();
    }

    function getStockStatus(quantity) {
        if (quantity === 0) {
            return {
                className: "out-of-stock",
                text: "Out of Stock",
            };
        }

        if (quantity <= 20) {
            return {
                className: "low-stock",
                text: "Low Stock",
            };
        }

        return {
            className: "in-stock",
            text: "In Stock",
        };
    }

    if (loading) {
        return (
            <div className="inventory-page">

                <div className="inventory-header">
                    <div>
                        <p className="inventory-label">
                            MEDISTOCK
                        </p>

                        <h1>
                            Inventory Management
                        </h1>

                        <p className="inventory-subtitle">
                            Monitor and manage medicine stock
                        </p>
                    </div>
                </div>

                <div className="inventory-status-card">
                    <div className="loading-spinner"></div>

                    <p>
                        Loading inventory...
                    </p>
                </div>

            </div>
        );
    }

    if (error) {
        return (
            <div className="inventory-page">

                <div className="inventory-header">
                    <div>
                        <p className="inventory-label">
                            MEDISTOCK
                        </p>

                        <h1>
                            Inventory Management
                        </h1>

                        <p className="inventory-subtitle">
                            Monitor and manage medicine stock
                        </p>
                    </div>
                </div>

                <div className="inventory-status-card error-card">

                    <div className="status-icon">
                        !
                    </div>

                    <h3>
                        Unable to load inventory
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        className="retry-button"
                        onClick={loadInventory}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    return (
        <div className="inventory-page">

            {/* HEADER */}

            <div className="inventory-header">

                <div>

                    <p className="inventory-label">
                        MEDISTOCK
                    </p>

                    <h1>
                        Inventory Management
                    </h1>

                    <p className="inventory-subtitle">
                        Monitor stock levels, update quantities,
                        and view stock history
                    </p>

                </div>

                <div className="inventory-summary">

                    <span className="summary-number">
                        {inventory.length}
                    </span>

                    <span className="summary-text">
                        Medicines
                    </span>

                </div>

            </div>


            {/* EMPTY INVENTORY */}

            {inventory.length === 0 ? (

                <div className="inventory-status-card">

                    <div className="status-icon">
                        📦
                    </div>

                    <h3>
                        No Inventory Available
                    </h3>

                    <p>
                        There are currently no medicines
                        in the inventory.
                    </p>

                </div>

            ) : (

                /* INVENTORY CARDS */

                <div className="inventory-grid">

                    {inventory.map((item) => {

                        const medicineId =
                            item.medicine?.id;

                        const medicineName =
                            item.medicine?.medicineName ||
                            "Unknown Medicine";

                        const quantity =
                            item.quantity ?? 0;

                        const stockStatus =
                            getStockStatus(quantity);

                        const logs =
                            stockLogs[medicineId] || [];

                        return (

                            <div
                                className="inventory-card"
                                key={item.id}
                            >

                                {/* MEDICINE HEADER */}

                                <div className="medicine-card-header">

                                    <div className="medicine-info">

                                        <div className="medicine-icon">
                                            💊
                                        </div>

                                        <div>

                                            <h2>
                                                {medicineName}
                                            </h2>

                                            <span className="medicine-id">
                                                Medicine ID: {medicineId}
                                            </span>

                                        </div>

                                    </div>

                                    <div
                                        className={`stock-badge ${stockStatus.className}`}
                                    >

                                        <span className="stock-dot"></span>

                                        {stockStatus.text}

                                    </div>

                                </div>


                                {/* CURRENT QUANTITY */}

                                <div className="quantity-section">

                                    <div>

                                        <p className="quantity-label">
                                            Current Stock
                                        </p>

                                        <p className="quantity-value">
                                            {quantity}
                                        </p>

                                        <p className="quantity-unit">
                                            units available
                                        </p>

                                    </div>

                                    <div className="quantity-box">

                                        <span>
                                            STOCK
                                        </span>

                                        <strong>
                                            {quantity}
                                        </strong>

                                    </div>

                                </div>


                                {/* STOCK HISTORY */}

                                <div className="history-section">

                                    <div className="section-title-row">

                                        <h3>
                                            Stock History
                                        </h3>

                                        <span className="history-count">
                                            {logs.length}{" "}
                                            {logs.length === 1
                                                ? "entry"
                                                : "entries"}
                                        </span>

                                    </div>

                                    {logs.length > 0 ? (

                                        <div className="history-list">

                                            {logs.map((log) => (

                                                <div
                                                    className="history-item"
                                                    key={log.id}
                                                >

                                                    <div
                                                        className={`history-action ${
    log.actionType ===
    "REDUCE"
        ? "reduce"
        : "add"
}`}
                                                    >
                                                        {log.actionType}
                                                    </div>

                                                    <div className="history-quantity">

                                                        {log.quantityChanged > 0
                                                            ? "+"
                                                            : ""}

                                                        {log.quantityChanged}

                                                    </div>

                                                    <div className="history-date">

                                                        {formatDate(
                                                            log.logTime
                                                        )}

                                                    </div>

                                                </div>

                                            ))}

                                        </div>

                                    ) : (

                                        <div className="no-history">
                                            No stock history available.
                                        </div>

                                    )}

                                </div>


                                {/* STOCK UPDATE */}

                                <div className="stock-update-section">

                                    <label>
                                        Update Stock Quantity
                                    </label>

                                    <div className="stock-controls">

                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Enter quantity"
                                            value={
                                                stockQuantity[
                                                    medicineId
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                setStockQuantity(
                                                    (prev) => ({
                                                        ...prev,
                                                        [medicineId]:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                        />

                                        <button
                                            className="add-stock-button"
                                            onClick={() =>
                                                handleAddStock(
                                                    medicineId
                                                )
                                            }
                                        >
                                            + Add Stock
                                        </button>

                                        <button
                                            className="update-stock-button"
                                            onClick={() =>
                                                handleUpdateStock(
                                                    medicineId
                                                )
                                            }
                                        >
                                            Update Stock
                                        </button>

                                    </div>

                                    <p className="stock-help-text">
                                        Add Stock increases the current
                                        quantity. Update Stock sets the
                                        exact quantity.
                                    </p>

                                </div>

                            </div>

                        );
                    })}

                </div>

            )}

        </div>
    );
}

export default Inventory;

