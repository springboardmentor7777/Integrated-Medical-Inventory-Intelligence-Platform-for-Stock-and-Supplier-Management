import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  AlertCircle,
  Package,
  CalendarClock,
  XCircle,
} from 'lucide-react';

import ClinicalMetricCard from '../components/ClinicalMetricCard';
import api from '../services/api';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationPopup from '../components/notifications/NotificationPopup';
import { useAuth } from '../context/useAuth';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [inventory, setInventory] = useState([]);
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
          api.get('/api/alerts'),
        ]);

        const [
          medicinesResult,
          inventoryResult,
          alertsResult,
        ] = results;

        if (medicinesResult.status === 'fulfilled') {
          const data = medicinesResult.value.data;

          setMedicines(
            Array.isArray(data) ? data : []
          );
        }

        if (inventoryResult.status === 'fulfilled') {
          const data = inventoryResult.value.data;

          setInventory(
            Array.isArray(data) ? data : []
          );
        }

        if (alertsResult.status === 'fulfilled') {
          const data = alertsResult.value.data;

          setAlerts(
            Array.isArray(data) ? data : []
          );
        }

        const failedRequests = results.filter(
          (result) => result.status === 'rejected'
        );

        if (failedRequests.length === results.length) {
          setError('Unable to load dashboard data.');
        }
      } catch (err) {
        console.error(
          'Failed to load staff dashboard:',
          err
        );

        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --------------------------------
  // INVENTORY HELPERS
  // --------------------------------

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

  // --------------------------------
  // LOW STOCK
  // --------------------------------

  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => {
      const quantity = getQuantity(item);
      const reorderLevel = getReorderLevel(item);

      return (
        quantity > 0 &&
        quantity <= reorderLevel
      );
    });
  }, [inventory]);

  // --------------------------------
  // OUT OF STOCK
  // --------------------------------

  const outOfStockItems = useMemo(() => {
    return inventory.filter(
      (item) => getQuantity(item) === 0
    );
  }, [inventory]);

  // --------------------------------
  // EXPIRING MEDICINES
  // --------------------------------

  const expiringMedicines = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);

    thirtyDaysFromNow.setDate(
      thirtyDaysFromNow.getDate() + 30
    );

    return medicines.filter((medicine) => {
      if (!medicine.expiryDate) {
        return false;
      }

      const expiryDate = new Date(
        medicine.expiryDate
      );

      return (
        expiryDate >= today &&
        expiryDate <= thirtyDaysFromNow
      );
    });
  }, [medicines]);

  // --------------------------------
  // OPEN ALERTS
  // --------------------------------

  const openAlerts = useMemo(() => {
    return alerts.filter(
      (alert) =>
        alert.status === 'OPEN' ||
        alert.status === 'ACKNOWLEDGED'
    );
  }, [alerts]);

  // --------------------------------
  // RECENT ALERTS
  // --------------------------------

  const recentActions = useMemo(() => {
    return [...alerts]
      .sort((a, b) => {
        const dateA = new Date(
          a.createdAt || 0
        );

        const dateB = new Date(
          b.createdAt || 0
        );

        return dateB - dateA;
      })
      .slice(0, 5)
      .map((alert) => ({
        id: alert.id,

        formulation:
          alert.medicineName ||
          alert.title ||
          'Inventory Alert',

        action:
          alert.message ||
          `${alert.type || 'Inventory'} alert recorded`,

        time: alert.createdAt
          ? new Date(
              alert.createdAt
            ).toLocaleString()
          : 'Recently',
      }));
  }, [alerts]);

  // --------------------------------
  // ALERT COUNTS
  // --------------------------------

  const lowStockAlertCount = useMemo(() => {
    return openAlerts.filter(
      (alert) =>
        alert.type === 'LOW_STOCK'
    ).length;
  }, [openAlerts]);

  const outOfStockAlertCount = useMemo(() => {
    return openAlerts.filter(
      (alert) =>
        alert.type === 'OUT_OF_STOCK'
    ).length;
  }, [openAlerts]);

  const expiryAlertCount = useMemo(() => {
    return openAlerts.filter(
      (alert) =>
        alert.type === 'EXPIRY'
    ).length;
  }, [openAlerts]);

  // --------------------------------
  // USER
  // --------------------------------

  const staffName =
    user?.name ||
    user?.email ||
    'Staff';

  const getInitials = (name) => {
    if (!name) {
      return 'ST';
    }

    const parts = name
      .trim()
      .split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${
        parts[parts.length - 1][0]
      }`.toUpperCase();
    }

    return name
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-7">

      <NotificationPopup />

      {/* STAFF HEADER */}
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
              {getInitials(staffName)}
            </div>

            <div className="hidden sm:block">

              <p className="text-xs font-semibold text-stone-800">
                {staffName}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                STAFF
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* PAGE HEADER */}
      <div>

        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          Good morning,{' '}
          {user?.name
            ? user.name.split(' ')[0]
            : 'Staff'}
        </h1>

        <p className="mt-1 text-xs font-normal text-stone-500 sm:text-sm">
          {new Date().toLocaleDateString(
            undefined,
            {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }
          )}
        </p>

      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* METRICS + QUICK ACTIONS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">

          <ClinicalMetricCard
            title="TOTAL CATALOGED ITEMS"
            value={
              loading
                ? '—'
                : medicines.length
            }
            type="catalog"
            trend="up"
          />

          <ClinicalMetricCard
            title="LOW STOCK ITEMS"
            value={
              loading
                ? '—'
                : lowStockItems.length
            }
            type="low_stock"
            trend="down"
          />

          <ClinicalMetricCard
            title="EXPIRING"
            value={
              loading
                ? '—'
                : expiringMedicines.length
            }
            type="expiring"
            trend="down"
          />

          <ClinicalMetricCard
            title="FULLY OUT OF STOCK"
            value={
              loading
                ? '—'
                : outOfStockItems.length
            }
            type="out_of_stock"
            trend="down"
          />

        </div>

        {/* QUICK ACTIONS */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

          <h2 className="mb-4 text-sm font-bold text-stone-900">
            Quick Actions
          </h2>

          <div className="flex flex-1 flex-col justify-around space-y-3">

            {/* VIEW MEDICINES */}
            <button
              type="button"
              onClick={() =>
                navigate('/medicines')
              }
              className="group flex w-full items-center gap-3.5 rounded-xl border border-stone-200/90 p-3.5 text-left transition-all hover:border-stone-400/80 hover:bg-stone-50/60"
            >

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600 group-hover:text-stone-900">
                <Search size={15} />
              </div>

              <div className="min-w-0">

                <p className="truncate text-xs font-bold text-stone-900">
                  View Cataloged Medicines
                </p>

                <p className="truncate text-[11px] text-stone-500">
                  Scan current active formulations
                </p>

              </div>

            </button>

            {/* UPDATE INVENTORY */}
            <button
              type="button"
              onClick={() =>
                navigate('/inventory')
              }
              className="group flex w-full items-center gap-3.5 rounded-xl border border-stone-200/90 p-3.5 text-left transition-all hover:border-stone-400/80 hover:bg-stone-50/60"
            >

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-[#4e7e71] group-hover:text-[#3d655b]">
                <PlusCircle size={15} />
              </div>

              <div className="min-w-0">

                <p className="truncate text-xs font-bold text-stone-900">
                  Update Stock Levels
                </p>

                <p className="truncate text-[11px] text-stone-500">
                  Batch input new arrivals
                </p>

              </div>

            </button>

            {/* VIEW ALERTS */}
            <button
              type="button"
              onClick={() =>
                navigate('/alerts')
              }
              className="group flex w-full items-center gap-3.5 rounded-xl border border-stone-200/90 p-3.5 text-left transition-all hover:border-stone-400/80 hover:bg-stone-50/60"
            >

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-[#c74c3e] group-hover:text-rose-700">
                <AlertCircle size={15} />
              </div>

              <div className="min-w-0">

                <p className="truncate text-xs font-bold text-stone-900">
                  View Critical Alerts
                </p>

                <p className="truncate text-[11px] text-stone-500">
                  {loading
                    ? 'Loading alerts...'
                    : `${openAlerts.length} active alerts`}
                </p>

              </div>

            </button>

          </div>

        </div>

      </div>

      {/* ALERT SUMMARY */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

          <div className="flex items-center gap-3">

            <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <Package size={17} />
            </div>

            <div>
              <p className="text-xs text-stone-400">
                Low Stock Alerts
              </p>

              <p className="mt-1 text-xl font-bold text-stone-900">
                {loading
                  ? '—'
                  : lowStockAlertCount}
              </p>
            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

          <div className="flex items-center gap-3">

            <div className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600">
              <XCircle size={17} />
            </div>

            <div>
              <p className="text-xs text-stone-400">
                Out of Stock Alerts
              </p>

              <p className="mt-1 text-xl font-bold text-stone-900">
                {loading
                  ? '—'
                  : outOfStockAlertCount}
              </p>
            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

          <div className="flex items-center gap-3">

            <div className="grid h-9 w-9 place-items-center rounded-lg bg-orange-50 text-orange-600">
              <CalendarClock size={17} />
            </div>

            <div>
              <p className="text-xs text-stone-400">
                Expiry Alerts
              </p>

              <p className="mt-1 text-xl font-bold text-stone-900">
                {loading
                  ? '—'
                  : expiryAlertCount}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* RECENT ALERTS / ACTIONS */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <h2 className="text-sm font-bold text-stone-900">
              Recent Inventory Activity
            </h2>

            <p className="mt-1 text-xs text-stone-400">
              Latest alerts and inventory events recorded by MediStock
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/alerts')
            }
            className="text-xs font-semibold text-[#456c60] hover:text-[#36564d]"
          >
            View all →
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-left">

            <thead>
              <tr className="border-b border-stone-100">

                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Medicine / Alert
                </th>

                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Activity
                </th>

                <th className="pb-3 text-right text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Logged Time
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">

              {recentActions.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan="3"
                    className="py-10 text-center"
                  >
                    <p className="text-sm font-medium text-stone-500">
                      No recent activity
                    </p>

                    <p className="mt-1 text-xs text-stone-400">
                      New inventory alerts will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                recentActions.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-stone-50/50"
                  >

                    <td className="whitespace-nowrap py-4 pr-4 text-xs font-bold text-stone-900">
                      {item.formulation}
                    </td>

                    <td className="px-4 py-4 text-xs text-stone-600">
                      {item.action}
                    </td>

                    <td className="whitespace-nowrap py-4 pl-4 text-right text-xs text-stone-400">
                      {item.time}
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

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

export default StaffDashboard;
