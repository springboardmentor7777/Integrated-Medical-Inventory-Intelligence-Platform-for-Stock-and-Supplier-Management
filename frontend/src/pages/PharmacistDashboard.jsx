import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Package,
  AlertTriangle,
  CalendarClock,
  Truck,
} from 'lucide-react';

import ClinicalMetricCard from '../components/ClinicalMetricCard';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationPopup from '../components/notifications/NotificationPopup';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
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
        console.error('Failed to load pharmacist dashboard:', err);
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // -----------------------------
  // LIVE METRICS
  // -----------------------------

  const totalCataloged = medicines.length;

  const getQuantity = (item) =>
    Number(
      item.quantity ??
        item.currentQuantity ??
        item.stockQuantity ??
        0
    );

  const getReorderLevel = (item) =>
    Number(
      item.reorderLevel ??
        item.reorderLevelQuantity ??
        item.thresholdStock ??
        0
    );

  const availableStock = useMemo(() => {
    return inventory.reduce(
      (sum, item) => sum + getQuantity(item),
      0
    );
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => {
      const quantity = getQuantity(item);
      const reorderLevel = getReorderLevel(item);

      return quantity > 0 && quantity <= reorderLevel;
    });
  }, [inventory]);

  const outOfStockItems = useMemo(() => {
    return inventory.filter((item) => getQuantity(item) === 0);
  }, [inventory]);

  const expiringMedicines = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(
      thirtyDaysFromNow.getDate() + 30
    );

    return medicines
      .filter((medicine) => {
        if (!medicine.expiryDate) return false;

        const expiryDate = new Date(medicine.expiryDate);

        return (
          expiryDate >= today &&
          expiryDate <= thirtyDaysFromNow
        );
      })
      .sort(
        (a, b) =>
          new Date(a.expiryDate) -
          new Date(b.expiryDate)
      );
  }, [medicines]);

  // -----------------------------
  // LOW STOCK DISPLAY DATA
  // -----------------------------

  const lowStockAlerts = useMemo(() => {
    return lowStockItems.slice(0, 5).map((item, index) => {
      const quantity = getQuantity(item);
      const reorderLevel = getReorderLevel(item);

      return {
        id: item.id ?? index,
        medicine:
          item.medicineName ||
          item.name ||
          item.medicine?.name ||
          'Unknown Medicine',
        inStock: `${quantity} units`,
        reorderLevel: `${reorderLevel} units`,
      };
    });
  }, [lowStockItems]);

  // -----------------------------
  // EXPIRING MEDICINES DISPLAY
  // -----------------------------

  const expiringBatches = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return expiringMedicines.slice(0, 5).map((medicine, index) => {
      const expiryDate = new Date(medicine.expiryDate);

      const millisecondsPerDay = 1000 * 60 * 60 * 24;

      const daysLeft = Math.max(
        0,
        Math.ceil(
          (expiryDate - today) /
            millisecondsPerDay
        )
      );

      return {
        id: medicine.id ?? index,
        medicineBatch:
          medicine.batchNumber
            ? `${medicine.name || 'Unknown Medicine'} — Batch ${medicine.batchNumber}`
            : medicine.name || 'Unknown Medicine',
        expiryDate: expiryDate.toLocaleDateString(),
        daysLeft:
          daysLeft === 0
            ? 'Expires today'
            : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
        urgency:
          daysLeft <= 7
            ? 'high'
            : 'medium',
      };
    });
  }, [expiringMedicines]);

  // -----------------------------
  // SUPPLIER DATA
  // -----------------------------

  const supplierRatings = useMemo(() => {
    return suppliers.slice(0, 5).map((supplier) => ({
      id: supplier.id,
      name:
        supplier.name ||
        'Unnamed Supplier',
      category:
        supplier.contactPerson ||
        supplier.email ||
        supplier.city ||
        'Supplier',
      rating:
        supplier.rating !== undefined &&
        supplier.rating !== null
          ? `${supplier.rating} / 5.0`
          : 'Not rated',
    }));
  }, [suppliers]);

  // -----------------------------
  // ALERT DATA
  // -----------------------------

  const openAlerts = useMemo(() => {
    return alerts.filter(
      (alert) =>
        alert.status === 'OPEN' ||
        alert.status === 'ACKNOWLEDGED'
    );
  }, [alerts]);

  const getAlertCount = (type) => {
    return openAlerts.filter(
      (alert) => alert.type === type
    ).length;
  };

  // -----------------------------
  // USER
  // -----------------------------

  const pharmacistName =
    user?.name ||
    user?.email ||
    'Pharmacist';

  const getInitials = (name) => {
    if (!name) return 'PH';

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  };

  // -----------------------------
  // ALERT ICON
  // -----------------------------

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
      <NotificationPopup />

      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-stone-200/70 pb-4 sm:flex-row sm:items-center sm:justify-between">

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
              {getInitials(pharmacistName)}
            </div>

            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-stone-800">
                {pharmacistName}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                PHARMACIST
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Good morning,{' '}
            {user?.name
              ? user.name.split(' ')[0]
              : 'Pharmacist'}
          </h1>

          <p className="mt-1 text-xs font-normal text-stone-500 sm:text-sm">
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
          onClick={() => navigate('/inventory')}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50"
        >
          <ClipboardList
            size={14}
            className="text-stone-500"
          />

          <span>Dispensary Log</span>
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <ClinicalMetricCard
          title="TOTAL CATALOGED"
          value={
            loading
              ? '—'
              : totalCataloged
          }
          type="catalog"
          trend="up"
        />

        <ClinicalMetricCard
          title="AVAILABLE STOCK"
          value={
            loading
              ? '—'
              : availableStock.toLocaleString()
          }
          unit="units"
          type="volume"
          trend="up"
        />

        <ClinicalMetricCard
          title="LOW STOCK TRIGGERS"
          value={
            loading
              ? '—'
              : lowStockItems.length
          }
          type="low_stock"
          trend="down"
        />

        <ClinicalMetricCard
          title="EXPIRING (30 DAYS)"
          value={
            loading
              ? '—'
              : expiringMedicines.length
          }
          type="expiring"
          trend="down"
        />

      </div>

      {/* LOW STOCK + EXPIRY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* LOW STOCK */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-900">
                  Low Stock Alerts
                </h2>

                <p className="mt-1 text-xs text-stone-400">
                  Medicines below their reorder level
                </p>
              </div>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                {loading
                  ? '—'
                  : lowStockItems.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">

                <thead>
                  <tr className="border-b border-stone-100">

                    <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Medicine
                    </th>

                    <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      In Stock
                    </th>

                    <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Reorder Level
                    </th>

                    <th className="pb-3 text-right text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">

                  {lowStockAlerts.length === 0 && !loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-8 text-center"
                      >
                        <p className="text-sm font-medium text-stone-500">
                          No low stock medicines
                        </p>

                        <p className="mt-1 text-xs text-stone-400">
                          Inventory items below their reorder level will appear here.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    lowStockAlerts.map((row) => (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-stone-50/50"
                      >

                        <td className="py-4 pr-3 text-xs font-medium text-stone-900">
                          {row.medicine}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-rose-600">
                          {row.inStock}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-xs text-stone-500">
                          {row.reorderLevel}
                        </td>

                        <td className="whitespace-nowrap py-4 pl-3 text-right text-xs">
                          <Link
                            to="/inventory"
                            className="font-medium text-stone-700 underline hover:text-stone-900"
                          >
                            View
                          </Link>
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>
            </div>
          </div>

          {outOfStockItems.length > 0 && (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-semibold text-red-700">
                {outOfStockItems.length} medicine
                {outOfStockItems.length !== 1
                  ? 's are'
                  : ' is'}{' '}
                currently out of stock.
              </p>
            </div>
          )}

        </div>

        {/* EXPIRING */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

          <div>
            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="text-sm font-bold text-stone-900">
                  Expiring Soon Batches
                </h2>

                <p className="mt-1 text-xs text-stone-400">
                  Medicines expiring within 30 days
                </p>
              </div>

              <CalendarClock
                size={18}
                className="text-[#c57930]"
              />

            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">

                <thead>
                  <tr className="border-b border-stone-100">

                    <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Medicine Batch
                    </th>

                    <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Expiry Date
                    </th>

                    <th className="pb-3 text-right text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Days Left
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">

                  {expiringBatches.length === 0 && !loading ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-8 text-center"
                      >
                        <p className="text-sm font-medium text-stone-500">
                          No medicines expiring soon
                        </p>

                        <p className="mt-1 text-xs text-stone-400">
                          Expiring medicines will appear here.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    expiringBatches.map((row) => (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-stone-50/50"
                      >

                        <td className="py-4 pr-3 text-xs font-medium text-stone-900">
                          {row.medicineBatch}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-xs text-stone-500">
                          {row.expiryDate}
                        </td>

                        <td className="whitespace-nowrap py-4 pl-3 text-right text-xs font-semibold">
                          <span
                            className={
                              row.urgency === 'high'
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }
                          >
                            {row.daysLeft}
                          </span>
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>
            </div>
          </div>

        </div>

      </div>

      {/* SUPPLIERS + ALERT SUMMARY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* SUPPLIERS */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Supplier Ratings
              </h2>

              <p className="mt-1 text-xs text-stone-400">
                Supplier information from the system
              </p>
            </div>

            <Truck
              size={18}
              className="text-[#4e7e71]"
            />

          </div>

          <div className="divide-y divide-stone-100">

            {supplierRatings.length === 0 && !loading ? (
              <div className="rounded-xl border border-dashed border-stone-200 py-8 text-center">

                <p className="text-sm font-medium text-stone-500">
                  No suppliers available
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  Supplier records will appear here when available.
                </p>

              </div>
            ) : (
              supplierRatings.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1"
                >

                  <div className="min-w-0">

                    <p className="truncate text-xs font-bold text-stone-900">
                      {supplier.name}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-stone-500">
                      {supplier.category}
                    </p>

                  </div>

                  <span className="ml-3 shrink-0 text-xs font-bold text-stone-800">
                    {supplier.rating}
                  </span>

                </div>
              ))
            )}

          </div>

        </div>

        {/* ALERT SUMMARY */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Inventory Alert Summary
              </h2>

              <p className="mt-1 text-xs text-stone-400">
                Current alerts recorded by MediStock
              </p>
            </div>

            <AlertTriangle
              size={18}
              className="text-amber-600"
            />

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs text-amber-600">
                Low Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-700">
                {loading
                  ? '—'
                  : getAlertCount('LOW_STOCK')}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs text-red-600">
                Out of Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-red-700">
                {loading
                  ? '—'
                  : getAlertCount('OUT_OF_STOCK')}
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-xs text-orange-600">
                Expiry
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-700">
                {loading
                  ? '—'
                  : getAlertCount('EXPIRY')}
              </p>
            </div>

            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-xs text-stone-500">
                Open Alerts
              </p>

              <p className="mt-2 text-2xl font-bold text-stone-900">
                {loading
                  ? '—'
                  : openAlerts.length}
              </p>
            </div>

          </div>

          <Link
            to="/alerts"
            className="mt-5 inline-flex text-xs font-semibold text-[#456c60] hover:text-[#36564d]"
          >
            View all alerts →
          </Link>

        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-center text-xs text-stone-400">
          Loading live dashboard data...
        </div>
      )}

    </div>
  );
};

export default PharmacistDashboard;
