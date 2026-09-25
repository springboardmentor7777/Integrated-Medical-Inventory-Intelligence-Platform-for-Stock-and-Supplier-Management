import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
function Analytics() {
  const navigate = useNavigate();
 const { token } = useAuth();
  // ================================
  // API DATA
  // ================================

  const [summary, setSummary] = useState({
    totalMedicines: 0,
    totalStock: 0,
    lowStock: 0,
    expired: 0,
    expiringSoon: 0,
  });

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // FETCH ANALYTICS DATA
  // ================================

useEffect(() => {
    const loadAnalytics = async () => {

        if (!token) {
            setError("Please login again.");
            setLoading(false);
            return;
        }

        try {
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const summaryResponse = await axios.get(
                "http://localhost:8080/api/analytics/summary",
                { headers }
            );

            const categoryResponse = await axios.get(
                "http://localhost:8080/api/analytics/category-wise",
                { headers }
            );

            setSummary(summaryResponse.data);
            setCategories(categoryResponse.data);

        } catch (error) {
            console.error("Analytics API Error:", error);
            setError("Unable to load analytics data.");
        } finally {
            setLoading(false);
        }
    };

    loadAnalytics();
}, [token]);

  // ================================
  // STATISTICS CARDS
  // ================================

  const stats = [
    {
      icon: "💊",
      title: "Total Medicines",
      value: summary.totalMedicines,
    },
    {
      icon: "📦",
      title: "Total Stock",
      value: summary.totalStock,
    },
    {
      icon: "⚠️",
      title: "Low Stock",
      value: summary.lowStock,
    },
    {
      icon: "❌",
      title: "Expired",
      value: summary.expired,
    },
    {
      icon: "⏰",
      title: "Expiring Soon",
      value: summary.expiringSoon,
    },
  ];

  // ================================
  // CALCULATE HEALTHY MEDICINES
  // ================================

  const healthyInventory = Math.max(
    summary.totalMedicines -
      summary.lowStock -
      summary.expired -
      summary.expiringSoon,
    0
  );

  // ================================
  // UI
  // ================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 text-purple-950">

      {/* ================================
          HEADER
      ================================= */}

      <div className="bg-gradient-to-r from-purple-800 to-purple-600 px-6 py-14 text-center text-white shadow-lg">

        <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-purple-200">
          MEDISTOCK ANALYTICS
        </p>

        <h1 className="text-4xl font-bold md:text-5xl">
          Inventory Analytics
        </h1>

        <p className="mt-4 text-purple-100">
          Overview of medicine inventory and stock levels.
        </p>

      </div>


      {/* ================================
          MAIN CONTENT
      ================================= */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* ================================
            ERROR MESSAGE
        ================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        )}


        {/* ================================
            LOADING MESSAGE
        ================================= */}

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">

            <p className="text-lg font-semibold text-purple-700">
              Loading analytics...
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Fetching inventory data from the backend.
            </p>

          </div>
        ) : (
          <>
            {/* ================================
                STATISTICS
            ================================= */}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-purple-100 bg-white p-6 text-center shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                    {stat.icon}
                  </div>

                  <p className="text-sm font-medium text-purple-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-purple-800">
                    {stat.value}
                  </p>

                </div>
              ))}

            </div>


            {/* ================================
                CATEGORY SECTION
            ================================= */}

            <div className="mt-8 rounded-2xl border border-purple-100 bg-white p-7 shadow-md">

              <div className="mb-6">

                <p className="text-xs font-bold tracking-widest text-purple-500">
                  INVENTORY DISTRIBUTION
                </p>

                <h2 className="mt-1 text-2xl font-bold text-purple-900">
                  Category-wise Inventory
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Medicine distribution by category
                </p>

              </div>


              {/* Category Data */}

              {categories.length === 0 ? (

                <p className="text-sm text-gray-500">
                  No category data available.
                </p>

              ) : (

                <div className="space-y-5">

                  {categories.map((category) => (

                    <div key={category.category}>

                      <div className="mb-2 flex justify-between text-sm">

                        <span className="font-semibold text-purple-900">
                          {category.category}
                        </span>

                        <span className="font-bold text-purple-600">
                          {category.medicineCount}
                        </span>

                      </div>


                      <div className="h-3 overflow-hidden rounded-full bg-purple-100">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-700 to-purple-400"
                          style={{
                            width: `${Math.min(
                              category.medicineCount,
                              100
                            )}%`,
                          }}
                        ></div>

                      </div>


                      <p className="mt-1 text-xs text-gray-400">
                        Total Stock: {category.totalStock}
                      </p>

                    </div>

                  ))}

                </div>

              )}

            </div>


            {/* ================================
                INVENTORY SUMMARY
            ================================= */}

            <div className="mt-8 grid gap-6 md:grid-cols-3">


              {/* Healthy Inventory */}

              <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-md">

                <p className="text-sm font-medium text-gray-500">
                  Healthy Inventory
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {healthyInventory}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Medicines available normally
                </p>

              </div>


              {/* Low Stock */}

              <div className="rounded-2xl border border-yellow-100 bg-white p-6 shadow-md">

                <p className="text-sm font-medium text-gray-500">
                  Low Stock Medicines
                </p>

                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {summary.lowStock}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Medicines requiring attention
                </p>

              </div>


              {/* Expired */}

              <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-md">

                <p className="text-sm font-medium text-gray-500">
                  Expired Medicines
                </p>

                <p className="mt-2 text-3xl font-bold text-red-500">
                  {summary.expired}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Medicines requiring removal
                </p>

              </div>

            </div>


            {/* ================================
                NAVIGATION BUTTONS
            ================================= */}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">


              {/* Back to Dashboard */}

              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 rounded-xl bg-white px-6 py-4 font-semibold text-purple-700 shadow-md transition hover:-translate-y-1 hover:bg-purple-50 hover:shadow-lg"
              >
                ← Back to Dashboard
              </button>


              {/* Go to Reports */}

              <button
                onClick={() => navigate("/reports")}
                className="flex-1 rounded-xl bg-purple-700 px-6 py-4 font-semibold text-white shadow-md transition hover:-translate-y-1 hover:bg-purple-800 hover:shadow-lg"
              >
                Generate Reports →
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  );
}

export default Analytics;