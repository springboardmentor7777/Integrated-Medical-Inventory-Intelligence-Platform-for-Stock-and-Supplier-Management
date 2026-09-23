import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import ProtectedRoute from "../components/ProtectedRoutes";

import AdminDashboard from "../pages/AdminDashboard";
import PharmacistDashboard from "../pages/PharmacistDashboard";
import StaffDashboard from "../pages/StaffDashboard";
import Unauthorized from "../pages/Unauthorized";

import MedicineDashboard from "../pages/MedicineDashboard";
import AddMedicine from "../pages/AddMedicine";
import EditMedicine from "../pages/EditMedicine";
import Inventory from "../pages/Inventory";
import ExpiryAnalytics from "../pages/ExpiryAnalytics";

import DashboardLayout from "../components/DashboardLayout";
import MainDashboard from "../pages/MainDashboard";

const API_URL = "http://localhost:8082/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid username or password"
        );
      }

      login(data);

      if (data.role === "ADMIN") {
        navigate("/admin");
      } else if (data.role === "PHARMACIST") {
        navigate("/dashboard");
      } else if (data.role === "STAFF") {
        navigate("/staff");
      } else {
        navigate("/unauthorized");
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please check your network or try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>MediStock</h1>
        <p>Medical Inventory Management</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="register-link"
        >
          Create an account
        </button>
      </div>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    role: "STAFF",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage("Registration successful. You can now login.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Create Account</h1>
        <p>MediStock Registration</p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="STAFF">Staff</option>
            <option value="PHARMACIST">Pharmacist</option>
          </select>

          {error && <p className="login-error">{error}</p>}

          {message && (
            <p className="login-success">{message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="register-link"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

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
        <Route
          path="/expiry-analytics"
          element={<ExpiryAnalytics />}
        />
      </Route>

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

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
            <div className="module-placeholder">
              <h1>Supplier Management</h1>
              <p>Supplier Management module will be integrated here.</p>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/alerts"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
            <div className="module-placeholder">
              <h1>Alerts</h1>
              <p>Alerts and Notifications module will be integrated here.</p>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
            <div className="module-placeholder">
              <h1>Reports</h1>
              <p>Reports module will be integrated here.</p>
            </div>
          </ProtectedRoute>
        }
      />

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

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />
    </Routes>
  );
};

export default AppRoutes;