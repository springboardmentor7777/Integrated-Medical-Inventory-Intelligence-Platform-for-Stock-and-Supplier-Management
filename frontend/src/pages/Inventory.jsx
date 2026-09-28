import authFetch from "../services/authFetch";
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
        quantity: "",
    });

    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
    });

    // =========================
    // GET ALL INVENTORY
    // =========================

    const fetchInventory = async () => {
        try {
            const response = await authFetch(
                `${API_URL}/inventory`,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Inventory API failed: ${response.status}`
                );
            }

            const data = await response.json();

            setInventory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching inventory:", error);

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
            const response = await authFetch(
                `${API_URL}/medicines`,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Medicine API failed: ${response.status}`
                );
            }

            const data = await response.json();

            setMedicines(Array.isArray(data) ? data : []);
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
                fetchMedicines(),
            ]);
        } catch (error) {
            console.error("Error loading inventory:", error);
            setError("Unable to load inventory.");
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
            Number(currentQuantity) + change;

        if (newQuantity < 0) {
            return;
        }

        try {
            const response = await authFetch(
                `${API_URL}/inventory/${inventoryId}/stock`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        quantity: newQuantity,
                    }),
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
                error.message ||
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

        const quantity = Number(
            newInventory.quantity
        );

        if (Number.isNaN(quantity) || quantity < 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        try {
            const response = await authFetch(
                `${API_URL}/inventory`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        medicineId: Number(
                            newInventory.medicineId
                        ),
                        quantity,
                    }),
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
                addedInventory,
            ]);

            setNewInventory({
                medicineId: "",
                quantity: "",
            });

            setShowAddForm(false);
        } catch (error) {
            console.error(
                "Error adding inventory:",
                error
            );

            alert(
                error.message ||
                    "Failed to add inventory."
            );
        }
    };

    // =========================
    // FILTER INVENTORY
    // =========================

    const filteredInventory = inventory.filter(
        (item) => {
            const medicineName =
                item.medicineName || "";

            const matchesSearch =
                medicineName
                    .toLowerCase()
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
        }
    );

    // =========================
    // DASHBOARD COUNTS
    // =========================

    const totalItems = inventory.length;

    const availableStock =
        inventory.filter(
            (item) =>
                item.status === "IN_STOCK"
        ).length;

    const lowStock =
        inventory.filter(
            (item) =>
                item.status === "LOW_STOCK"
        ).length;

    const outOfStock =
        inventory.filter(
            (item) =>
                item.status === "OUT_OF_STOCK"
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

        return status || "Unknown";
    };

    const getStatusClass = (status) => {
        if (status === "IN_STOCK") {
            return "bg-emerald-50 text-emerald-700";
        }

        if (status === "LOW_STOCK") {
            return "bg-amber-50 text-amber-700";
        }

        if (status === "OUT_OF_STOCK") {
            return "bg-red-50 text-red-700";
        }

        return "bg-slate-100 text-slate-600";
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                    <p className="text-sm text-slate-500">
                        Loading inventory...
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // UI
    // =========================

    return (
        <div className="min-h-screen bg-slate-50 px-5 py-6 md:px-8">
            {/* Header */}

            <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                        MediStock
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-slate-900">
                        Inventory Management
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Monitor and manage current medicine stock.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/medicines")
                        }
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Medicines
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setShowAddForm(
                                !showAddForm
                            )
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        {showAddForm
                            ? "Close"
                            : "+ Add Inventory"}
                    </button>
                </div>
            </div>

            {/* Error */}

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            {/* Statistics */}

            <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Items
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {totalItems}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Inventory records
                    </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Available
                    </p>

                    <p className="mt-2 text-2xl font-bold text-emerald-600">
                        {availableStock}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Well stocked
                    </p>
                </div>

                <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Low Stock
                    </p>

                    <p className="mt-2 text-2xl font-bold text-amber-600">
                        {lowStock}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Need attention
                    </p>
                </div>

                <div className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Out of Stock
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-600">
                        {outOfStock}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Currently unavailable
                    </p>
                </div>
            </div>

            {/* Add Inventory */}

            {showAddForm && (
                <div className="mb-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900">
                            Add Inventory
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Add stock for an existing medicine.
                        </p>
                    </div>

                    <form
                        onSubmit={
                            handleAddInventory
                        }
                        className="grid grid-cols-1 gap-5 md:grid-cols-3"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Medicine
                            </label>

                            <select
                                value={
                                    newInventory.medicineId
                                }
                                onChange={(e) =>
                                    setNewInventory(
                                        (current) => ({
                                            ...current,
                                            medicineId:
                                                e.target
                                                    .value,
                                        })
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                            {
                                                medicine.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Quantity
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    newInventory.quantity
                                }
                                onChange={(e) =>
                                    setNewInventory(
                                        (current) => ({
                                            ...current,
                                            quantity:
                                                e.target
                                                    .value,
                                        })
                                    )
                                }
                                placeholder="Enter quantity"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Add Stock
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search / Filter */}

            <div className="mb-5 flex flex-col gap-3 md:flex-row">
                <input
                    type="text"
                    placeholder="🔍 Search medicine..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:flex-1"
                />

                <select
                    value={stockFilter}
                    onChange={(e) =>
                        setStockFilter(
                            e.target.value
                        )
                    }
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

            {/* Inventory Table */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Current Inventory
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {filteredInventory.length} inventory records
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] border-collapse">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Medicine
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Quantity
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Reorder Level
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Update Stock
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredInventory.length ===
                            0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-5 py-12 text-center"
                                    >
                                        <p className="text-sm font-medium text-slate-500">
                                            No inventory found
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Try changing your search or filter.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map(
                                    (item) => (
                                        <tr
                                            key={item.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {
                                                        item.medicineName
                                                    }
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold text-slate-800">
                                                    {
                                                        item.quantity
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {item.reorderLevel ??
                                                    item.reorderLevelQuantity ??
                                                    "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                        item.status
                                                    )}`}
                                                >
                                                    {getStatusText(
                                                        item.status
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            Number(
                                                                item.quantity
                                                            ) <=
                                                            0
                                                        }
                                                        onClick={() =>
                                                            updateStock(
                                                                item.id,
                                                                item.quantity,
                                                                -1
                                                            )
                                                        }
                                                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        −
                                                    </button>

                                                    <span className="min-w-8 text-center text-sm font-semibold text-slate-700">
                                                        {
                                                            item.quantity
                                                        }
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateStock(
                                                                item.id,
                                                                item.quantity,
                                                                1
                                                            )
                                                        }
                                                        className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-lg font-bold text-white transition hover:bg-blue-700"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400 md:px-6">
                    Showing {filteredInventory.length} of{" "}
                    {inventory.length} inventory records
                </div>
            </section>
        </div>
    );
};

export default Inventory;