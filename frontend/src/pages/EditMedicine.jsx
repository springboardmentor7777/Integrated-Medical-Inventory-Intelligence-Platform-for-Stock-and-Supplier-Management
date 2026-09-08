import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EditMedicine = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const selectedMedicine =
        location.state?.medicine;

    const [medicine, setMedicine] = useState(
        selectedMedicine || {
            id: "",
            name: "",
            category: "",
            quantity: "",
            price: "",
            expiryDate: ""
        }
    );

    const handleChange = (e) => {

        setMedicine({
            ...medicine,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {

        e.preventDefault();

        if (!selectedMedicine) {
            alert("Medicine data not found.");
            return;
        }

        // Send updated medicine back to dashboard
        navigate("/medicines", {
            state: {
                updatedMedicine: medicine
            }
        });
    };

    if (!selectedMedicine) {

        return (
            <div className="medicine-page">

                <header className="dashboard-header">

                    <div>
                        <h1>MediStock</h1>
                        <p>Medicine Inventory Management</p>
                    </div>

                </header>

                <main className="dashboard-content">

                    <div className="page-title">

                        <div>
                            <h2>Medicine Not Found</h2>

                            <p>
                                Please select a medicine from the dashboard.
                            </p>
                        </div>

                        <button
                            className="add-medicine-btn"
                            onClick={() =>
                                navigate("/medicines")
                            }
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </main>

            </div>
        );
    }

    return (
        <div className="medicine-page">

            <header className="dashboard-header">

                <div>
                    <h1>MediStock</h1>
                    <p>Medicine Inventory Management</p>
                </div>

                <button
                    className="logout-btn"
                    onClick={() =>
                        navigate("/medicines")
                    }
                >
                    Back to Dashboard
                </button>

            </header>

            <main className="dashboard-content">

                <div className="page-title">

                    <div>
                        <h2>Edit Medicine</h2>

                        <p>
                            Update medicine details
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

                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                name="quantity"
                                min="0"
                                value={medicine.quantity}
                                onChange={handleChange}
                                required
                            />

                        </div>

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

                    </div>

                    <div className="form-group">

                        <label>
                            Expiry Date
                        </label>

                        <input
                            type="date"
                            name="expiryDate"
                            value={medicine.expiryDate}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() =>
                                navigate("/medicines")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="add-medicine-btn"
                        >
                            Update Medicine
                        </button>

                    </div>

                </form>

            </main>

        </div>
    );
};

export default EditMedicine;