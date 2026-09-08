// import React from "react";
import { useAuth } from "../context/useAuth";
import { 
  Activity, 
  ShieldCheck, 
  Users, 
  // Package, 
  Truck, 
  AlertTriangle, 
  LogOut, 
  Plus, 
  FileText, 
  TrendingUp, 
  Bell,
  LayoutDashboard,
  Pill,
  Boxes,
  ShoppingCart,
  BarChart3,
  CheckCircle2,
  // Clock,
  AlertCircle
} from "lucide-react";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      {/* Blue Sidebar Navigation */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <span className="sidebar-brand-title">Medi<span>Stock</span></span>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-item active">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </a>
          <a href="#medicines" className="nav-item">
            <Pill size={18} />
            <span>Medicines</span>
          </a>
          <a href="#inventory" className="nav-item">
            <Boxes size={18} />
            <span>Inventory</span>
          </a>
          <a href="#suppliers" className="nav-item">
            <Truck size={18} />
            <span>Suppliers</span>
          </a>
          <a href="#orders" className="nav-item">
            <ShoppingCart size={18} />
            <span>Orders</span>
          </a>
          <a href="#reports" className="nav-item">
            <BarChart3 size={18} />
            <span>Reports</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <span className="role-badge-sidebar">ADMINISTRATOR</span>
        </div>
      </aside>

      {/* Main Content Area with Header */}
      <div className="app-content">
        {/* White Header Bar */}
        <header className="app-header">
          <div className="header-title-box">
            <h2 className="header-page-title">Executive Command Center</h2>
          </div>

          <div className="header-actions">
            <button className="icon-btn-header" title="Notifications">
              <Bell size={18} />
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile-header">
              <div className="avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="profile-details">
                <span className="profile-name">{user?.name || 'Admin User'}</span>
                <span className="profile-role">{user?.email || 'admin@medistock.com'}</span>
              </div>
            </div>

            <button onClick={logout} className="btn-header-logout" title="Sign Out">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Off-White Main Content Body */}
        <main className="main-content">
          {/* Welcome Banner */}
          <div className="welcome-banner">
            <div>
              <h1 className="welcome-title">Welcome to MediStock</h1>
              <p className="welcome-subtitle">
                Centralized healthcare inventory monitoring, pharmaceutical stock tracking, and supplier operations.
              </p>
            </div>
            <div className="pill-teal">
              <ShieldCheck size={16} />
              <span>Full System Admin Permissions</span>
            </div>
          </div>

          {/* Metric KPI Cards (White Background) */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Total Medicines</span>
                <div className="kpi-icon-box icon-blue">
                  <Pill size={20} />
                </div>
              </div>
              <div className="kpi-value">1,482</div>
              <div className="kpi-subtext green">
                <TrendingUp size={14} />
                <span>+24 added this month</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">In Stock Batches</span>
                <div className="kpi-icon-box icon-teal">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="kpi-value">1,240</div>
              <div className="kpi-subtext green">
                <span className="status-badge status-in-stock">🟢 In Stock</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Low Stock Alert</span>
                <div className="kpi-icon-box icon-amber">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="kpi-value">17</div>
              <div className="kpi-subtext amber">
                <span className="status-badge status-low-stock">🟡 Reorder Point</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Expiring Soon</span>
                <div className="kpi-icon-box icon-red">
                  <AlertCircle size={20} />
                </div>
              </div>
              <div className="kpi-value">5</div>
              <div className="kpi-subtext">
                <span className="status-badge status-expiring">🟠 Expiring &lt; 30 Days</span>
              </div>
            </div>
          </div>

          {/* Action Panels & Activity Stack */}
          <div className="content-grid-two">
            <div className="card-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Admin Quick Tools</h3>
                  <p className="panel-subtitle">Manage pharmaceutical stock and system users</p>
                </div>
              </div>
              <div className="actions-grid">
                <button className="action-card-btn">
                  <div className="action-icon icon-blue">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h4>Add Medicine</h4>
                    <p>Register new drug batch</p>
                  </div>
                </button>

                <button className="action-card-btn">
                  <div className="action-icon icon-teal">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4>Manage Staff</h4>
                    <p>Assign user permissions</p>
                  </div>
                </button>

                <button className="action-card-btn">
                  <div className="action-icon icon-amber">
                    <Truck size={18} />
                  </div>
                  <div>
                    <h4>Suppliers</h4>
                    <p>Vendor supply contracts</p>
                  </div>
                </button>

                <button className="action-card-btn">
                  <div className="action-icon icon-blue">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4>Stock Reports</h4>
                    <p>Export ledger history</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="card-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Stock Status Ledger</h3>
                  <p className="panel-subtitle">Real-time inventory status overview</p>
                </div>
              </div>
              <div className="activity-stack">
                <div className="activity-row">
                  <div className="activity-dot green"></div>
                  <div className="activity-text">
                    <p><strong>Amoxicillin 500mg:</strong> 500 units received in Main Storage Bay</p>
                    <span>10 mins ago • Status: <span className="status-badge status-in-stock">🟢 In Stock</span></span>
                  </div>
                </div>

                <div className="activity-row">
                  <div className="activity-dot amber"></div>
                  <div className="activity-text">
                    <p><strong>Paracetamol 650mg:</strong> Stock dropped below threshold (45 units left)</p>
                    <span>1 hour ago • Status: <span className="status-badge status-low-stock">🟡 Low Stock</span></span>
                  </div>
                </div>

                <div className="activity-row">
                  <div className="activity-dot"></div>
                  <div className="activity-text">
                    <p><strong>Insulin Glargine:</strong> 12 vials expiring in 14 days</p>
                    <span>3 hours ago • Status: <span className="status-badge status-expiring">🟠 Expiring Soon</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;