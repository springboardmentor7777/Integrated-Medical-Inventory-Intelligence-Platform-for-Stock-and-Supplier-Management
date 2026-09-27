import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Bell,
  Search,
  PackageX,
  Clock,
  X,
} from "lucide-react";

/**
 * ============================================================================
 * INVENTORY INTELLIGENCE DASHBOARD
 * ----------------------------------------------------------------------------
 * Covers: Expiry Tracking, Low Stock alerts, and a Notification panel,
 * wired to your backend APIs.
 *
 * INTEGRATION — this is the only section you should need to edit:
 *   1. Set API_CONFIG.baseUrl / endpoints to match your routes.
 *   2. Set AUTH_HEADER_FN if your API needs a bearer token.
 *   3. Drop <InventoryIntelligenceDashboard /> anywhere in your app tree.
 *
 * Expected API shapes are documented above each fetch function below.
 * If a request fails, the dashboard falls back to demo data and shows
 * a small "offline / demo data" notice, so the UI is always presentable.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1. CONFIG — edit this block to match your backend
// ---------------------------------------------------------------------------
const API_CONFIG = {
  baseUrl: "/api", // e.g. "https://your-backend.com/api"
  endpoints: {
    expiry: "/inventory/expiry", // GET -> { expired, expiringSoon, valid, items: [...] }
    lowStock: "/inventory/low-stock", // GET -> { items: [...] }
    notifications: "/notifications", // GET -> { items: [...] }
    markNotificationRead: (id) => `/notifications/${id}/read`, // PATCH
  },
};

// Return extra headers (e.g. auth) merged into every request. Customize as needed.
function AUTH_HEADER_FN() {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGet(path) {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...AUTH_HEADER_FN() },
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER_FN() },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// 2. DEMO DATA — used only when the API call fails, so the UI never breaks
// ---------------------------------------------------------------------------
const DEMO_MEDICINES = [
  { id: "m1", name: "Amoxicillin 500mg", batch: "AX-2291", category: "Antibiotic", stock: 120, reorderLevel: 50, expiryDate: "2026-10-02", status: "expiring_soon" },
  { id: "m2", name: "Paracetamol 650mg", batch: "PC-1187", category: "Analgesic", stock: 340, reorderLevel: 100, expiryDate: "2027-05-14", status: "valid" },
  { id: "m3", name: "Insulin Glargine", batch: "IG-0043", category: "Hormone", stock: 18, reorderLevel: 25, expiryDate: "2026-09-30", status: "expiring_soon" },
  { id: "m4", name: "Metformin 500mg", batch: "MF-3321", category: "Antidiabetic", stock: 8, reorderLevel: 40, expiryDate: "2026-08-11", status: "expired" },
  { id: "m5", name: "Cetirizine 10mg", batch: "CT-7754", category: "Antihistamine", stock: 210, reorderLevel: 60, expiryDate: "2027-01-20", status: "valid" },
  { id: "m6", name: "Azithromycin 250mg", batch: "AZ-4420", category: "Antibiotic", stock: 5, reorderLevel: 30, expiryDate: "2026-07-19", status: "expired" },
  { id: "m7", name: "Ibuprofen 400mg", batch: "IB-9012", category: "Analgesic", stock: 275, reorderLevel: 80, expiryDate: "2027-03-02", status: "valid" },
  { id: "m8", name: "Salbutamol Inhaler", batch: "SB-5567", category: "Respiratory", stock: 12, reorderLevel: 20, expiryDate: "2026-10-15", status: "expiring_soon" },
];

const DEMO_NOTIFICATIONS = [
  { id: "n1", type: "expired", message: "Metformin 500mg (batch MF-3321) has expired.", timestamp: "2026-09-25T06:12:00Z", read: false },
  { id: "n2", type: "low_stock", message: "Insulin Glargine is below reorder level (18/25).", timestamp: "2026-09-24T14:03:00Z", read: false },
  { id: "n3", type: "expiring_soon", message: "Salbutamol Inhaler expires in 20 days.", timestamp: "2026-09-23T09:40:00Z", read: true },
  { id: "n4", type: "low_stock", message: "Azithromycin 250mg is critically low (5 units).", timestamp: "2026-09-22T11:15:00Z", read: false },
];

// ---------------------------------------------------------------------------
// 3. DATA LAYER — fetch + derive expiry status client-side as a safety net
// ---------------------------------------------------------------------------
function daysUntil(dateStr) {
  const today = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function deriveStatus(dateStr, soonWindowDays = 30) {
  const d = daysUntil(dateStr);
  if (d < 0) return "expired";
  if (d <= soonWindowDays) return "expiring_soon";
  return "valid";
}

function useInventoryData() {
  const [medicines, setMedicines] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [expiryRes, lowStockRes, notifRes] = await Promise.all([
        apiGet(API_CONFIG.endpoints.expiry),
        apiGet(API_CONFIG.endpoints.lowStock),
        apiGet(API_CONFIG.endpoints.notifications),
      ]);

      // Merge expiry + low-stock item lists by id, since the two endpoints
      // may return overlapping medicines with different fields populated.
      const byId = new Map();
      (expiryRes.items || []).forEach((item) =>
        byId.set(item.id, { ...item, status: item.status || deriveStatus(item.expiryDate) })
      );
      (lowStockRes.items || []).forEach((item) => {
        const existing = byId.get(item.id) || {};
        byId.set(item.id, { ...existing, ...item, status: existing.status || deriveStatus(item.expiryDate) });
      });

      setMedicines(Array.from(byId.values()));
      setNotifications(notifRes.items || []);
      setUsingDemoData(false);
    } catch (err) {
      console.warn("Inventory API unavailable, showing demo data:", err.message);
      setMedicines(DEMO_MEDICINES.map((m) => ({ ...m, status: m.status || deriveStatus(m.expiryDate) })));
      setNotifications(DEMO_NOTIFICATIONS);
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markNotificationRead = useCallback(
    async (id) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (!usingDemoData) {
        try {
          await apiPatch(API_CONFIG.endpoints.markNotificationRead(id));
        } catch (err) {
          console.warn("Failed to persist notification read state:", err.message);
        }
      }
    },
    [usingDemoData]
  );

  return { medicines, notifications, loading, usingDemoData, reload: load, markNotificationRead };
}

// ---------------------------------------------------------------------------
// 4. UI PRIMITIVES
// ---------------------------------------------------------------------------
const STATUS_META = {
  expired: { label: "Expired", color: "#B3261E", bg: "#FDECEA", icon: AlertCircle },
  expiring_soon: { label: "Expiring Soon", color: "#95600A", bg: "#FFF4DE", icon: AlertTriangle },
  valid: { label: "Valid", color: "#1B7A4C", bg: "#E9F7EF", icon: CheckCircle2 },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.valid;
  const Icon = meta.icon;
  return (
    <span
      style={{ color: meta.color, backgroundColor: meta.bg }}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    >
      <Icon size={13} strokeWidth={2.5} />
      {meta.label}
    </span>
  );
}

function StatCard({ label, value, color, Icon }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums" style={{ color }}>
          {value}
        </p>
      </div>
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}1A` }}
      >
        <Icon size={20} color={color} strokeWidth={2.25} />
      </div>
    </div>
  );
}

function NotificationPanel({ notifications, onMarkRead, open, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  const typeIcon = { expired: AlertCircle, low_stock: PackageX, expiring_soon: AlertTriangle };
  const typeColor = { expired: "#B3261E", low_stock: "#7C4A03", expiring_soon: "#95600A" };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 z-20 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">You're all caught up.</p>
        ) : (
          notifications.map((n) => {
            const Icon = typeIcon[n.type] || Bell;
            return (
              <button
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                  n.read ? "opacity-60" : ""
                }`}
              >
                <Icon size={16} color={typeColor[n.type] || "#64748B"} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-700">{n.message}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {new Date(n.timestamp).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!n.read && <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-500" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function LowStockCard({ item }) {
  const pct = Math.min(100, Math.round((item.stock / Math.max(item.reorderLevel, 1)) * 100));
  const critical = item.stock <= item.reorderLevel * 0.4;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{item.name}</p>
          <p className="text-xs text-slate-400">Batch {item.batch}</p>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color: critical ? "#B3261E" : "#95600A",
            backgroundColor: critical ? "#FDECEA" : "#FFF4DE",
          }}
        >
          {critical ? "Critical" : "Low"}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          {item.stock} in stock <span className="text-slate-300">/</span> reorder at {item.reorderLevel}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: critical ? "#B3261E" : "#E0A415" }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. MAIN DASHBOARD
// ---------------------------------------------------------------------------
export default function InventoryIntelligenceDashboard() {
  const { medicines, notifications, loading, usingDemoData, markNotificationRead } = useInventoryData();
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(medicines.map((m) => m.category))).sort()],
    [medicines]
  );

  const counts = useMemo(
    () => ({
      expired: medicines.filter((m) => m.status === "expired").length,
      expiring_soon: medicines.filter((m) => m.status === "expiring_soon").length,
      valid: medicines.filter((m) => m.status === "valid").length,
    }),
    [medicines]
  );

  const lowStockItems = useMemo(
    () => medicines.filter((m) => m.stock <= m.reorderLevel).sort((a, b) => a.stock - b.stock),
    [medicines]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((m) => (statusFilter === "all" ? true : m.status === statusFilter))
      .filter((m) => (categoryFilter === "all" ? true : m.category === categoryFilter))
      .filter((m) =>
        search.trim() === ""
          ? true
          : `${m.name} ${m.batch} ${m.category}`.toLowerCase().includes(search.trim().toLowerCase())
      )
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [medicines, statusFilter, categoryFilter, search]);

  return (
    <div className="min-h-full w-full bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Inventory Intelligence</h1>
          <p className="text-sm text-slate-500">Expiry tracking and stock alerts, live from inventory.</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel
            notifications={notifications}
            onMarkRead={markNotificationRead}
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
          />
        </div>
      </div>

      {usingDemoData && !loading && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Couldn't reach the inventory API — showing demo data. Check API_CONFIG at the top of this file.
        </div>
      )}

      {/* Expiry Overview */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Expiry Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Expired" value={loading ? "—" : counts.expired} color="#B3261E" Icon={AlertCircle} />
          <StatCard label="Expiring Soon" value={loading ? "—" : counts.expiring_soon} color="#95600A" Icon={AlertTriangle} />
          <StatCard label="Valid" value={loading ? "—" : counts.valid} color="#1B7A4C" Icon={CheckCircle2} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Medicine list with filters/search */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Medicines</h2>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, batch, category"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 sm:w-56"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="expired">Expired</option>
                <option value="expiring_soon">Expiring soon</option>
                <option value="valid">Valid</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All categories" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Medicine</th>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Expiry</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Loading inventory…
                    </td>
                  </tr>
                ) : filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No medicines match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((m) => (
                    <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                      <td className="px-4 py-3 text-slate-500">{m.batch}</td>
                      <td className="px-4 py-3 text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          {new Date(m.expiryDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{m.stock}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={m.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock section */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Low Stock ({loading ? "…" : lowStockItems.length})
          </h2>
          <div className="flex flex-col gap-3">
            {loading ? (
              <p className="text-sm text-slate-400">Loading…</p>
            ) : lowStockItems.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-400 shadow-sm">
                All medicines are above their reorder level.
              </div>
            ) : (
              lowStockItems.map((item) => <LowStockCard key={item.id} item={item} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
