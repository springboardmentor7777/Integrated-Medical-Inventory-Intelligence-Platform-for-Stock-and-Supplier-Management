import authFetch from "../services/authFetch";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import ExpirySummaryCards from "../components/expiry/ExpirySummaryCards";
import InventoryAnalyticsCards from "../components/expiry/InventoryAnalyticsCards";
import ExpiryFilters from "../components/expiry/ExpiryFilters";
import ExpiryTable from "../components/expiry/ExpiryTable";
import ExpiryCharts from "../components/expiry/ExpiryCharts";

import { EXPIRY_STATUS, getExpiryStatus } from "../utils/expiryUtils";

const API_URL = "http://localhost:8082/api";

// Milestone 3 Frontend 1 — Expiry + Inventory Analytics UI.
// Uses only data returned by the backend.
// No expiry dates or batch numbers are generated on the frontend.
const ExpiryAnalytics = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [rawMedicines, setRawMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    useEffect(() => {
        const getHeaders = () => ({
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
        });

        const loadMedicines = async () => {
            setLoading(true);
            setError("");

            try {
                // Fetch medicines and inventory in parallel so that
                // real stock quantities are shown.
                const [medicinesResponse, inventoryResponse] =
                    await Promise.all([
                        authFetch(`${API_URL}/medicines`, {
                            method: "GET",
                            headers: getHeaders(),
                        }),

                        authFetch(`${API_URL}/inventory`, {
                            method: "GET",
                            headers: getHeaders(),
                        }),
                    ]);

                if (!medicinesResponse.ok) {
                    throw new Error(
                        `Medicine API failed: ${medicinesResponse.status}`
                    );
                }

                const medicinesData = await medicinesResponse.json();

                if (!Array.isArray(medicinesData)) {
                    throw new Error("Invalid medicine data returned by backend.");
                }

                // Inventory is optional.
                // If it fails, medicine data can still be displayed,
                // with stock quantity falling back to 0.
                let inventoryData = [];

                if (inventoryResponse.ok) {
                    const parsedInventory = await inventoryResponse.json();

                    if (Array.isArray(parsedInventory)) {
                        inventoryData = parsedInventory;
                    }
                }

                const getQuantity = (medicineId) => {
                    const item = inventoryData.find(
                        (inventoryItem) =>
                            inventoryItem.medicineId === medicineId
                    );

                    return item ? Number(item.quantity) || 0 : 0;
                };

                const medicinesWithStock = medicinesData.map((medicine) => ({
                    ...medicine,
                    quantity: getQuantity(medicine.id),
                }));

                setRawMedicines(medicinesWithStock);
            } catch (error) {
                console.error("Unable to load expiry data:", error);

                setRawMedicines([]);

                setError(
                    error.message ||
                        "Unable to load expiry data. Please check the backend and try again."
                );
            } finally {
                setLoading(false);
            }
        };

        if (user?.token) {
            loadMedicines();
        } else {
            setRawMedicines([]);
            setError("Authorization token is missing.");
            setLoading(false);
        }
    }, [user?.token]);

    // Attach computed expiry status to every medicine.
    const medicinesWithStatus = useMemo(
        () =>
            rawMedicines.map((medicine) => ({
                ...medicine,
                status: getExpiryStatus(medicine.expiryDate),
            })),
        [rawMedicines]
    );

    // Get all available medicine categories.
    const categories = useMemo(
        () =>
            Array.from(
                new Set(
                    medicinesWithStatus
                        .map((medicine) => medicine.category)
                        .filter(Boolean)
                )
            ).sort(),
        [medicinesWithStatus]
    );

    // Apply search, expiry-status and category filters.
    const filteredMedicines = useMemo(() => {
        return medicinesWithStatus.filter((medicine) => {
            const medicineName = medicine.name || "";
            const medicineCategory = medicine.category || "";

            const matchesSearch = medicineName
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "" || medicine.status === statusFilter;

            const matchesCategory =
                categoryFilter === "" ||
                medicineCategory === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [
        medicinesWithStatus,
        search,
        statusFilter,
        categoryFilter,
    ]);

    const handleResetFilters = () => {
        setSearch("");
        setStatusFilter("");
        setCategoryFilter("");
    };

    // Summary and chart data are based on the FULL dataset,
    // not the filtered table.
    const summary = useMemo(() => {
        const total = medicinesWithStatus.length;

        const expired = medicinesWithStatus.filter(
            (medicine) =>
                medicine.status === EXPIRY_STATUS.EXPIRED
        ).length;

        const expiringSoon = medicinesWithStatus.filter(
            (medicine) =>
                medicine.status === EXPIRY_STATUS.EXPIRING_SOON
        ).length;

        const safe = medicinesWithStatus.filter(
            (medicine) =>
                medicine.status === EXPIRY_STATUS.SAFE
        ).length;

        return {
            total,
            expired,
            expiringSoon,
            safe,
        };
    }, [medicinesWithStatus]);

    // Count medicines by category.
    const categoryCounts = useMemo(() => {
        const counts = {};

        medicinesWithStatus.forEach((medicine) => {
            const key = medicine.category || "Uncategorized";

            counts[key] = (counts[key] || 0) + 1;
        });

        return Object.entries(counts).map(
            ([category, count]) => ({
                category,
                count,
            })
        );
    }, [medicinesWithStatus]);

    // Inventory-focused metrics.
    const inventoryStats = useMemo(() => {
        const totalStockQuantity = medicinesWithStatus.reduce(
            (sum, medicine) =>
                sum + (Number(medicine.quantity) || 0),
            0
        );

        const categoriesTracked = categories.length;

        const lowStockCount = medicinesWithStatus.filter(
            (medicine) => {
                const reorderLevel =
                    medicine.reorderLevel ??
                    medicine.reorderLevelQuantity ??
                    medicine.thresholdStock ??
                    10;

                return (
                    Number(medicine.quantity) > 0 &&
                    Number(medicine.quantity) <=
                        Number(reorderLevel)
                );
            }
        ).length;

        const needsAttentionCount =
            summary.expired + summary.expiringSoon;

        return {
            totalStockQuantity,
            categoriesTracked,
            lowStockCount,
            needsAttentionCount,
        };
    }, [medicinesWithStatus, categories, summary]);

    return (
        <div className="min-h-screen bg-slate-50 text-left text-slate-800">
            <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">

                {/* Page Heading */}
                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                            Analytics
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Expiry Dashboard
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Track medicine expiry status and inventory analytics
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <button
                            type="button"
                            className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            onClick={() => navigate("/medicines")}
                        >
                            💊 Medicines
                        </button>

                        <button
                            type="button"
                            className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            onClick={() => navigate("/inventory")}
                        >
                            📦 Inventory
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && !loading && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <p className="text-sm font-semibold text-red-700">
                            Unable to load expiry analytics
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                        <p className="mt-4 text-sm font-medium text-slate-500">
                            Loading expiry data...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Expiry Summary */}
                        <ExpirySummaryCards
                            total={summary.total}
                            expired={summary.expired}
                            expiringSoon={summary.expiringSoon}
                            safe={summary.safe}
                        />

                        {/* Inventory Analytics */}
                        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                            <div className="mb-5">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Inventory Analytics
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Overview of medicines by expiry status and category
                                </p>
                            </div>

                            <InventoryAnalyticsCards
                                totalStockQuantity={
                                    inventoryStats.totalStockQuantity
                                }
                                categoriesTracked={
                                    inventoryStats.categoriesTracked
                                }
                                lowStockCount={
                                    inventoryStats.lowStockCount
                                }
                                needsAttentionCount={
                                    inventoryStats.needsAttentionCount
                                }
                            />

                            <ExpiryCharts
                                statusCounts={{
                                    expired: summary.expired,
                                    expiringSoon:
                                        summary.expiringSoon,
                                    safe: summary.safe,
                                }}
                                categoryCounts={categoryCounts}
                            />
                        </section>

                        {/* Expiry Table */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                            <div className="mb-5">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Expiry Table
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Search and filter medicines by expiry status
                                </p>
                            </div>

                            <ExpiryFilters
                                search={search}
                                onSearchChange={setSearch}
                                statusFilter={statusFilter}
                                onStatusChange={setStatusFilter}
                                categoryFilter={categoryFilter}
                                onCategoryChange={setCategoryFilter}
                                categories={categories}
                                onReset={handleResetFilters}
                            />

                            <ExpiryTable
                                medicines={filteredMedicines}
                            />

                            <div className="mt-4 text-xs text-slate-400">
                                Showing {filteredMedicines.length} of{" "}
                                {medicinesWithStatus.length} medicines
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default ExpiryAnalytics;