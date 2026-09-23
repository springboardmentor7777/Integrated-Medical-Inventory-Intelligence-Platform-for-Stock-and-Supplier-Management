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

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-slate-800 bg-slate-900 px-4 py-6 md:block">
        <div className="mb-5 border-b border-slate-800 px-3 pb-6">
          <h2 className="m-0 text-2xl font-bold text-blue-400">
            MediStock
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Medical Inventory
          </p>
        </div>

        <nav className="flex flex-col gap-1.5">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium no-underline transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/medicines"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium no-underline transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Pill size={20} />
            <span>Medicines</span>
          </NavLink>

          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium no-underline transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Package size={20} />
            <span>Inventory</span>
          </NavLink>

          <NavLink
            to="/suppliers"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium no-underline transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Truck size={20} />
            <span>Supplier Management</span>
          </NavLink>

          <NavLink
            to="/expiry-analytics"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium no-underline transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Clock3 size={20} />
            <span>Expiry & Analytics</span>
          </NavLink>

          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium no-underline transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Bell size={20} />
            <span>Alerts</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium no-underline transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <BarChart3 size={20} />
            <span>Reports</span>
          </NavLink>
        </nav>
      </aside>

      <main className="min-h-screen w-full px-4 py-6 md:ml-64 md:w-[calc(100%-16rem)] md:px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;