import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (user?.role?.toUpperCase() !== "ADMIN") {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="admin-dashboard-page">

            <div className="admin-dashboard-header">
                <div>
                    <p className="admin-label">MEDISTOCK ADMIN</p>
                    <h1>Admin Dashboard</h1>
                    <p className="admin-subtitle">
                        Manage the MediStock system and monitor operations.
                    </p>
                </div>

                <div className="admin-user-info">
                    <strong>{user?.name || "Administrator"}</strong>
                    <span>ADMIN</span>
                </div>
            </div>

            <div className="admin-dashboard-grid">

                <div
                    className="admin-dashboard-card"
                    onClick={() => navigate("/medicines")}
                >
                    <div className="admin-card-icon">💊</div>
                    <h2>Medicines</h2>
                    <p>Manage medicines and medicine records.</p>
                </div>

                <div
                    className="admin-dashboard-card"
                    onClick={() => navigate("/inventory")}
                >
                    <div className="admin-card-icon">📦</div>
                    <h2>Inventory</h2>
                    <p>Monitor and manage medicine stock.</p>
                </div>

                <div
                    className="admin-dashboard-card"
                    onClick={() => navigate("/suppliers")}
                >
                    <div className="admin-card-icon">🚚</div>
                    <h2>Suppliers</h2>
                    <p>Manage supplier information and records.</p>
                </div>
                <div
                    className="admin-dashboard-card"
                    onClick={() => navigate("/medicine-search")}
                >
                    <div className="admin-card-icon">🔎</div>
                    <h2>Medicine Search</h2>
                    <p>Search and filter medicines by category and supplier.</p>
                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;