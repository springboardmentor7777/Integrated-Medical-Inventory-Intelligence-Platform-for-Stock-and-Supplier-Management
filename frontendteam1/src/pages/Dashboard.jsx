import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getInventory } from "../services/inventoryService";
import "../styles/Dashboard.css";

function Dashboard() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await getInventory(token);
                setInventory(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Dashboard inventory error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [token]);

    const totalMedicines = inventory.length;

    const totalStock = inventory.reduce(
        (total, item) => total + (item.quantity || 0),
        0
    );

    const lowStock = inventory.filter(
        (item) => item.quantity > 0 && item.quantity <= 30
    ).length;

    const outOfStock = inventory.filter(
        (item) => item.quantity === 0
    ).length;

    const healthyStock = inventory.filter(
        (item) => item.quantity > 30
    ).length;

    const chartData = [...inventory]
        .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
        .slice(0, 6);

    const maxStock = Math.max(
        ...chartData.map((item) => item.quantity || 0),
        1
    );

    return (
        <div className="dashboard-page">

            {/* Animated background */}
            <div className="dashboard-orb orb-one"></div>
            <div className="dashboard-orb orb-two"></div>
            <div className="dashboard-orb orb-three"></div>

            {/* Floating medical icons */}
            <div className="dashboard-floating-icon float-one">💊</div>
            <div className="dashboard-floating-icon float-two">🩺</div>
            <div className="dashboard-floating-icon float-three">💉</div>
            <div className="dashboard-floating-icon float-four">🏥</div>
            <div className="dashboard-floating-icon float-five">📦</div>

            {/* Navbar */}
            <nav className="dashboard-navbar">

                <div className="brand">
                    <div className="small-logo">Ⓜ️</div>
                    <span>MediStock</span>
                </div>

                <div className="navbar-right">

                    <div className="navbar-user">

                        <div className="navbar-avatar">
                            {user?.name
                                ? user.name.charAt(0).toUpperCase()
                                : "U"}
                        </div>

                        <div className="navbar-user-text">
                            <strong>
                                {user?.name || "User"}
                            </strong>

                            <span>
                                {user?.role || "Staff"}
                            </span>
                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </nav>

            <main className="dashboard-content">

                {/* Welcome */}
                <section className="welcome-card">

                    <div className="welcome-content">

                        <div>

                            <p className="welcome-label">
                                MEDISTOCK • USER DASHBOARD
                            </p>

                            <h1>
                                Welcome
                                {user?.name
                                    ? `, ${user.name}`
                                    : ""}! 👋
                            </h1>

                            <p className="welcome-description">
                                Monitor your medical inventory,
                                medicines and suppliers from one
                                intelligent dashboard.
                            </p>

                            {user && (
                                <div className="user-info">

                                    <div className="user-info-item">
                                        <span>EMAIL</span>
                                        <strong>
                                            {user.email}
                                        </strong>
                                    </div>

                                    <div className="user-info-item">
                                        <span>ROLE</span>
                                        <strong>
                                            {user.role}
                                        </strong>
                                    </div>

                                </div>
                            )}

                        </div>

                        <div className="welcome-medical-icon">
                            <div className="pulse-ring"></div>
                            <div className="welcome-icon">
                                🏥
                            </div>
                        </div>

                    </div>

                </section>

                {/* Statistics */}
                <section className="dashboard-stats">

                    <div className="stat-card stat-purple">

                        <div className="stat-icon">💊</div>

                        <div className="stat-info">
                            <span>Total Medicines</span>

                            <strong>
                                {loading ? "..." : totalMedicines}
                            </strong>
                        </div>

                        <div className="stat-decoration">
                            +
                        </div>

                    </div>

                    <div className="stat-card stat-blue">

                        <div className="stat-icon">📦</div>

                        <div className="stat-info">
                            <span>Total Stock</span>

                            <strong>
                                {loading ? "..." : totalStock}
                            </strong>
                        </div>

                        <div className="stat-decoration">
                            ↗
                        </div>

                    </div>

                    <div className="stat-card stat-orange">

                        <div className="stat-icon">⚠️</div>

                        <div className="stat-info">
                            <span>Low Stock</span>

                            <strong>
                                {loading ? "..." : lowStock}
                            </strong>
                        </div>

                        <div className="stat-decoration">
                            !
                        </div>

                    </div>

                    <div className="stat-card stat-green">

                        <div className="stat-icon">✓</div>

                        <div className="stat-info">
                            <span>Healthy Stock</span>

                            <strong>
                                {loading ? "..." : healthyStock}
                            </strong>
                        </div>

                        <div className="stat-decoration">
                            ✓
                        </div>

                    </div>

                </section>

                {/* Analytics */}
                <section className="analytics-grid">

                    {/* Graph */}
                    <div className="analytics-card graph-card">

                        <div className="analytics-header">

                            <div>

                                <p className="analytics-label">
                                    INVENTORY ANALYTICS
                                </p>

                                <h2>
                                    Top Medicine Stock
                                </h2>

                                <p>
                                    Current stock levels from
                                    your inventory.
                                </p>

                            </div>

                            <div className="analytics-icon">
                                📊
                            </div>

                        </div>

                        {loading ? (

                            <div className="graph-loading">
                                <div className="graph-spinner"></div>
                                Loading inventory analytics...
                            </div>

                        ) : chartData.length === 0 ? (

                            <div className="graph-empty">
                                No inventory data available.
                            </div>

                        ) : (

                            <div className="stock-chart">

                                <div className="chart-y-axis">

                                    <span>
                                        {maxStock}
                                    </span>

                                    <span>
                                        {Math.round(maxStock * 0.75)}
                                    </span>

                                    <span>
                                        {Math.round(maxStock * 0.5)}
                                    </span>

                                    <span>
                                        {Math.round(maxStock * 0.25)}
                                    </span>

                                    <span>0</span>

                                </div>

                                <div className="chart-area">

                                    <div className="chart-grid-lines">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>

                                    <div className="bars">

                                        {chartData.map(
                                            (item, index) => {

                                                const medicineName =
                                                    item.medicine?.medicineName ||
                                                    item.medicine?.name ||
                                                    `Medicine ${index + 1}`;

                                                const quantity =
                                                    item.quantity || 0;

                                                const height =
                                                    (quantity / maxStock) *
                                                    100;

                                                return (
                                                    <div
                                                        className="bar-column"
                                                        key={
                                                            item.id ||
                                                            index
                                                        }
                                                    >

                                                        <div className="bar-value">
                                                            {quantity}
                                                        </div>

                                                        <div className="bar-wrapper">

                                                            <div
                                                                className="stock-bar"
                                                                style={{
                                                                    height: `${height}%`,
                                                                    animationDelay:
                                                                        `${index * 0.12}s`,
                                                                }}
                                                            >
                                                                <div className="bar-glow"></div>
                                                            </div>

                                                        </div>

                                                        <span className="bar-label">
                                                            {medicineName.length >
                                                            12
                                                                ? `${medicineName.substring(
                                                                    0,
                                                                    12
                                                                )}...`
                                                                : medicineName}
                                                        </span>

                                                    </div>
                                                );
                                            }
                                        )}

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                    {/* Inventory Health */}
                    <div className="analytics-card health-card">

                        <div className="analytics-header">

                            <div>

                                <p className="analytics-label">
                                    STOCK STATUS
                                </p>

                                <h2>
                                    Inventory Health
                                </h2>

                                <p>
                                    Current stock condition
                                    overview.
                                </p>

                            </div>

                            <div className="analytics-icon">
                                ❤️
                            </div>

                        </div>

                        <div className="health-content">

                            <div className="health-circle">

                                <div className="health-circle-inner">

                                    <strong>
                                        {loading
                                            ? "..."
                                            : totalMedicines}
                                    </strong>

                                    <span>
                                        Medicines
                                    </span>

                                </div>

                            </div>

                            <div className="health-list">

                                <div className="health-item">

                                    <span className="health-dot healthy-dot"></span>

                                    <div>
                                        <strong>
                                            {healthyStock}
                                        </strong>

                                        <span>
                                            Healthy Stock
                                        </span>
                                    </div>

                                </div>

                                <div className="health-item">

                                    <span className="health-dot low-dot"></span>

                                    <div>
                                        <strong>
                                            {lowStock}
                                        </strong>

                                        <span>
                                            Low Stock
                                        </span>
                                    </div>

                                </div>

                                <div className="health-item">

                                    <span className="health-dot out-dot"></span>

                                    <div>
                                        <strong>
                                            {outOfStock}
                                        </strong>

                                        <span>
                                            Out of Stock
                                        </span>
                                    </div>

                                </div>

                            </div>

                        </div>

                        <button
                            className="analytics-action"
                            onClick={() =>
                                navigate("/inventory")
                            }
                        >
                            View Full Inventory
                            <span>→</span>
                        </button>

                    </div>

                </section>

                {/* Quick Access */}
                <div className="section-heading">

                    <div>

                        <p className="section-label">
                            MANAGEMENT
                        </p>

                        <h2 className="section-title">
                            Quick Access
                        </h2>

                    </div>

                    <span className="section-line"></span>

                </div>

                <section className="dashboard-cards">

                    <div
                        className="dashboard-card clickable-card"
                        onClick={() =>
                            navigate("/medicines")
                        }
                    >

                        <div className="card-top">

                            <div className="card-icon">
                                💊
                            </div>

                            <span className="card-arrow">
                                ↗
                            </span>

                        </div>

                        <h3>
                            Medicines
                        </h3>

                        <p>
                            Manage and view medicine
                            records, details and
                            availability.
                        </p>

                        <div className="card-bottom">
                            <span>
                                Open Medicines
                            </span>

                            <span>→</span>
                        </div>

                    </div>

                    <div
                        className="dashboard-card clickable-card"
                        onClick={() =>
                            navigate("/inventory")
                        }
                    >

                        <div className="card-top">

                            <div className="card-icon">
                                📦
                            </div>

                            <span className="card-arrow">
                                ↗
                            </span>

                        </div>

                        <h3>
                            Inventory
                        </h3>

                        <p>
                            Track stock quantities
                            and manage medicine
                            inventory.
                        </p>

                        <div className="card-bottom">
                            <span>
                                Open Inventory
                            </span>

                            <span>→</span>
                        </div>

                    </div>

                    <div
                        className="dashboard-card clickable-card"
                        onClick={() =>
                            navigate("/suppliers")
                        }
                    >

                        <div className="card-top">

                            <div className="card-icon">
                                🚚
                            </div>

                            <span className="card-arrow">
                                ↗
                            </span>

                        </div>

                        <h3>
                            Suppliers
                        </h3>

                        <p>
                            Manage supplier
                            information and
                            medicine supply records.
                        </p>

                        <div className="card-bottom">
                            <span>
                                Open Suppliers
                            </span>

                            <span>→</span>
                        </div>

                    </div>

                    <div
                        className="dashboard-card clickable-card"
                        onClick={() =>
                            navigate("/medicine-search")
                        }
                    >

                        <div className="card-top">

                            <div className="card-icon">
                                🔍
                            </div>

                            <span className="card-arrow">
                                ↗
                            </span>

                        </div>

                        <h3>
                            Medicine Search
                        </h3>

                        <p>
                            Search medicines and
                            filter by category
                            and supplier.
                        </p>

                        <div className="card-bottom">
                            <span>
                                Search Medicines
                            </span>

                            <span>→</span>
                        </div>

                    </div>

                </section>

                {/* System status */}
                <section className="dashboard-footer-card">

                    <div className="system-status">

                        <span className="status-pulse"></span>

                        <div>

                            <strong>
                                System Connected
                            </strong>

                            <span>
                                MediStock inventory
                                services are active
                            </span>

                        </div>

                    </div>

                    <div className="footer-stats">

                        <span>
                            <strong>
                                {totalMedicines}
                            </strong>{" "}
                            Medicines
                        </span>

                        <span>
                            <strong>
                                {totalStock}
                            </strong>{" "}
                            Units
                        </span>

                        <span>
                            <strong>
                                {lowStock}
                            </strong>{" "}
                            Low Stock
                        </span>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;