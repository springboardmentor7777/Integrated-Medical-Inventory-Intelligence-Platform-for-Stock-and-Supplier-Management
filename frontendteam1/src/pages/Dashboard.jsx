import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">

      <nav className="dashboard-navbar">
        <div className="brand">
          <div className="small-logo">M</div>
          <span>MediStock</span>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>

      <main className="dashboard-content">

        <section className="welcome-card">
          <p className="welcome-label">DASHBOARD</p>

          <h1>
            Welcome{user?.name ? `, ${user.name}` : ""}! 👋
          </h1>

          <p>
            Welcome to your MediStock dashboard.
            Manage your medical inventory efficiently.
          </p>

          {user && (
            <div className="user-info">
              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>

              <div>
                <span>Role</span>
                <strong>{user.role}</strong>
              </div>
            </div>
          )}
        </section>

        <h2 className="section-title">Quick Access</h2>

        <section className="dashboard-cards">

          <div className="dashboard-card">
            <div className="card-icon">💊</div>
            <h3>Medicines</h3>
            <p>Manage and view medicines.</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📦</div>
            <h3>Inventory</h3>
            <p>Track your medicine stock.</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🚚</div>
            <h3>Suppliers</h3>
            <p>Manage your suppliers.</p>
          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;