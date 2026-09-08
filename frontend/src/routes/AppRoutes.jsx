import { Routes, Route, useNavigate } from "react-router-dom";
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


const Login = () => {

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (role) => {

        const userData = {
            userId: 1,
            name: "Test User",
            email: "test@medistock.com",
            role: role,
            token: "temporary-token"
        };

        login(userData);

        if (role === "ADMIN") {
            navigate("/admin");
        }

        if (role === "PHARMACIST") {
            navigate("/medicines");
        }

        if (role === "STAFF") {
            navigate("/staff");
        }
    };

    return (
        <div>

            <h1>Temporary Login</h1>

            <button onClick={() => handleLogin("ADMIN")}>
                Login as Admin
            </button>

            <button onClick={() => handleLogin("PHARMACIST")}>
                Login as Pharmacist
            </button>

            <button onClick={() => handleLogin("STAFF")}>
                Login as Staff
            </button>

        </div>
    );
};


const Register = () => {
    return <h1>Register Page</h1>;
};


const AppRoutes = () => {

    return (
        <Routes>

            {/* Home */}
            <Route
                path="/"
                element={<Login />}
            />

            {/* Login */}
            <Route
                path="/login"
                element={<Login />}
            />

            {/* Register */}
            <Route
                path="/register"
                element={<Register />}
            />

            {/* Admin Dashboard */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Medicine Dashboard */}
            <Route
                path="/medicines"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
                        <MedicineDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Add Medicine */}
            <Route
                path="/add-medicine"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
                        <AddMedicine />
                    </ProtectedRoute>
                }
            />

            {/* Edit Medicine */}
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
                    <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
                        <Inventory />
                    </ProtectedRoute>
                }
            />

            {/* Pharmacist Dashboard */}
            <Route
                path="/pharmacist"
                element={
                    <ProtectedRoute allowedRoles={["PHARMACIST"]}>
                        <PharmacistDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Staff Dashboard */}
            <Route
                path="/staff"
                element={
                    <ProtectedRoute allowedRoles={["STAFF"]}>
                        <StaffDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Unauthorized */}
            <Route
                path="/unauthorized"
                element={<Unauthorized />}
            />

        </Routes>
    );
};


export default AppRoutes;