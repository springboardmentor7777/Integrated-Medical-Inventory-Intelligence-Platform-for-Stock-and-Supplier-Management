import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function Reports() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("All Categories");
  const [reportType, setReportType] = useState("Inventory Report");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [reportGenerated, setReportGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // ================= BACKEND DATA =================

  const [medicines, setMedicines] = useState([]);
  const [categoryApiData, setCategoryApiData] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // ================= CHART COLORS =================

  const chartColors = [
    "#ec4899", // Pink
    "#1e3a8a", // Dark Blue
    "#166534", // Dark Green
    "#f97316", // Orange
    "#7c3aed", // Purple
    "#0891b2", // Cyan
    "#dc2626", // Red
    "#ca8a04", // Dark Yellow
    "#0f766e", // Teal
    "#be185d", // Dark Pink
  ];

  const supplierColors = [
    "#ec4899", // Pink
    "#1e3a8a", // Dark Blue
    "#166534", // Dark Green
    "#f97316", // Orange
    "#7c3aed", // Purple
  ];

  // =====================================================
  // FETCH BACKEND DATA
  // =====================================================

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        setApiError("");

        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [
          medicinesResponse,
          categoryResponse,
          stockLogsResponse,
          lowStockResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/api/medicines`, {
            headers,
          }),

          fetch(`${API_BASE_URL}/api/analytics/category-wise`, {
            headers,
          }),

          fetch(`${API_BASE_URL}/api/stock-logs`, {
            headers,
          }),

          fetch(`${API_BASE_URL}/api/alerts/low-stock`, {
            headers,
          }),
        ]);

        if (!medicinesResponse.ok) {
          throw new Error("Failed to fetch medicines");
        }

        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch category analytics");
        }

        if (!stockLogsResponse.ok) {
          throw new Error("Failed to fetch stock logs");
        }

        if (!lowStockResponse.ok) {
          throw new Error("Failed to fetch low-stock alerts");
        }

        const medicinesData = await medicinesResponse.json();
        const categoryDataResponse = await categoryResponse.json();
        const stockLogsData = await stockLogsResponse.json();
        const lowStockData = await lowStockResponse.json();

        setMedicines(
          Array.isArray(medicinesData)
            ? medicinesData
            : medicinesData.data || []
        );

        setCategoryApiData(
          Array.isArray(categoryDataResponse)
            ? categoryDataResponse
            : categoryDataResponse.data || []
        );

        setStockLogs(
          Array.isArray(stockLogsData)
            ? stockLogsData
            : stockLogsData.data || []
        );

        setLowStockAlerts(
          Array.isArray(lowStockData)
            ? lowStockData
            : lowStockData.data || []
        );
      } catch (error) {
        console.error("Reports API error:", error);
        setApiError(
          "Unable to load report data. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  // =====================================================
  // CATEGORY NAME CONVERSION
  // =====================================================

  const getBackendCategory = () => {
    const categoryMap = {
      "All Categories": "All Categories",
      Tablets: "Tablet",
      Capsules: "Capsule",
      Syrups: "Syrup",
      Injections: "Injection",
    };

    return categoryMap[category] || category;
  };

  // =====================================================
  // CATEGORY COMPARISON
  // =====================================================

  const normalizeCategory = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/s$/, "");
  };

  // =====================================================
  // FILTER MEDICINES BY CATEGORY
  // =====================================================

  const filteredMedicines = medicines.filter((medicine) => {
    if (category === "All Categories") {
      return true;
    }

    return (
      normalizeCategory(medicine.category) ===
      normalizeCategory(getBackendCategory())
    );
  });

  // =====================================================
  // CATEGORY PIE CHART DATA
  // GET /api/analytics/category-wise
  // =====================================================

  const categoryData = categoryApiData
    .filter((item) => {
      if (category === "All Categories") {
        return true;
      }

      return (
        normalizeCategory(item.category) ===
        normalizeCategory(getBackendCategory())
      );
    })
    .map((item) => ({
      name: item.category,
      value: Number(item.totalStock) || 0,
    }));

  // =====================================================
  // SUPPLIER-WISE STOCK DATA
  // GET /api/medicines
  // =====================================================

  const supplierTotals = {};

  filteredMedicines.forEach((medicine) => {
    const supplierName =
      medicine.supplier?.name || "Unknown Supplier";

    const quantity = Number(medicine.quantity) || 0;

    if (!supplierTotals[supplierName]) {
      supplierTotals[supplierName] = 0;
    }

    supplierTotals[supplierName] += quantity;
  });

  const supplierData = Object.entries(supplierTotals)
    .map(([name, stock]) => ({
      name,
      stock,
    }))
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  // =====================================================
  // STOCK MOVEMENT
  // GET /api/stock-logs
  // =====================================================

  const getSignedQuantity = (log) => {
    const quantity = Number(log.quantityChanged) || 0;

    const action = String(log.actionType || "").toUpperCase();

    if (
      action === "REMOVE" ||
      action === "DELETE" ||
      action === "SUBTRACT" ||
      action === "ISSUE" ||
      action === "DISPENSE"
    ) {
      return -Math.abs(quantity);
    }

    return quantity;
  };

  const stockMovementMap = {};

  const medicineCategoryMap = {};

  medicines.forEach((medicine) => {
    medicineCategoryMap[medicine.id] = medicine.category;
  });

  stockLogs.forEach((log) => {
    // Category filter
    if (category !== "All Categories") {
      const medicineId = log.medicine?.id;

      const logCategory = medicineCategoryMap[medicineId];

      if (
        normalizeCategory(logCategory) !==
        normalizeCategory(getBackendCategory())
      ) {
        return;
      }
    }

    // Date filter
    if (!log.logTime) {
      return;
    }

    const logDate = new Date(log.logTime);

    if (Number.isNaN(logDate.getTime())) {
      return;
    }

    const dateString = logDate.toISOString().split("T")[0];

    if (fromDate && dateString < fromDate) {
      return;
    }

    if (toDate && dateString > toDate) {
      return;
    }

    const month = logDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!stockMovementMap[month]) {
      stockMovementMap[month] = {
        month,
        movement: 0,
        sortDate: new Date(
          logDate.getFullYear(),
          logDate.getMonth(),
          1
        ),
      };
    }

    stockMovementMap[month].movement += getSignedQuantity(log);
  });

  const stockMovementData = Object.values(stockMovementMap)
    .sort((a, b) => a.sortDate - b.sortDate)
    .reduce((result, item) => {
      const previousStock =
        result.length > 0
          ? result[result.length - 1].stock
          : 0;

      result.push({
        month: item.month,
        stock: previousStock + item.movement,
      });

      return result;
    }, []);

  // =====================================================
  // SUMMARY VALUES
  // =====================================================

  const totalMedicines = filteredMedicines.length;

  const totalStock = filteredMedicines.reduce(
    (total, medicine) =>
      total + (Number(medicine.quantity) || 0),
    0
  );

  const lowStockCount = lowStockAlerts.filter((alert) => {
    if (category === "All Categories") {
      return true;
    }

    return (
      normalizeCategory(alert.medicine?.category) ===
      normalizeCategory(getBackendCategory())
    );
  }).length;

  const today = new Date();

  const expiredCount = filteredMedicines.filter((medicine) => {
    if (!medicine.expiryDate) {
      return false;
    }

    return new Date(medicine.expiryDate) < today;
  }).length;

  // =====================================================
  // REPORT URL
  // =====================================================

  const getReportUrl = () => {
    const params = new URLSearchParams();

    params.append("reportType", reportType);

    if (category !== "All Categories") {
      params.append("category", getBackendCategory());
    }

    if (fromDate) {
      params.append("fromDate", fromDate);
    }

    if (toDate) {
      params.append("toDate", toDate);
    }

    return `${API_BASE_URL}/api/reports/medicines?${params.toString()}`;
  };

  // =====================================================
  // EXCEL REPORT URL
  // =====================================================

  const getExcelReportUrl = () => {
    const params = new URLSearchParams();

    params.append("reportType", reportType);

    if (category !== "All Categories") {
      params.append("category", getBackendCategory());
    }

    if (fromDate) {
      params.append("fromDate", fromDate);
    }

    if (toDate) {
      params.append("toDate", toDate);
    }

    return `${API_BASE_URL}/api/reports/medicines/excel?${params.toString()}`;
  };

  // =====================================================
  // GENERATE REPORT
  // =====================================================

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(getReportUrl(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      setReportGenerated(true);
    } catch (error) {
      console.error("Report generation error:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(getReportUrl(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      const fileName = `MediStock_${reportType.replaceAll(
        " ",
        "_"
      )}.pdf`;

      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Failed to download PDF report.");
    } finally {
      setDownloading(false);
    }
  };

  // =====================================================
  // DOWNLOAD EXCEL
  // =====================================================

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(getExcelReportUrl(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download Excel");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      const fileName = `MediStock_${reportType.replaceAll(
        " ",
        "_"
      )}.xlsx`;

      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel download error:", error);
      alert("Failed to download Excel report.");
    } finally {
      setDownloading(false);
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setCategory("All Categories");
    setReportType("Inventory Report");
    setFromDate("");
    setToDate("");
    setReportGenerated(false);
  };

  // =====================================================
  // REPORT CARD
  // =====================================================

  const handleReportCard = (type) => {
    setReportType(type);
    setReportGenerated(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="bg-gradient-to-r from-purple-800 to-purple-600 px-6 py-12 text-white shadow-lg">

        <div className="mx-auto max-w-7xl">

          <p className="text-sm font-semibold tracking-[0.25em] text-purple-200">
            Ⓜ️ MEDISTOCK REPORTS
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Inventory Reports
          </h1>

          <p className="mt-3 text-purple-100">
            Generate and manage medicine inventory reports.
          </p>

        </div>

      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* =====================================================
            REPORT GENERATOR
        ====================================================== */}

        <div className="rounded-2xl border border-purple-100 bg-white p-7 shadow-md">

          <div className="mb-7">

            <p className="text-xs font-bold tracking-widest text-purple-500">
              REPORT GENERATOR
            </p>

            <h2 className="mt-1 text-2xl font-bold text-purple-800">
              Generate a Report
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select the required report and apply filters.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* REPORT TYPE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-purple-900">
                Report Type
              </label>

              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setReportGenerated(false);
                }}
                className="w-full rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900 outline-none"
              >

                <option>Inventory Report</option>
                <option>Stock Report</option>
                <option>Low Stock Report</option>
                <option>Expiry Report</option>
                <option>Category Report</option>

              </select>

            </div>

            {/* CATEGORY */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-purple-900">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setReportGenerated(false);
                }}
                className="w-full rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900 outline-none"
              >

                <option>All Categories</option>
                <option>Tablets</option>
                <option>Capsules</option>
                <option>Syrups</option>
                <option>Injections</option>

              </select>

            </div>

            {/* FROM DATE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-purple-900">
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setReportGenerated(false);
                }}
                className="w-full rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900 outline-none"
              />

            </div>

            {/* TO DATE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-purple-900">
                To Date
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setReportGenerated(false);
                }}
                className="w-full rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900 outline-none"
              />

            </div>

          </div>

          {/* BUTTONS */}

          <div className="mt-7 flex flex-wrap gap-3">

            <button
              onClick={handleGenerateReport}
              className="rounded-xl bg-gradient-to-r from-purple-700 to-purple-500 px-7 py-3 font-semibold text-white shadow-md"
            >
              📊 Generate Report
            </button>

            <button
              onClick={handleReset}
              className="rounded-xl border border-purple-200 bg-white px-6 py-3 font-semibold text-purple-700"
            >
              ↻ Reset
            </button>

          </div>

          {/* SUCCESS MESSAGE */}

          {reportGenerated && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">

              <p className="font-semibold text-green-700">
                ✓ {reportType} generated successfully
              </p>

              <p className="mt-1 text-sm text-green-600">
                Category: {category}
              </p>

              {(fromDate || toDate) && (
                <p className="mt-1 text-sm text-green-600">
                  Date Range: {fromDate || "Any"} →{" "}
                  {toDate || "Any"}
                </p>
              )}

              <p className="mt-1 text-sm text-green-600">
                Your report is ready to download.
              </p>

            </div>
          )}

        </div>

        {/* =====================================================
            API STATUS
        ====================================================== */}

        {loading && (
          <div className="mt-6 rounded-xl bg-blue-50 p-4 text-center text-blue-700">
            Loading report data...
          </div>
        )}

        {apiError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            ⚠️ {apiError}
          </div>
        )}

        {/* =====================================================
            REPORT CATEGORIES
        ====================================================== */}

        <div className="mt-8">

          <div className="mb-5">

            <p className="text-xs font-bold tracking-widest text-purple-500">
              AVAILABLE REPORTS
            </p>

            <h2 className="mt-1 text-2xl font-bold text-purple-800">
              Report Categories
            </h2>

          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {/* INVENTORY */}

            <div
              onClick={() =>
                handleReportCard("Inventory Report")
              }
              className="cursor-pointer rounded-2xl border border-purple-100 bg-white p-6 shadow-md transition hover:-translate-y-2 hover:shadow-xl"
            >

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                📦
              </div>

              <h3 className="font-bold text-purple-900">
                Inventory Report
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                View overall medicine inventory and stock levels.
              </p>

              <p className="mt-4 text-xs font-bold text-purple-600">
                VIEW REPORT →
              </p>

            </div>

            {/* LOW STOCK */}

            <div
              onClick={() =>
                handleReportCard("Low Stock Report")
              }
              className="cursor-pointer rounded-2xl border border-purple-100 bg-white p-6 shadow-md transition hover:-translate-y-2 hover:shadow-xl"
            >

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
                ⚠️
              </div>

              <h3 className="font-bold text-purple-900">
                Low Stock Report
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Identify medicines that require restocking.
              </p>

              <p className="mt-4 text-xs font-bold text-purple-600">
                VIEW REPORT →
              </p>

            </div>

            {/* EXPIRY */}

            <div
              onClick={() =>
                handleReportCard("Expiry Report")
              }
              className="cursor-pointer rounded-2xl border border-purple-100 bg-white p-6 shadow-md transition hover:-translate-y-2 hover:shadow-xl"
            >

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl">
                ⏰
              </div>

              <h3 className="font-bold text-purple-900">
                Expiry Report
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                View expired and soon-to-expire medicines.
              </p>

              <p className="mt-4 text-xs font-bold text-purple-600">
                VIEW REPORT →
              </p>

            </div>

            {/* CATEGORY */}

            <div
              onClick={() =>
                handleReportCard("Category Report")
              }
              className="cursor-pointer rounded-2xl border border-purple-100 bg-white p-6 shadow-md transition hover:-translate-y-2 hover:shadow-xl"
            >

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                📊
              </div>

              <h3 className="font-bold text-purple-900">
                Category Report
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Analyze inventory distribution by category.
              </p>

              <p className="mt-4 text-xs font-bold text-purple-600">
                VIEW REPORT →
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            REPORT SUMMARY
        ====================================================== */}

        <div className="mt-8">

          <div className="mb-5">

            <p className="text-xs font-bold tracking-widest text-purple-500">
              REPORT SUMMARY
            </p>

            <h2 className="mt-1 text-2xl font-bold text-purple-800">
              Inventory Overview
            </h2>

          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {/* TOTAL MEDICINES */}

            <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-md">

              <p className="text-sm font-medium text-gray-500">
                Total Medicines
              </p>

              <h3 className="mt-2 text-3xl font-bold text-purple-700">
                {totalMedicines}
              </h3>

              <div className="mt-3 text-xl">
                💊
              </div>

            </div>

            {/* TOTAL STOCK */}

            <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-md">

              <p className="text-sm font-medium text-gray-500">
                Total Stock
              </p>

              <h3 className="mt-2 text-3xl font-bold text-purple-700">
                {totalStock.toLocaleString()}
              </h3>

              <div className="mt-3 text-xl">
                📦
              </div>

            </div>

            {/* LOW STOCK */}

            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-md">

              <p className="text-sm font-medium text-gray-500">
                Low Stock
              </p>

              <h3 className="mt-2 text-3xl font-bold text-orange-500">
                {lowStockCount}
              </h3>

              <div className="mt-3 text-xl">
                ⚠️
              </div>

            </div>

            {/* EXPIRED */}

            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-md">

              <p className="text-sm font-medium text-gray-500">
                Expired
              </p>

              <h3 className="mt-2 text-3xl font-bold text-red-500">
                {expiredCount}
              </h3>

              <div className="mt-3 text-xl">
                ⏰
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            CATEGORY STATISTICS
        ====================================================== */}

        <div className="mt-8">

          <div className="mb-5">

            <p className="text-xs font-bold tracking-widest text-purple-500">
              INVENTORY ANALYTICS
            </p>

            <h2 className="mt-1 text-2xl font-bold text-purple-800">
              Category Statistics
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View the distribution of stock across categories.
            </p>

          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-7 shadow-md">

            {categoryData.length === 0 ? (

              <p className="text-center text-gray-500">
                No category data available.
              </p>

            ) : (

              categoryData.map((item, index) => {

                const maxStock = Math.max(
                  ...categoryData.map(
                    (categoryItem) =>
                      Number(categoryItem.value) || 0
                  )
                );

                const percentage =
                  maxStock > 0
                    ? (item.value / maxStock) * 100
                    : 0;

                return (
                  <div
                    key={item.name}
                    className="mb-6 last:mb-0"
                  >

                    <div className="mb-2 flex justify-between">

                      <span className="font-semibold text-purple-900">
                        {item.name}
                      </span>

                      <span className="font-semibold text-purple-700">
                        {item.value}
                      </span>

                    </div>

                    <div className="h-3 w-full rounded-full bg-purple-100">

                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor:
                            chartColors[
                              index % chartColors.length
                            ],
                        }}
                      />

                    </div>

                  </div>
                );
              })

            )}

          </div>

        </div>

        {/* =====================================================
            REPORT CHARTS
        ====================================================== */}

        <div className="mt-8">

          <div className="mb-5">

            <p className="text-xs font-bold tracking-widest text-purple-500">
              REPORT VISUALIZATION
            </p>

            <h2 className="mt-1 text-2xl font-bold text-purple-800">
              Inventory Charts
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Visual representation of inventory and stock data.
            </p>

          </div>

          {/* =====================================================
              PIE + LINE
          ====================================================== */}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* CATEGORY PIE CHART */}

            <div className="rounded-2xl border border-purple-100 bg-white p-7 shadow-md">

              <h3 className="mb-5 text-lg font-bold text-purple-900">
                Stock by Category
              </h3>

              <div className="h-96">

                {categoryData.length === 0 ? (

                  <div className="flex h-full items-center justify-center text-gray-500">
                    No category data available.
                  </div>

                ) : (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={105}
                        label
                      >

                        {categoryData.map(
                          (entry, index) => (

                            <Cell
                              key={`category-${index}`}
                              fill={
                                chartColors[
                                  index %
                                    chartColors.length
                                ]
                              }
                            />

                          )
                        )}

                      </Pie>

                      <Tooltip />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                )}

              </div>

            </div>

            {/* STOCK MOVEMENT */}

            <div className="rounded-2xl border border-purple-100 bg-white p-7 shadow-md">

              <h3 className="mb-5 text-lg font-bold text-purple-900">
                Stock Movement Over Time
              </h3>

              <div className="h-96">

                {stockMovementData.length === 0 ? (

                  <div className="flex h-full items-center justify-center text-center text-gray-500">
                    No stock movement data available
                    <br />
                    for the selected filters.
                  </div>

                ) : (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={stockMovementData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 10,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                      />

                      <YAxis />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="stock"
                        name="Stock Movement"
                        stroke="#1e3a8a"
                        strokeWidth={3}
                        dot={{
                          r: 5,
                        }}
                        activeDot={{
                          r: 7,
                        }}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                )}

              </div>

            </div>

          </div>

          {/* =====================================================
              SUPPLIER BAR CHART
          ====================================================== */}

          <div className="mt-6 rounded-2xl border border-purple-100 bg-white p-7 shadow-md">

            <h3 className="mb-5 text-lg font-bold text-purple-900">
              Supplier-wise Stock
            </h3>

            <div className="h-96">

              {supplierData.length === 0 ? (

                <div className="flex h-full items-center justify-center text-gray-500">
                  No supplier data available.
                </div>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={supplierData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 45,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar dataKey="stock">

                      {supplierData.map(
                        (entry, index) => (

                          <Cell
                            key={`supplier-${index}`}
                            fill={
                              supplierColors[
                                index %
                                  supplierColors.length
                              ]
                            }
                          />

                        )
                      )}

                    </Bar>

                  </BarChart>

                </ResponsiveContainer>

              )}

            </div>

            {/* CUSTOM LABEL INSTEAD OF BLACK LEGEND */}

            <p className="mt-2 text-center text-sm text-gray-500">
              Stock Quantity
            </p>

          </div>

        </div>

        {/* =====================================================
            DOWNLOAD SECTION
        ====================================================== */}

        <div className="mt-8 rounded-2xl border border-purple-100 bg-white p-7 shadow-md">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>

              <p className="text-xs font-bold tracking-widest text-purple-500">
                EXPORT
              </p>

              <h2 className="mt-1 text-xl font-bold text-purple-800">
                Download Report
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Export generated inventory data for further use.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-semibold text-purple-700 disabled:opacity-60"
              >
                {downloading
                  ? "⏳ Downloading..."
                  : "📄 Download PDF"}
              </button>

              <button
                onClick={handleDownloadExcel}
                disabled={downloading}
                className="rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {downloading
                  ? "⏳ Downloading..."
                  : "📊 Download Excel"}
              </button>

            </div>

          </div>

        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row">

          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 rounded-xl bg-white px-6 py-4 font-semibold text-purple-700 shadow-md"
          >
            🏠 Back to Dashboard
          </button>

          <button
            onClick={() => navigate("/analytics")}
            className="flex-1 rounded-xl bg-purple-700 px-6 py-4 font-semibold text-white shadow-md"
          >
            📊 View Analytics →
          </button>

        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="mt-6 text-center">

          <p className="text-xs text-purple-400">
            MediStock Inventory Management System
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Analytics and reports connected to backend APIs.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Reports;