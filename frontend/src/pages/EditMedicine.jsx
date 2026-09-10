import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8082/api";

const EditMedicine = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const existingMedicine = location.state?.medicine;

    const [medicine, setMedicine] = useState(
        existingMedicine
            ? {
                name: existingMedicine.name || "",
                category: existingMedicine.category || "",
                manufacturer: existingMedicine.manufacturer || "",
                description: existingMedicine.description || "",
                price: existingMedicine.price ?? "",
                reorderLevel: existingMedicine.reorderLevel ?? ""
            }
            : null
    );

    const [loading, setLoading] = useState(false);

    if (!medicine) {

        return (
            <div className="medicine-page">

                <header className="dashboard-header">

                    <div>
                        <h1>MediStock</h1>

                        <p>
                            Medicine Inventory Management
                        </p>
                    </div>

                </header>

                <main className="dashboard-content">

                    <div className="page-title">

                        <div>

                            <h2>
                                Medicine Not Found
                            </h2>

                            <p>
                                Please select a medicine from the dashboard.
                            </p>

                        </div>

                    </div>

                    <button
                        className="add-medicine-btn"
                        onClick={() => navigate("/medicines")}
                    >
                        Back to Dashboard
                    </button>

                </main>

            </div>
        );
    }

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

            const response = await fetch(
                `${API_URL}/medicines/${existingMedicine.id}`,
                {
                    method: "PUT",

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
                }
            );

            const responseText = await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText ||
                    `Update failed: ${response.status}`
                );
            }

            alert("Medicine updated successfully.");

            navigate("/medicines");

        } catch (error) {

            console.error(
                "Error updating medicine:",
                error
            );

            alert(
                error.message ||
                "Failed to update medicine."
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
                    className="logout-btn"
                    onClick={() => navigate("/medicines")}
                >
                    Back to Dashboard
                </button>

            </header>

            <main className="dashboard-content">

                <div className="page-title">

                    <div>

                        <h2>
                            Edit Medicine
                        </h2>

                        <p>
                            Update medicine information
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
                                ? "Updating..."
                                : "Update Medicine"}
                        </button>

                    </div>

                </form>

            </main>

        </div>
    );
};

export default EditMedicine;