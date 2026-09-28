import React, { useEffect, useMemo, useState } from 'react';
import { Download, Package, AlertTriangle, CalendarClock, Truck } from 'lucide-react';
import ClinicalMetricCard from '../components/ClinicalMetricCard';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationPopup from '../components/notifications/NotificationPopup';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const results = await Promise.allSettled([
          api.get('/api/medicines'),
          api.get('/api/inventory'),
          api.get('/api/suppliers'),
          api.get('/api/alerts'),
        ]);

        const [medicinesResult, inventoryResult, suppliersResult, alertsResult] =
          results;

        if (medicinesResult.status === 'fulfilled') {
          const data = medicinesResult.value.data;
          setMedicines(Array.isArray(data) ? data : []);
        }

        if (inventoryResult.status === 'fulfilled') {
          const data = inventoryResult.value.data;
          setInventory(Array.isArray(data) ? data : []);
        }

        if (suppliersResult.status === 'fulfilled') {
          const data = suppliersResult.value.data;
          setSuppliers(Array.isArray(data) ? data : []);
        }

        if (alertsResult.status === 'fulfilled') {
          const data = alertsResult.value.data;
          setAlerts(Array.isArray(data) ? data : []);
        }

        const failedRequests = results.filter(
          (result) => result.status === 'rejected'
        );

        if (failedRequests.length === results.length) {
          setError('Unable to load dashboard data.');
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  /*
   * Inventory calculations
   */

  const totalStock = useMemo(() => {
    return inventory.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity ??
            item.currentQuantity ??
            item.stockQuantity ??
            0
        ),
      0
    );
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => {
      const quantity = Number(
        item.quantity ??
          item.currentQuantity ??
          item.stockQuantity ??
          0
      );

      const reorderLevel = Number(
        item.reorderLevel ??
          item.reorderLevelQuantity ??
          item.thresholdStock ??
          0
      );

      return quantity > 0 && quantity <= reorderLevel;
    });
  }, [inventory]);

  const outOfStockItems = useMemo(() => {
    return inventory.filter((item) => {
      const quantity = Number(
        item.quantity ??
          item.currentQuantity ??
          item.stockQuantity ??
          0
      );

      return quantity === 0;
    });
  }, [inventory]);

  /*
   * Expiry calculation
   *
   * We calculate this from medicine expiry dates instead of
   * displaying a hardcoded number.
   */

  const expiringMedicines = useMemo(() => {
    const today = new Date();

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return medicines.filter((medicine) => {
      if (!medicine.expiryDate) return false;

      const expiryDate = new Date(medicine.expiryDate);

      return (
        expiryDate >= today &&
        expiryDate <= thirtyDaysFromNow
      );
    });
  }, [medicines]);

  /*
   * Open alerts
   */

  const openAlerts = useMemo(() => {
    return alerts.filter(
      (alert) =>
        alert.status === 'OPEN' ||
        alert.status === 'ACKNOWLEDGED'
    );
  }, [alerts]);

  /*
   * Recent alerts
   */

  const recentAlerts = useMemo(() => {
    return [...alerts]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [alerts]);

  /*
   * Supplier statistics
   */

  const activeSuppliers = useMemo(() => {
    return suppliers.filter(
      (supplier) =>
        !supplier.status ||
        supplier.status === 'ACTIVE'
    );
  }, [suppliers]);

  const handleExportLedger = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Medicines', medicines.length],
      ['Total Stock Units', totalStock],
      ['Low Stock Items', lowStockItems.length],
      ['Out of Stock Items', outOfStockItems.length],
      ['Expiring Within 30 Days', expiringMedicines.length],
      ['Suppliers', suppliers.length],
      ['Open Alerts', openAlerts.length],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'medistock-dashboard-summary.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const adminName = user?.name || user?.email || 'Admin';

  const getInitials = (name) => {
    if (!name) return 'AD';

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <Package size={16} />;

      case 'OUT_OF_STOCK':
        return <AlertTriangle size={16} />;

      case 'EXPIRY':
        return <CalendarClock size={16} />;

      case 'SUPPLIER_DELAY':
        return <Truck size={16} />;

      default:
        return <AlertTriangle size={16} />;
    }
  };

  const getAlertStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-600';

      case 'WARNING':
        return 'bg-amber-50 text-amber-600';

      default:
        return 'bg-blue-50 text-blue-600';
    }
  };

  return (
    <div className="space-y-7">
      {/* Notification popup */}
      <NotificationPopup />

      {/* Top Application Header */}
      <div className="flex items-center justify-between border-b border-stone-200/70 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            MediStock
          </p>

          <p className="text-sm font-medium text-stone-700">
            Clinical Inventory System
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#edf4f1] text-xs font-bold text-[#456c60]">
              {getInitials(adminName)}
            </div>

            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-stone-800">
                {adminName}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                ADMIN
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Good morning,{' '}
            {user?.name ? user.name.split(' ')[0] : 'Admin'}
          </h1>

          <p className="mt-1 text-xs text-stone-500 sm:text-sm">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportLedger}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          <Download size={14} className="text-stone-500" />
          Export Summary
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <ClinicalMetricCard
          title="TOTAL CATALOGED"
          value={loading ? '—' : medicines.length}
          type="catalog"
          trend="up"
        />

        <ClinicalMetricCard
          title="ACTIVE STOCK VOLUME"
          value={loading ? '—' : totalStock.toLocaleString()}
          unit="units"
          type="volume"
          trend="up"
        />

        <ClinicalMetricCard
          title="LOW STOCK TRIGGERS"
          value={loading ? '—' : lowStockItems.length}
          type="low_stock"
          trend="down"
        />

        <ClinicalMetricCard
          title="EXPIRING (30 DAYS)"
          value={loading ? '—' : expiringMedicines.length}
          type="expiring"
          trend="down"
        />
      </div>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Stock Summary */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-stone-900">
              Inventory Overview
            </h2>

            <p className="mt-1 text-xs text-stone-400">
              Current inventory status from the system
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-xs text-stone-400">
                Total Units
              </p>

              <p className="mt-2 text-2xl font-bold text-stone-900">
                {loading ? '—' : totalStock.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-xs text-stone-400">
                Inventory Records
              </p>

              <p className="mt-2 text-2xl font-bold text-stone-900">
                {loading ? '—' : inventory.length}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs text-amber-600">
                Low Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-700">
                {loading ? '—' : lowStockItems.length}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs text-red-600">
                Out of Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-red-700">
                {loading ? '—' : outOfStockItems.length}
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Overview */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Supplier Overview
              </h2>

              <p className="mt-1 text-xs text-stone-400">
                Supplier records from the system
              </p>
            </div>

            <Truck size={18} className="text-[#4e7e71]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-xs text-stone-400">
                Total Suppliers
              </p>

              <p className="mt-2 text-2xl font-bold text-stone-900">
                {loading ? '—' : suppliers.length}
              </p>
            </div>

            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-xs text-stone-400">
                Active Suppliers
              </p>

              <p className="mt-2 text-2xl font-bold text-stone-900">
                {loading ? '—' : activeSuppliers.length}
              </p>
            </div>
          </div>

          {/* Real supplier list */}
          <div className="mt-5 space-y-3">
            {suppliers.length === 0 && !loading ? (
              <div className="rounded-xl border border-dashed border-stone-200 py-8 text-center">
                <p className="text-sm font-medium text-stone-500">
                  No suppliers available
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  Supplier data will appear here when records exist.
                </p>
              </div>
            ) : (
              suppliers.slice(0, 4).map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-stone-800">
                      {supplier.name || 'Unnamed Supplier'}
                    </p>

                    <p className="mt-0.5 text-[11px] text-stone-400">
                      {supplier.contactPerson ||
                        supplier.email ||
                        'No contact information'}
                    </p>
                  </div>

                  {supplier.rating !== undefined &&
                    supplier.rating !== null && (
                      <span className="ml-3 shrink-0 text-xs font-bold text-stone-700">
                        {supplier.rating}
                      </span>
                    )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alerts & Expiry */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Recent Alerts
              </h2>

              <p className="mt-1 text-xs text-stone-400">
                Alerts currently recorded by MediStock
              </p>
            </div>

            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600">
              {loading ? '—' : openAlerts.length} open
            </span>
          </div>

          <div className="space-y-3">
            {recentAlerts.length === 0 && !loading ? (
              <div className="rounded-xl border border-dashed border-stone-200 py-8 text-center">
                <p className="text-sm font-medium text-stone-500">
                  No alerts available
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  New inventory alerts will appear here.
                </p>
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex gap-3 rounded-xl border border-stone-100 p-3"
                >
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${getAlertStyle(
                      alert.severity
                    )}`}
                  >
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-stone-800">
                      {alert.title || 'Inventory Alert'}
                    </p>

                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-stone-500">
                      {alert.message || 'No additional details available.'}
                    </p>

                    {alert.createdAt && (
                      <p className="mt-1 text-[10px] text-stone-400">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-[10px] font-semibold uppercase text-stone-400">
                    {alert.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiring Medicines */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Expiring Within 30 Days
              </h2>

              <p className="mt-1 text-xs text-stone-400">
                Based on medicine expiry dates
              </p>
            </div>

            <CalendarClock
              size={18}
              className="text-[#c57930]"
            />
          </div>

          <div className="space-y-3">
            {expiringMedicines.length === 0 && !loading ? (
              <div className="rounded-xl border border-dashed border-stone-200 py-8 text-center">
                <p className="text-sm font-medium text-stone-500">
                  No medicines expiring soon
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  Medicines expiring within 30 days will appear here.
                </p>
              </div>
            ) : (
              expiringMedicines.slice(0, 5).map((medicine) => (
                <div
                  key={medicine.id}
                  className="flex items-center justify-between rounded-xl border border-stone-100 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-stone-800">
                      {medicine.name || 'Unnamed Medicine'}
                    </p>

                    <p className="mt-1 text-[11px] text-stone-400">
                      Batch: {medicine.batchNumber || 'N/A'}
                    </p>
                  </div>

                  <div className="ml-3 shrink-0 text-right">
                    <p className="text-[11px] font-semibold text-amber-600">
                      {medicine.expiryDate
                        ? new Date(
                            medicine.expiryDate
                          ).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-center text-xs text-stone-400">
          Loading live dashboard data...
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;