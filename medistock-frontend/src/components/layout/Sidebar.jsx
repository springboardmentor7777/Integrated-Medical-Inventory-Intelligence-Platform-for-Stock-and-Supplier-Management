import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  Truck,
  CalendarClock,
  BellRing,
  FileBarChart,
  Users,
  PackageSearch,
  Cross,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true, roles: ["Admin", "Pharmacist", "Staff"] },
  { to: "/app/medicines", label: "Medicine Inventory", icon: Pill, roles: ["Admin", "Pharmacist", "Staff"] },
  { to: "/app/stock-alerts", label: "Stock Alerts", icon: PackageSearch, roles: ["Admin", "Pharmacist", "Staff"] },
  { to: "/app/expiry", label: "Expiry Tracking", icon: CalendarClock, roles: ["Admin", "Pharmacist", "Staff"] },
  { to: "/app/suppliers", label: "Suppliers", icon: Truck, roles: ["Admin", "Pharmacist"] },
  { to: "/app/reports", label: "Reports & Export", icon: FileBarChart, roles: ["Admin", "Pharmacist"] },
  { to: "/app/notifications", label: "Notifications", icon: BellRing, roles: ["Admin", "Pharmacist", "Staff"] },
  { to: "/app/users", label: "Users & Roles", icon: Users, roles: ["Admin"] },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface md:flex">
      <div className="flex items-center gap-2 border-b border-line px-5 py-5">
        <span className="grid h-8 w-8 place-items-center rounded bg-primary text-white">
          <Cross size={16} strokeWidth={2.5} />
        </span>
        <div>
          <p className="font-display text-sm font-semibold leading-none text-ink">MediStock</p>
          <p className="mt-1 text-[11px] leading-none text-muted">Inventory Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.filter((item) => item.roles.includes(user?.role)).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `focus-ring flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-muted hover:bg-bg hover:text-ink"
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line px-4 py-3">
        <p className="text-[11px] text-muted">MediStock v1.0 · Frontend Build</p>
      </div>
    </aside>
  );
}
