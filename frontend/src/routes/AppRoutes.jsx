import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";

import AdminDashboard from "../pages/AdminDashboard";
import PharmacistDashboard from "../pages/PharmacistDashboard";
import StaffDashboard from "../pages/StaffDashboard";

import MedicineDashboard from "../pages/MedicineDashboard";
import Inventory from "../pages/Inventory";
import ExpiryAnalytics from "../pages/ExpiryAnalytics";
import Suppliers from "../pages/Suppliers";
import Alerts from "../pages/Alerts";
import AddMedicine from "../pages/AddMedicine";
import EditMedicine from "../pages/EditMedicine";

import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";

import { useAuth } from "../context/useAuth";

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "ADMIN":
      return <Navigate to="/admin" replace />;

    case "PHARMACIST":
      return <Navigate to="/pharmacist" replace />;

    case "STAFF":
      return <Navigate to="/staff" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Role-specific Dashboards */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/pharmacist"
        element={
          <ProtectedRoute allowedRoles={["PHARMACIST"]}>
            <DashboardLayout>
              <PharmacistDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <DashboardLayout>
              <StaffDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Generic Dashboard Redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "PHARMACIST", "STAFF"]}
          >
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Medicine Management */}
      <Route
        path="/medicines"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "PHARMACIST", "STAFF"]}
          >
            <MedicineDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-medicine"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
            <AddMedicine />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-medicine"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
            <EditMedicine />
          </ProtectedRoute>
        }
      />

      {/* Inventory */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "PHARMACIST", "STAFF"]}
          >
            <Inventory />
          </ProtectedRoute>
        }
      />

      {/* Expiry & Analytics */}
      <Route
        path="/expiry-analytics"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
            <ExpiryAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Suppliers */}
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
            <Suppliers />
          </ProtectedRoute>
        }
      />

      {/* Alerts */}
      <Route
        path="/alerts"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "PHARMACIST", "STAFF"]}
          >
            <Alerts />
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-stone-800">
                Reports
              </h1>

              <p className="mt-2 text-sm text-stone-500">
                Reports module coming soon.
              </p>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Default Routes */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;