import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddMedicine = () => {

    const navigate = useNavigate();

    const [medicine, setMedicine] = useState({
        name: "",
        category: "",
        quantity: "",
        price: "",
        expiryDate: ""
    });


    const handleChange = (e) => {

        setMedicine({
            ...medicine,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = (e) => {

        e.preventDefault();

        const newMedicine = {
            id: Date.now(),
            name: medicine.name,
            category: medicine.category,
            quantity: Number(medicine.quantity),
            price: Number(medicine.price),
            expiryDate: medicine.expiryDate
        };

        navigate("/medicines", {
            state: {
                newMedicine: newMedicine
            }
        });
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

                        <h2>
                            Add Medicine
                        </h2>

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


                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                name="quantity"
                                placeholder="Enter quantity"
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
                                placeholder="Enter price"
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
                            Add Medicine
                        </button>

                    </div>

                </form>

            </main>

        </div>
    );
};

export default AddMedicine;