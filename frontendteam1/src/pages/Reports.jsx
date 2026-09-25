import React, { useState } from "react";

function Reports() {
  const [category, setCategory] = useState("All Categories");
  const [reportType, setReportType] = useState("Inventory Report");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);

  // Generate report
  const handleGenerateReport = () => {
    setReportGenerated(true);
  };

  // Reset filters
  const handleReset = () => {
    setCategory("All Categories");
    setReportType("Inventory Report");
    setFromDate("");
    setToDate("");
    setReportGenerated(false);
  };

  // Select report from card
  const handleReportCard = (type) => {
    setReportType(type);
    setReportGenerated(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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


          {/* FILTERS */}

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
                className="w-full rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
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
                className="w-full rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
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
                className="w-full rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
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
                className="w-full rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
              />

            </div>

          </div>


          {/* BUTTONS */}

          <div className="mt-7 flex flex-wrap gap-3">

            <button
              onClick={handleGenerateReport}
              className="rounded-xl bg-gradient-to-r from-purple-700 to-purple-500 px-7 py-3 font-semibold text-white shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              📊 Generate Report
            </button>

            <button
              onClick={handleReset}
              className="rounded-xl border border-purple-200 bg-white px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
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
                  Date Range: {fromDate || "Any"} → {toDate || "Any"}
                </p>
              )}

              <p className="mt-1 text-sm text-green-600">
                Your report is ready to download.
              </p>

            </div>

          )}

        </div>


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
              onClick={() => handleReportCard("Inventory Report")}
              className="cursor-pointer rounded-2xl border border-purple-100 bg-white p-6 shadow-md transition hover:-translate-y-2 hover:border-purple-300 hover:shadow-xl"
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
              onClick={() => handleReportCard("Low Stock Report")}
              className="cursor-pointer rounded-2xl border border-purple-100 bg-white p-6 shadow-md transition hover:-translate-y-2 hover:border-purple-300 hover:shadow-xl"
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
              onClick={() => handleReportCard("Expiry Report")}
              className="cursor-pointer rounded-2xl border border-purple-100 bg-white p-6 shadow-md transition hover:-translate-y-2 hover:border-purple-300 hover:shadow-xl"
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
              onClick={() => handleReportCard("Category Report")}
              className="cursor-pointer rounded-2xl border border-purple-100 bg-white p-6 shadow-md transition hover:-translate-y-2 hover:border-purple-300 hover:shadow-xl"
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

            <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Total Medicines
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-purple-700">
                    50
                  </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-xl">
                  💊
                </div>

              </div>

            </div>


            {/* TOTAL STOCK */}

            <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Total Stock
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-purple-700">
                    1,250
                  </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-xl">
                  📦
                </div>

              </div>

            </div>


            {/* LOW STOCK */}

            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Low Stock
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-orange-500">
                    8
                  </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-xl">
                  ⚠️
                </div>

              </div>

            </div>


            {/* EXPIRED */}

            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Expired
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-red-500">
                    3
                  </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-xl">
                  ⏰
                </div>

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
              View the distribution of medicines across different categories.
            </p>

          </div>


          <div className="rounded-2xl border border-purple-100 bg-white p-7 shadow-md">

            {/* TABLETS */}

            <div className="mb-6">

              <div className="mb-2 flex justify-between">

                <span className="font-semibold text-purple-900">
                  Tablets
                </span>

                <span className="font-semibold text-purple-700">
                  40
                </span>

              </div>

              <div className="h-3 w-full rounded-full bg-purple-100">

                <div
                  className="h-3 rounded-full bg-purple-700"
                  style={{ width: "40%" }}
                ></div>

              </div>

            </div>


            {/* CAPSULES */}

            <div className="mb-6">

              <div className="mb-2 flex justify-between">

                <span className="font-semibold text-purple-900">
                  Capsules
                </span>

                <span className="font-semibold text-purple-700">
                  25
                </span>

              </div>

              <div className="h-3 w-full rounded-full bg-purple-100">

                <div
                  className="h-3 rounded-full bg-purple-600"
                  style={{ width: "25%" }}
                ></div>

              </div>

            </div>


            {/* SYRUPS */}

            <div className="mb-6">

              <div className="mb-2 flex justify-between">

                <span className="font-semibold text-purple-900">
                  Syrups
                </span>

                <span className="font-semibold text-purple-700">
                  20
                </span>

              </div>

              <div className="h-3 w-full rounded-full bg-purple-100">

                <div
                  className="h-3 rounded-full bg-purple-500"
                  style={{ width: "20%" }}
                ></div>

              </div>

            </div>


            {/* INJECTIONS */}

            <div>

              <div className="mb-2 flex justify-between">

                <span className="font-semibold text-purple-900">
                  Injections
                </span>

                <span className="font-semibold text-purple-700">
                  15
                </span>

              </div>

              <div className="h-3 w-full rounded-full bg-purple-100">

                <div
                  className="h-3 rounded-full bg-purple-400"
                  style={{ width: "15%" }}
                ></div>

              </div>

            </div>

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
                onClick={() =>
                  alert("PDF export will be connected to the backend.")
                }
                className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
              >
                📄 Download PDF
              </button>


              <button
                onClick={() =>
                  alert("Excel export will be connected to the backend.")
                }
                className="rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-800"
              >
                📊 Download Excel
              </button>

            </div>

          </div>

        </div>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="mt-6 text-center">

          <p className="text-xs text-purple-400">
            MediStock Inventory Management System
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Analytics and reports will be connected to the backend APIs.
          </p>

        </div>

      </div>
{/* Navigation */}
<div className="mt-8 flex flex-col gap-4 sm:flex-row">


</div>
    </div>
  );
}

export default Reports;