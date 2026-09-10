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

const API_URL = "http://localhost:8082/api";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid email or password."
                );
            }

            login(data);

            if (data.role === "ADMIN") {
                navigate("/admin");
            } else if (data.role === "PHARMACIST") {
                navigate("/medicines");
            } else if (data.role === "STAFF") {
                navigate("/staff");
            } else {
                navigate("/unauthorized");
            }

        } catch (error) {
            console.error("Login error:", error);

            setError(
                error.message ||
                "Login failed. Please check the backend."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <h1>MedStock</h1>
                <p>Medical Inventory Management</p>

                <h2>Login</h2>

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="error-message">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

            </div>
        </div>
    );
};


const Register = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("PHARMACIST");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e) => {

        e.preventDefault();

        setError("");

        if (!name || !email || !password || !role) {
            setError("Please fill all fields.");
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        role: role
                    })
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(
                    data || "Registration failed."
                );
            }

            alert(
                "Registration successful. Please login."
            );

            navigate("/login");

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            setError(
                error.message ||
                "Registration failed. Please check the backend."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <h1>MedStock</h1>
                <p>Medical Inventory Management</p>

                <h2>Register</h2>

                <form onSubmit={handleRegister}>

                    <div className="form-group">
                        <label>Name</label>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Role</label>

                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="PHARMACIST">
                                Pharmacist
                            </option>

                            <option value="STAFF">
                                Staff
                            </option>

                            <option value="ADMIN">
                                Admin
                            </option>
                        </select>
                    </div>

                    {error && (
                        <p className="error-message">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Register"}
                    </button>

                </form>

            </div>
        </div>
    );
};


const AppRoutes = () => {
    return (
        <Routes>

            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/medicines"
                element={
                    <ProtectedRoute
                        allowedRoles={["ADMIN", "PHARMACIST"]}
                    >
                        <MedicineDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/add-medicine"
                element={
                    <ProtectedRoute
                        allowedRoles={["ADMIN", "PHARMACIST"]}
                    >
                        <AddMedicine />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/edit-medicine"
                element={
                    <ProtectedRoute
                        allowedRoles={["ADMIN", "PHARMACIST"]}
                    >
                        <EditMedicine />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/inventory"
                element={
                    <ProtectedRoute
                        allowedRoles={["ADMIN", "PHARMACIST"]}
                    >
                        <Inventory />
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