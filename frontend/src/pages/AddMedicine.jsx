import authFetch from "../services/authFetch";
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
        reorderLevel: "",
        batchNumber: "",
        expiryDate: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setMedicine((current) => ({
            ...current,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!user?.token) {
            setError("You are not authenticated. Please login again.");
            return;
        }

        // Basic validation
        if (
            !medicine.name.trim() ||
            !medicine.category ||
            !medicine.manufacturer.trim() ||
            !medicine.description.trim() ||
            medicine.price === "" ||
            medicine.reorderLevel === ""
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        const price = Number(medicine.price);
        const reorderLevel = Number(medicine.reorderLevel);

        if (Number.isNaN(price) || price < 0) {
            setError("Please enter a valid price.");
            return;
        }

        if (Number.isNaN(reorderLevel) || reorderLevel < 0) {
            setError("Please enter a valid reorder level.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: medicine.name.trim(),
                category: medicine.category,
                manufacturer: medicine.manufacturer.trim(),
                description: medicine.description.trim(),
                price,
                reorderLevel,
            };

            // Only send optional fields when they have values.
            if (medicine.batchNumber.trim()) {
                payload.batchNumber = medicine.batchNumber.trim();
            }

            if (medicine.expiryDate) {
                payload.expiryDate = medicine.expiryDate;
            }

            const response = await authFetch(`${API_URL}/medicines`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(
                    responseText || `Request failed with status ${response.status}`
                );
            }

            alert("Medicine added successfully.");

            navigate("/medicines");
        } catch (error) {
            console.error("Error adding medicine:", error);

            setError(
                error.message ||
                    "Failed to add medicine. Please check the backend."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">

            {/* Header */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                            MediStock
                        </p>

                        <h1 className="mt-1 text-lg font-bold text-slate-900">
                            Medicine Inventory Management
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/medicines")}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Back to Medicines
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">

                {/* Page heading */}
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                        Inventory
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                        Add Medicine
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Add a new medicine to the inventory
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
                >

                    {/* Error */}
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="mb-7">
                        <h3 className="text-sm font-bold text-slate-900">
                            Basic Information
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Enter the basic details of the medicine.
                        </p>
                    </div>

                    {/* Medicine Name */}
                    <div className="mb-5">
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                            Medicine Name
                            <span className="text-red-500"> *</span>
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Enter medicine name"
                            value={medicine.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Category + Manufacturer */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div className="mb-5">
                            <label
                                htmlFor="category"
                                className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                                Category
                                <span className="text-red-500"> *</span>
                            </label>

                            <select
                                id="category"
                                name="category"
                                value={medicine.category}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                        <div className="mb-5">
                            <label
                                htmlFor="manufacturer"
                                className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                                Manufacturer
                                <span className="text-red-500"> *</span>
                            </label>

                            <input
                                id="manufacturer"
                                type="text"
                                name="manufacturer"
                                placeholder="Enter manufacturer"
                                value={medicine.manufacturer}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                            Description
                            <span className="text-red-500"> *</span>
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            placeholder="Enter medicine description"
                            value={medicine.description}
                            onChange={handleChange}
                            rows={4}
                            required
                            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Inventory Information */}
                    <div className="mb-7 border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-bold text-slate-900">
                            Inventory Information
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Set the price and stock threshold for this medicine.
                        </p>
                    </div>

                    {/* Price + Reorder Level */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div className="mb-5">
                            <label
                                htmlFor="price"
                                className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                                Price
                                <span className="text-red-500"> *</span>
                            </label>

                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                    ₹
                                </span>

                                <input
                                    id="price"
                                    type="number"
                                    name="price"
                                    placeholder="Enter price"
                                    min="0"
                                    step="0.01"
                                    value={medicine.price}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-8 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label
                                htmlFor="reorderLevel"
                                className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                                Reorder Level
                                <span className="text-red-500"> *</span>
                            </label>

                            <input
                                id="reorderLevel"
                                type="number"
                                name="reorderLevel"
                                placeholder="Enter reorder level"
                                min="0"
                                step="1"
                                value={medicine.reorderLevel}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1.5 text-xs text-slate-400">
                                An alert can be triggered when stock reaches this level.
                            </p>
                        </div>

                    </div>

                    {/* Batch Information */}
                    <div className="mb-7 border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-bold text-slate-900">
                            Batch Information
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Optional batch and expiry details.
                        </p>
                    </div>

                    {/* Batch Number + Expiry */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div className="mb-5">
                            <label
                                htmlFor="batchNumber"
                                className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                                Batch Number
                            </label>

                            <input
                                id="batchNumber"
                                type="text"
                                name="batchNumber"
                                placeholder="e.g. BT-24011"
                                value={medicine.batchNumber}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="mb-5">
                            <label
                                htmlFor="expiryDate"
                                className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                                Expiry Date
                            </label>

                            <input
                                id="expiryDate"
                                type="date"
                                name="expiryDate"
                                value={medicine.expiryDate}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-col justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">

                        <button
                            type="button"
                            onClick={() => navigate("/medicines")}
                            disabled={loading}
                            className="rounded-lg border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Adding..." : "Add Medicine"}
                        </button>

                    </div>

                </form>
            </main>
        </div>
    );
};

export default AddMedicine;