import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const MedicineList = ({ medicines, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [stock, setStock] = useState("");

    // Role-based permissions
    const canEdit =
        user?.role === "ADMIN" || user?.role === "PHARMACIST";

    const canDelete = user?.role === "ADMIN";

    // Get stock status based on medicine reorder level
    const getStockStatus = (medicine) => {
        if (medicine.quantity === 0) {
            return "Out of Stock";
        }

        const reorderLevel =
            medicine.reorderLevel ??
            medicine.reorderLevelQuantity ??
            medicine.thresholdStock ??
            10;

        if (medicine.quantity <= reorderLevel) {
            return "Low Stock";
        }

        return "Available";
    };

    // Status badge styling
    const getStatusStyle = (status) => {
        switch (status) {
            case "Available":
                return "bg-emerald-50 text-emerald-700";

            case "Low Stock":
                return "bg-amber-50 text-amber-700";

            case "Out of Stock":
                return "bg-red-50 text-red-700";

            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    // Get unique categories dynamically from backend data
    const categories = [
        ...new Set(
            medicines
                .map((medicine) => medicine.category)
                .filter(Boolean)
        ),
    ];

    // Filter medicines
    const filteredMedicines = medicines.filter((medicine) => {
        const medicineName = medicine.name || "";
        const medicineCategory = medicine.category || "";

        const matchesSearch = medicineName
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
            category === "" ||
            medicineCategory.toLowerCase() === category.toLowerCase();

        const status = getStockStatus(medicine);

        const matchesStock =
            stock === "" ||
            status.toLowerCase() === stock.toLowerCase();

        return matchesSearch && matchesCategory && matchesStock;
    });

    // Navigate to edit page
    const handleEdit = (medicine) => {
        navigate("/edit-medicine", {
            state: { medicine },
        });
    };

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

            {/* Header */}
            <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-800">
                    Medicine Inventory
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    View and manage medicines in your inventory
                </p>
            </div>

            {/* Filters */}
            <div className="my-5 flex flex-col gap-3 md:flex-row">

                {/* Search */}
                <input
                    type="text"
                    placeholder="🔍 Search medicine..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:flex-1"
                />

                {/* Category */}
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                    <option value="">All Categories</option>

                    {categories.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                {/* Stock */}
                <select
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                    <option value="">All Stock</option>
                    <option value="available">Available</option>
                    <option value="low stock">Low Stock</option>
                    <option value="out of stock">Out of Stock</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full min-w-[1000px] border-collapse">

                    {/* Table Header */}
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Medicine Name
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Category
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Quantity
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Price
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Manufacturer
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Reorder Level
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Action
                            </th>
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-slate-100 bg-white">

                        {filteredMedicines.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="px-4 py-10 text-center text-sm text-slate-400"
                                >
                                    No medicines found
                                </td>
                            </tr>
                        ) : (
                            filteredMedicines.map((medicine) => {
                                const status = getStockStatus(medicine);

                                const reorderLevel =
                                    medicine.reorderLevel ??
                                    medicine.reorderLevelQuantity ??
                                    medicine.thresholdStock ??
                                    10;

                                return (
                                    <tr
                                        key={medicine.id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        {/* Medicine Name */}
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-semibold text-slate-800">
                                                {medicine.name}
                                            </p>
                                        </td>

                                        {/* Category */}
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {medicine.category || "-"}
                                        </td>

                                        {/* Quantity */}
                                        <td className="px-4 py-4 text-sm font-medium text-slate-700">
                                            {medicine.quantity ?? 0}
                                        </td>

                                        {/* Price */}
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            ₹{medicine.price ?? 0}
                                        </td>

                                        {/* Manufacturer */}
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {medicine.manufacturer || "-"}
                                        </td>

                                        {/* Reorder Level */}
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {reorderLevel}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                                    status
                                                )}`}
                                            >
                                                {status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">

                                                {/* Edit */}
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(medicine)
                                                        }
                                                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                                                    >
                                                        Edit
                                                    </button>
                                                )}

                                                {/* Delete */}
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onDelete(medicine.id)
                                                        }
                                                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                                                    >
                                                        Delete
                                                    </button>
                                                )}

                                                {/* Staff */}
                                                {!canEdit && !canDelete && (
                                                    <span className="text-xs font-medium text-slate-400">
                                                        View only
                                                    </span>
                                                )}

                                            </div>
                                        </td>

                                    </tr>
                                );
                            })
                        )}

                    </tbody>
                </table>
            </div>

            {/* Result Count */}
            <div className="mt-4 text-xs text-slate-400">
                Showing {filteredMedicines.length} of {medicines.length} medicines
            </div>

        </section>
    );
};

export default MedicineList;