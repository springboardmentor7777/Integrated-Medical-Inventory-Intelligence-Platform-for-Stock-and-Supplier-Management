import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import StockAlerts from "./pages/StockAlerts";
import ExpiryTracking from "./pages/ExpiryTracking";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? "/app" : "/login"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="medicines" element={<Medicines />} />
              <Route path="stock-alerts" element={<StockAlerts />} />
              <Route path="expiry" element={<ExpiryTracking />} />
              <Route
                path="suppliers"
                element={
                  <ProtectedRoute roles={["Admin", "Pharmacist"]}>
                    <Suppliers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute roles={["Admin", "Pharmacist"]}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route path="notifications" element={<Notifications />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute roles={["Admin"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
