import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  PackageX,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

const initialAlerts = [
  {
    id: 1,
    type: "Low Stock",
    title: "Paracetamol stock is low",
    message: "Current quantity is below the configured reorder level.",
    medicine: "Paracetamol 500mg",
    quantity: 18,
    createdAt: "Today, 10:15 AM",
    read: false,
  },
  {
    id: 2,
    type: "Expiry",
    title: "Medicine expiring soon",
    message: "This medicine is within the expiry warning period.",
    medicine: "Amoxicillin 250mg",
    quantity: 42,
    createdAt: "Today, 09:30 AM",
    read: false,
  },
  {
    id: 3,
    type: "Expired",
    title: "Expired medicine requires attention",
    message: "Please review the expired batch and remove it from available stock.",
    medicine: "Cetirizine 10mg",
    quantity: 12,
    createdAt: "Yesterday, 04:20 PM",
    read: true,
  },
];

const alertStyles = {
  "Low Stock": {
    icon: PackageX,
    badge: "bg-amber-50 text-amber-700",
    iconBox: "bg-amber-50 text-amber-600",
  },
  Expiry: {
    icon: Clock3,
    badge: "bg-blue-50 text-blue-700",
    iconBox: "bg-blue-50 text-blue-600",
  },
  Expired: {
    icon: XCircle,
    badge: "bg-red-50 text-red-700",
    iconBox: "bg-red-50 text-red-600",
  },
};

const Alerts = () => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const unreadCount = alerts.filter((alert) => !alert.read).length;

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesType = filter === "All" || alert.type === filter;
      const matchesSearch =
        !query ||
        alert.title.toLowerCase().includes(query) ||
        alert.medicine.toLowerCase().includes(query) ||
        alert.message.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [alerts, filter, search]);

  const markRead = (id) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  };

  const markAllRead = () => {
    setAlerts((current) => current.map((alert) => ({ ...alert, read: true })));
  };

  const removeAlert = (id) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
            MEDISTOCK MODULE
          </p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Alerts & Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Review low-stock, expiry and expired-medicine alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check size={17} />
          Mark all as read
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Bell size={21} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Alerts</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{alerts.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={21} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Unread</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Read</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {alerts.length - unreadCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search alerts or medicines..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option>All</option>
            <option>Low Stock</option>
            <option>Expiry</option>
            <option>Expired</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <CheckCircle2 className="mx-auto text-emerald-500" size={38} />
            <h2 className="mt-3 text-lg font-bold text-slate-900">No alerts found</h2>
            <p className="mt-1 text-sm text-slate-500">
              There are no alerts matching your current filters.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = alertStyles[alert.type] || alertStyles.Expiry;
            const Icon = style.icon;

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                  alert.read ? "border-slate-200" : "border-blue-200 bg-blue-50/30"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${style.iconBox}`}>
                    <Icon size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{alert.title}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${style.badge}`}>
                        {alert.type}
                      </span>
                      {!alert.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" title="Unread" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      <span><strong className="text-slate-700">Medicine:</strong> {alert.medicine}</span>
                      <span><strong className="text-slate-700">Quantity:</strong> {alert.quantity}</span>
                      <span>{alert.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {!alert.read && (
                      <button
                        type="button"
                        onClick={() => markRead(alert.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Check size={15} />
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAlert(alert.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      title="Dismiss alert"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Alerts;
