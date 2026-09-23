import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoutes";

import AdminDashboard from "../pages/AdminDashboard";
import PharmacistDashboard from "../pages/PharmacistDashboard";
import StaffDashboard from "../pages/StaffDashboard";
import Unauthorized from "../pages/Unauthorized";

import Login from "../pages/Login";
import Register from "../pages/Register";
import MedicineDashboard from "../pages/MedicineDashboard";
import AddMedicine from "../pages/AddMedicine";
import EditMedicine from "../pages/EditMedicine";
import Inventory from "../pages/Inventory";
import ExpiryAnalytics from "../pages/ExpiryAnalytics";
import SupplierManagement from "../pages/SupplierManagement";
import Alerts from "../pages/Alerts";

import DashboardLayout from "../components/DashboardLayout";
import MainDashboard from "../pages/MainDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/medicines" element={<MedicineDashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/suppliers" element={<SupplierManagement />} />
        <Route path="/expiry-analytics" element={<ExpiryAnalytics />} />

        <Route path="/alerts" element={<Alerts />} />

        <Route
          path="/reports"
          element={
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
              <p className="mt-2 text-sm text-slate-500">
                Reporting functionality will be connected to the reports APIs.
              </p>
            </div>
          }
        />

        <Route
          path="/add-medicine"
          element={<AddMedicine />}
        />

        <Route
          path="/edit-medicine"
          element={<EditMedicine />}
        />
      </Route>

      <Route
        path="/pharmacist"
        element={
          <ProtectedRoute allowedRoles={["PHARMACIST"]}>
            <PharmacistDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
};

export default AppRoutes;
