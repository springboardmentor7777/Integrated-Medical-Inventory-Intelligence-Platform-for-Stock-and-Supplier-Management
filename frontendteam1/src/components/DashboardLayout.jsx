import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/DashboardLayout.css";

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      icon: "🏠",
      path: "/dashboard",
    },
    {
      name: "Analytics",
      icon: "📊",
      path: "/analytics",
    },
    {
      name: "Inventory Intelligence",
      icon: "🧠",
      path: "/inventory-intelligence",
    },
    {
      name: "Medicines",
      icon: "💊",
      path: "/medicines",
    },
    {
      name: "Inventory",
      icon: "📦",
      path: "/inventory",
    },
    {
      name: "Suppliers",
      icon: "🚚",
      path: "/suppliers",
    },
    {
      name: "Medicine Search",
      icon: "🔍",
      path: "/medicine-search",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
      <div className="dashboard-layout-page">

        {/* Background decorations */}
        <div className="layout-orb layout-orb-one"></div>
        <div className="layout-orb layout-orb-two"></div>
        <div className="layout-orb layout-orb-three"></div>

        {/* ================= NAVBAR ================= */}
        <nav className="layout-navbar">

          <div className="layout-brand">
            <div className="layout-logo">Ⓜ</div>
            <span>MediStock</span>
          </div>

          <div className="layout-navbar-right">

            <div className="layout-user">

              <div className="layout-avatar">
                {user?.name
                    ? user.name.charAt(0).toUpperCase()
                    : "U"}
              </div>

              <div className="layout-user-text">
                <strong>
                  {user?.name || "User"}
                </strong>

                <span>
                                {user?.role || "Staff"}
                            </span>
              </div>

            </div>

            <button
                className="layout-logout"
                onClick={handleLogout}
            >
              <span>↪</span>
              Logout
            </button>

          </div>

        </nav>

        {/* ================= BODY ================= */}
        <div className="layout-body">

          {/* ================= SIDEBAR ================= */}
          <aside className="layout-sidebar">

            <div className="layout-sidebar-header">
              <p>MEDISTOCK</p>
              <h2>Modules</h2>
            </div>

            <nav className="layout-menu">

              {menuItems.map((item) => (
                  <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                          isActive
                              ? "layout-menu-item active"
                              : "layout-menu-item"
                      }
                  >
                                <span className="layout-menu-icon">
                                    {item.icon}
                                </span>

                    <span className="layout-menu-text">
                                    {item.name}
                                </span>

                    <span className="layout-menu-arrow">
                                    →
                                </span>
                  </NavLink>
              ))}

            </nav>

            {/* ================= STATUS ================= */}
            <div className="layout-sidebar-status">

              <span className="layout-status-dot"></span>

              <div>
                <strong>System Online</strong>
                <span>
                                Inventory services active
                            </span>
              </div>

            </div>

          </aside>

          {/* ================= PAGE CONTENT ================= */}
          <main className="layout-main-content">
            <Outlet />
          </main>

        </div>

      </div>
  );
}

export default DashboardLayout;