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

import NotificationBell from "./notifications/NotificationBell";
import NotificationPopup from "./notifications/NotificationPopup";
import { useAuth } from "../context/useAuth";

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  const userName = user?.name || user?.email || "User";

  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  };

  const roleLabel =
    user?.role === "ADMIN"
      ? "ADMIN"
      : user?.role === "PHARMACIST"
        ? "PHARMACIST"
        : "STAFF";

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium no-underline transition ${
      isActive
        ? "bg-[#456c60] text-white shadow-sm"
        : "text-stone-600 hover:bg-[#edf4f1] hover:text-[#456c60]"
    }`;

  return (
    <div className="min-h-screen bg-[#fafaf8]">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-stone-200 bg-white px-4 py-6 md:block">

        {/* Logo */}
        <div className="mb-6 border-b border-stone-200 px-3 pb-6">
          <h2 className="m-0 text-2xl font-bold text-[#456c60]">
            MediStock
          </h2>

          <p className="mt-1 text-xs font-medium text-stone-400">
            Medical Inventory
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">

          <NavLink to="/dashboard" className={navClass}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/medicines" className={navClass}>
            <Pill size={20} />
            <span>Medicines</span>
          </NavLink>

          <NavLink to="/inventory" className={navClass}>
            <Package size={20} />
            <span>Inventory</span>
          </NavLink>

          <NavLink to="/suppliers" className={navClass}>
            <Truck size={20} />
            <span>Supplier Management</span>
          </NavLink>

          <NavLink to="/expiry-analytics" className={navClass}>
            <Clock3 size={20} />
            <span>Expiry & Analytics</span>
          </NavLink>

          <NavLink to="/alerts" className={navClass}>
            <Bell size={20} />
            <span>Alerts</span>
          </NavLink>

          <NavLink to="/reports" className={navClass}>
            <BarChart3 size={20} />
            <span>Reports</span>
          </NavLink>

        </nav>
      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}
      <div className="min-h-screen md:ml-64">

        {/* ===================================================
            TOP HEADER
        =================================================== */}
        <header className="sticky top-0 z-30 h-16 border-b border-stone-200/70 bg-[#fafaf8]/95 backdrop-blur">

          <div className="flex h-full items-center justify-between px-6 sm:px-8 lg:px-10">

            {/* Brand */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                MediStock
              </p>

              <p className="text-sm font-medium text-stone-700">
                Clinical Inventory System
              </p>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Profile */}
              <div className="flex items-center gap-2 border-l border-stone-200 pl-3">

                {/* Avatar */}
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#edf4f1] text-xs font-bold text-[#456c60]">
                  {getInitials(userName)}
                </div>

                {/* User details */}
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-stone-800">
                    {userName}
                  </p>

                  <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                    {roleLabel}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}
        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">

          {/* Notification popup */}
          <NotificationPopup />

          {children ?? <Outlet />}

        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
