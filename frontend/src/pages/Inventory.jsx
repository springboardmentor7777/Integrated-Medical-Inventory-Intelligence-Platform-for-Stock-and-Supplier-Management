import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Inventory = () => {

    const navigate = useNavigate();

    const [inventory, setInventory] = useState([
        {
            id: 1,
            medicine: "Paracetamol",
            category: "Tablet",
            quantity: 100,
            minStock: 20
        },
        {
            id: 2,
            medicine: "Azithromycin",
            category: "Tablet",
            quantity: 50,
            minStock: 20
        },
        {
            id: 3,
            medicine: "Cough Syrup",
            category: "Syrup",
            quantity: 8,
            minStock: 10
        },
        {
            id: 4,
            medicine: "Insulin",
            category: "Injection",
            quantity: 0,
            minStock: 10
        }
    ]);

    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState("");


    const getStockStatus = (quantity, minStock) => {

        if (quantity === 0) {
            return "Out of Stock";
        }

        if (quantity <= minStock) {
            return "Low Stock";
        }

        return "Available";
    };


    const filteredInventory = inventory.filter((item) => {

        const matchesSearch =
            item.medicine
                .toLowerCase()
                .includes(search.toLowerCase());

        const status = getStockStatus(
            item.quantity,
            item.minStock
        );

        const matchesStock =
            stockFilter === "" ||
            status.toLowerCase() === stockFilter.toLowerCase();

        return matchesSearch && matchesStock;
    });


    const updateStock = (id, amount) => {

        setInventory(
            inventory.map((item) => {

                if (item.id === id) {

                    return {
                        ...item,
                        quantity: Math.max(
                            0,
                            item.quantity + amount
                        )
                    };
                }

                return item;
            })
        );
    };


    return (
        <div className="medicine-page">

            {/* Header */}

            <header className="dashboard-header">

                <div>
                    <h1>MediStock</h1>
                    <p>Medicine Inventory Management</p>
                </div>

                <button
                    className="logout-btn"
                    onClick={() => navigate("/medicines")}
                >
                    Back to Medicines
                </button>

            </header>


            <main className="dashboard-content">

                {/* Page Title */}

                <div className="page-title">

                    <div>
                        <h2>Inventory Management</h2>

                        <p>
                            Track and manage medicine stock
                        </p>
                    </div>

                </div>


                {/* Inventory Stats */}

                <div className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon">
                            📦
                        </div>

                        <div>
                            <p>Total Items</p>
                            <h3>{inventory.length}</h3>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            ✅
                        </div>

                        <div>
                            <p>Available</p>

                            <h3>
                                {
                                    inventory.filter(
                                        (item) =>
                                            getStockStatus(
                                                item.quantity,
                                                item.minStock
                                            ) === "Available"
                                    ).length
                                }
                            </h3>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            ⚠️
                        </div>

                        <div>
                            <p>Low Stock</p>

                            <h3>
                                {
                                    inventory.filter(
                                        (item) =>
                                            getStockStatus(
                                                item.quantity,
                                                item.minStock
                                            ) === "Low Stock"
                                    ).length
                                }
                            </h3>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            ❌
                        </div>

                        <div>
                            <p>Out of Stock</p>

                            <h3>
                                {
                                    inventory.filter(
                                        (item) =>
                                            getStockStatus(
                                                item.quantity,
                                                item.minStock
                                            ) === "Out of Stock"
                                    ).length
                                }
                            </h3>

                        </div>

                    </div>

                </div>


                {/* Inventory Table */}

                <section className="medicine-section">

                    <div className="section-header">

                        <div>
                            <h2>Stock Inventory</h2>

                            <p>
                                Monitor medicine quantities and stock levels
                            </p>
                        </div>

                    </div>


                    {/* Search & Filter */}

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
                                setStockFilter(e.target.value)
                            }
                        >

                            <option value="">
                                All Stock
                            </option>

                            <option value="available">
                                Available
                            </option>

                            <option value="low stock">
                                Low Stock
                            </option>

                            <option value="out of stock">
                                Out of Stock
                            </option>

                        </select>

                    </div>


                    <div className="medicine-table-container">

                        <table className="medicine-table">

                            <thead>

                            <tr>
                                <th>Medicine Name</th>
                                <th>Category</th>
                                <th>Current Stock</th>
                                <th>Minimum Stock</th>
                                <th>Status</th>
                                <th>Update Stock</th>
                            </tr>

                            </thead>


                            <tbody>

                            {filteredInventory.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="6"
                                        className="empty-state"
                                    >
                                        No inventory items found
                                    </td>
                                </tr>

                            ) : (

                                filteredInventory.map((item) => {

                                    const status =
                                        getStockStatus(
                                            item.quantity,
                                            item.minStock
                                        );

                                    return (

                                        <tr key={item.id}>

                                            <td>
                                                <strong>
                                                    {item.medicine}
                                                </strong>
                                            </td>

                                            <td>
                                                {item.category}
                                            </td>

                                            <td>
                                                {item.quantity}
                                            </td>

                                            <td>
                                                {item.minStock}
                                            </td>

                                            <td>

                                                    <span
                                                        className={`stock-status ${status
                                                            .toLowerCase()
                                                            .replaceAll(
                                                                " ",
                                                                "-"
                                                            )}`}
                                                    >
                                                        {status}
                                                    </span>

                                            </td>

                                            <td>

                                                <button
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        updateStock(
                                                            item.id,
                                                            -1
                                                        )
                                                    }
                                                >
                                                    −
                                                </button>

                                                <button
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        updateStock(
                                                            item.id,
                                                            1
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>

                                            </td>

                                        </tr>

                                    );
                                })

                            )}

                            </tbody>

                        </table>

                    </div>

                </section>

            </main>

        </div>
    );
};

export default Inventory;