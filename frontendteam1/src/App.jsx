import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Suppliers from "./pages/Suppliers";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MedicineSearch from "./pages/MedicineSearch";
import Medicines from "./pages/Medicines";
import Inventory from "./pages/Inventory.jsx";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import InventoryIntelligenceDashboard from "./InventoryIntelligenceDashboard";

import DashboardLayout from "./components/DashboardLayout";

function App() {
  return (
      <BrowserRouter>

        <Routes>

          {/* =================================================
                    DEFAULT ROUTE
                ================================================= */}
          <Route
              path="/"
              element={<Navigate to="/login" replace />}
          />


          {/* =================================================
                    AUTHENTICATION PAGES
                    These DO NOT use the sidebar
                ================================================= */}

          <Route
              path="/login"
              element={<Login />}
          />

          <Route
              path="/admin-login"
              element={<AdminLogin />}
          />

          <Route
              path="/register"
              element={<Register />}
          />

          <Route
              path="/admin-dashboard"
              element={<AdminDashboard />}
          />


          {/* =================================================
                    MEDISTOCK MAIN MODULES
                    All of these share DashboardLayout
                ================================================= */}

          <Route element={<DashboardLayout />}>

            <Route
                path="/dashboard"
                element={<Dashboard />}
            />

            <Route
                path="/analytics"
                element={<Analytics />}
            />

            <Route
                path="/inventory-intelligence"
                element={
                  <InventoryIntelligenceDashboard />
                }
            />

            <Route
                path="/medicines"
                element={<Medicines />}
            />

            <Route
                path="/inventory"
                element={<Inventory />}
            />

            <Route
                path="/suppliers"
                element={<Suppliers />}
            />

            <Route
                path="/medicine-search"
                element={<MedicineSearch />}
            />

            <Route
                path="/reports"
                element={<Reports />}
            />

          </Route>

        </Routes>

      </BrowserRouter>
  );
}

export default App;