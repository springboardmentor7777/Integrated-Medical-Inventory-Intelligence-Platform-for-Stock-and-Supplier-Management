import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  Package,
  Truck,
  Clock3,
  Bell,
  BarChart3,
} from "lucide-react";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-logo">
          <h2>MediStock</h2>
          <p>Medical Inventory</p>
        </div>

        <nav className="app-sidebar-nav">
          <NavLink to="/dashboard">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/medicines">
            <Pill size={20} />
            <span>Medicines</span>
          </NavLink>

          <NavLink to="/inventory">
            <Package size={20} />
            <span>Inventory</span>
          </NavLink>

          <NavLink to="/suppliers">
            <Truck size={20} />
            <span>Supplier Management</span>
          </NavLink>

          <NavLink to="/expiry-analytics">
            <Clock3 size={20} />
            <span>Expiry & Analytics</span>
          </NavLink>

          <NavLink to="/alerts">
            <Bell size={20} />
            <span>Alerts</span>
          </NavLink>

          <NavLink to="/reports">
            <BarChart3 size={20} />
            <span>Reports</span>
          </NavLink>
        </nav>
      </aside>

      <main className="app-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;