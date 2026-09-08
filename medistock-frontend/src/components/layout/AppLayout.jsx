import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const TITLES = {
  "/app": "Dashboard",
  "/app/medicines": "Medicine Inventory",
  "/app/stock-alerts": "Stock Alerts",
  "/app/expiry": "Expiry Tracking",
  "/app/suppliers": "Suppliers",
  "/app/reports": "Reports & Export",
  "/app/notifications": "Notifications",
  "/app/users": "Users & Roles",
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || "MediStock";

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
