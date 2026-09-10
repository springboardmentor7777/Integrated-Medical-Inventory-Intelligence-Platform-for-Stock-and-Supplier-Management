import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MedicineList = ({ medicines, onDelete }) => {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [stock, setStock] = useState("");

    const getStockStatus = (medicine) => {

        if (medicine.quantity === 0) {
            return "Out of Stock";
        }

        if (
            medicine.reorderLevel !== undefined &&
            medicine.quantity <= medicine.reorderLevel
        ) {
            return "Low Stock";
        }

        return "Available";
    };


    const filteredMedicines = medicines.filter((medicine) => {

        const matchesSearch =
            medicine.name
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesCategory =
            category === "" ||
            medicine.category.toLowerCase() ===
            category.toLowerCase();

        const status = getStockStatus(medicine);

        const matchesStock =
            stock === "" ||
            status.toLowerCase() === stock.toLowerCase();

        return (
            matchesSearch &&
            matchesCategory &&
            matchesStock
        );
    });


    const handleEdit = (medicine) => {

        navigate("/edit-medicine", {
            state: {
                medicine
            }
        });
    };


    return (
        <section className="medicine-section">

            <div className="section-header">

                <div>
                    <h2>Medicine Inventory</h2>

                    <p>
                        View and manage available medicines
                    </p>
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
                    value={category}
                    onChange={(e) =>
                        setCategory(e.target.value)
                    }
                >
                    <option value="">
                        All Categories
                    </option>

                    <option value="tablet">
                        Tablet
                    </option>

                    <option value="capsule">
                        Capsule
                    </option>

                    <option value="syrup">
                        Syrup
                    </option>

                    <option value="injection">
                        Injection
                    </option>
                </select>


                <select
                    className="filter-select"
                    value={stock}
                    onChange={(e) =>
                        setStock(e.target.value)
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
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Manufacturer</th>
                        <th>Reorder Level</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>

                    </thead>


                    <tbody>

                    {filteredMedicines.length === 0 ? (

                        <tr>
                            <td
                                colSpan="8"
                                className="empty-state"
                            >
                                No medicines found
                            </td>
                        </tr>

                    ) : (

                        filteredMedicines.map((medicine) => {

                            const status =
                                getStockStatus(medicine);

                            return (

                                <tr key={medicine.id}>

                                    <td>
                                        <strong>
                                            {medicine.name}
                                        </strong>
                                    </td>

                                    <td>
                                        {medicine.category}
                                    </td>

                                    <td>
                                        {medicine.quantity}
                                    </td>

                                    <td>
                                        ₹{medicine.price}
                                    </td>

                                    <td>
                                        {medicine.manufacturer}
                                    </td>

                                    <td>
                                        {medicine.reorderLevel}
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
                                                handleEdit(medicine)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                onDelete(
                                                    medicine.id
                                                )
                                            }
                                        >
                                            Delete
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
    );
};

export default MedicineList;