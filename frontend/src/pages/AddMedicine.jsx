import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8082/api";

const AddMedicine = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [medicine, setMedicine] = useState({
        name: "",
        category: "",
        manufacturer: "",
        description: "",
        price: "",
        reorderLevel: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setMedicine({
            ...medicine,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !medicine.name ||
            !medicine.category ||
            !medicine.manufacturer ||
            !medicine.description ||
            medicine.price === "" ||
            medicine.reorderLevel === ""
        ) {
            alert("Please fill all fields.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/medicines`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    name: medicine.name,
                    category: medicine.category,
                    manufacturer: medicine.manufacturer,
                    description: medicine.description,
                    price: Number(medicine.price),
                    reorderLevel: Number(medicine.reorderLevel)
                })
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(
                    responseText || `Request failed: ${response.status}`
                );
            }

            alert("Medicine added successfully.");

            navigate("/medicines");

        } catch (error) {
            console.error("Error adding medicine:", error);

            alert(
                error.message ||
                "Failed to add medicine. Please check the backend."
            );

        } finally {
            setLoading(false);
        }
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

                <button
                    className="back-button"
                    onClick={() => navigate("/medicines")}
                >
                    ← Back to Dashboard
                </button>

            </header>

            <main className="dashboard-content">

                <div className="page-title">

                    <div>
                        <h2>Add Medicine</h2>

                        <p>
                            Add a new medicine to the inventory
                        </p>
                    </div>

                </div>

                <form
                    className="medicine-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label>
                            Medicine Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter medicine name"
                            value={medicine.name}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Category
                        </label>

                        <select
                            name="category"
                            value={medicine.category}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select category
                            </option>

                            <option value="Tablet">
                                Tablet
                            </option>

                            <option value="Capsule">
                                Capsule
                            </option>

                            <option value="Syrup">
                                Syrup
                            </option>

                            <option value="Injection">
                                Injection
                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label>
                            Manufacturer
                        </label>

                        <input
                            type="text"
                            name="manufacturer"
                            placeholder="Enter manufacturer"
                            value={medicine.manufacturer}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            placeholder="Enter medicine description"
                            value={medicine.description}
                            onChange={handleChange}
                            rows="4"
                            required
                        />

                    </div>

                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Price
                            </label>

                            <input
                                type="number"
                                name="price"
                                placeholder="Enter price"
                                min="0"
                                step="0.01"
                                value={medicine.price}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Reorder Level
                            </label>

                            <input
                                type="number"
                                name="reorderLevel"
                                placeholder="Enter reorder level"
                                min="0"
                                value={medicine.reorderLevel}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate("/medicines")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="add-medicine-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Adding..."
                                : "Add Medicine"}
                        </button>

                    </div>

                </form>

            </main>

        </div>
    );
};

export default AddMedicine;