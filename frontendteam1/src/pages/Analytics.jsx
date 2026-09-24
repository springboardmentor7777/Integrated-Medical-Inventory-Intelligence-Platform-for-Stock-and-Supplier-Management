import React from "react";
import { useNavigate } from "react-router-dom";

function Analytics() {
  const navigate = useNavigate();

  const stats = [
    {
      icon: "💊",
      title: "Total Medicines",
      value: 120,
    },
    {
      icon: "📦",
      title: "Total Stock",
      value: 5430,
    },
    {
      icon: "⚠️",
      title: "Low Stock",
      value: 8,
    },
    {
      icon: "❌",
      title: "Expired",
      value: 3,
    },
    {
      icon: "⏰",
      title: "Expiring Soon",
      value: 12,
    },
  ];

  const categories = [
    { name: "Tablets", value: 65 },
    { name: "Capsules", value: 32 },
    { name: "Syrups", value: 18 },
    { name: "Injections", value: 10 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 text-purple-950">

      {/* Header */}
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

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Statistics */}
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

        {/* Category Section */}
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

          <div className="space-y-5">

            {categories.map((category) => (
              <div key={category.name}>

                <div className="mb-2 flex justify-between text-sm">

                  <span className="font-semibold text-purple-900">
                    {category.name}
                  </span>

                  <span className="font-bold text-purple-600">
                    {category.value}
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-purple-100">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-700 to-purple-400"
                    style={{
                      width: `${Math.min(category.value, 100)}%`,
                    }}
                  ></div>

                </div>

              </div>
            ))}

          </div>

        </div>

        {/* Inventory Summary */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">

          {/* Healthy Inventory */}
          <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-md">

            <p className="text-sm font-medium text-gray-500">
              Healthy Inventory
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              97
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
              8
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
              3
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Medicines requiring removal
            </p>

          </div>

        </div>

        {/* Navigation Buttons */}
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

      </div>
    </div>
  );
}

export default Analytics;