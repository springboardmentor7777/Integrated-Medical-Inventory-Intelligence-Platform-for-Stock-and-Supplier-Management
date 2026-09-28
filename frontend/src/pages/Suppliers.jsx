import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Edit3,
  Plus,
  Search,
  Star,
  Trash2,
  Truck,
  X,
  AlertTriangle,
  ShieldCheck,
  Clock,
} from 'lucide-react';

import supplierService from '../services/supplierService';
import authService from '../services/authService';
import { useAuth } from '../context/useAuth';
import StatusBadge from '../components/StatusBadge';

const emptyForm = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gstNumber: '',
  licenseNumber: '',
  status: 'ACTIVE',
  rating: '',
  leadTimeDays: '',
};

const Suppliers = () => {
  const { user } = useAuth();

  const canWrite = ['ADMIN', 'PHARMACIST'].includes(user?.role);
  const canDelete = user?.role === 'ADMIN';

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  /* ----------------------------- LOAD DATA ----------------------------- */

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await supplierService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(authService.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ----------------------------- SEARCH ----------------------------- */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter(
      (s) =>
        !q ||
        [
          s.name,
          s.contactPerson,
          s.email,
          s.phone,
          s.city,
          s.state,
          s.gstNumber,
          s.licenseNumber,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, search]);

  /* ----------------------------- ANALYTICS ----------------------------- */

  const activeCount = useMemo(
    () => items.filter((s) => s.status === 'ACTIVE').length,
    [items]
  );

  const inactiveCount = items.length - activeCount;

  const activePercent = items.length
    ? Math.round((activeCount / items.length) * 100)
    : 0;

  const lowRatingSuppliers = useMemo(
    () =>
      items.filter(
        (s) => Number(s.rating) > 0 && Number(s.rating) < 3.0
      ),
    [items]
  );

  const highLeadTimeSuppliers = useMemo(
    () => items.filter((s) => Number(s.leadTimeDays) > 14),
    [items]
  );

  const avgRating = items.length
    ? (
        items.reduce(
          (sum, s) => sum + Number(s.rating || 0),
          0
        ) / items.length
      ).toFixed(1)
    : '—';

  const avgLead = items.length
    ? Math.round(
        items.reduce(
          (sum, s) => sum + Number(s.leadTimeDays || 0),
          0
        ) / items.length
      )
    : '—';

  /* ----------------------------- LEAD TIME DATA ----------------------------- */

  const leadTimeBuckets = useMemo(() => {
    const buckets = {
      '1-3 Days': 0,
      '4-7 Days': 0,
      '8-14 Days': 0,
      '15+ Days': 0,
    };

    items.forEach((s) => {
      const days = Number(s.leadTimeDays || 0);

      if (days <= 3) {
        buckets['1-3 Days']++;
      } else if (days <= 7) {
        buckets['4-7 Days']++;
      } else if (days <= 14) {
        buckets['8-14 Days']++;
      } else {
        buckets['15+ Days']++;
      }
    });

    return buckets;
  }, [items]);

  const maxBucketVal = Math.max(
    ...Object.values(leadTimeBuckets),
    1
  );

  /* ----------------------------- FORM HANDLERS ----------------------------- */

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
    setMessage('');
  };

  const openEdit = (supplier) => {
    setEditingId(supplier.id);

    setForm({
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      state: supplier.state || '',
      pincode: supplier.pincode || '',
      gstNumber: supplier.gstNumber || '',
      licenseNumber: supplier.licenseNumber || '',
      status: supplier.status || 'ACTIVE',
      rating: supplier.rating ?? '',
      leadTimeDays: supplier.leadTimeDays ?? '',
    });

    setShowForm(true);
    setError('');
    setMessage('');
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ----------------------------- SAVE ----------------------------- */

  const save = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    const payload = {
      ...form,
      rating: form.rating === '' ? null : Number(form.rating),
      leadTimeDays:
        form.leadTimeDays === ''
          ? null
          : Number(form.leadTimeDays),
    };

    try {
      if (editingId) {
        await supplierService.update(editingId, payload);
        setMessage('Supplier updated successfully.');
      } else {
        await supplierService.create(payload);
        setMessage('Supplier added successfully.');
      }

      setShowForm(false);
      await load();
    } catch (err) {
      setError(authService.handleError(err));
    }
  };

  /* ----------------------------- DELETE ----------------------------- */

  const remove = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;

    try {
      setError('');
      await supplierService.remove(id);
      setMessage('Supplier deleted successfully.');
      await load();
    } catch (err) {
      setError(authService.handleError(err));
    }
  };

  /* ----------------------------- UI ----------------------------- */

  return (
    <div className="min-h-full bg-[#fafaf8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col gap-4 border-b border-stone-200/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              Supplier management
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-800">
              Suppliers
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Maintain verified medical suppliers, contact details,
              lead time, rating, and operational status.
            </p>
          </div>

          {canWrite && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#456c60] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#36564d]"
            >
              <Plus size={17} />
              Add supplier
            </button>
          )}
        </div>

        {/* ================= FEEDBACK ================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {/* ================= ALERT CARDS ================= */}

        {(lowRatingSuppliers.length > 0 ||
          highLeadTimeSuppliers.length > 0 ||
          items.length > 0) && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {lowRatingSuppliers.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-600">
                    <AlertTriangle size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Low Rating Alert
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      {lowRatingSuppliers.length} supplier(s)
                      have a rating below 3.0 and may require review.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {highLeadTimeSuppliers.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-4">
                <div className="flex gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-100 text-red-600">
                    <Clock size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Lead Time Delay Risk
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-700">
                      {highLeadTimeSuppliers.length} supplier(s)
                      have lead times longer than 14 days.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Operational Status
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    {activePercent}% of registered suppliers are
                    currently active.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= METRICS ================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_4px_18px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Total suppliers
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-800">
                  {items.length}
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  Registered suppliers
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#edf4f1] text-[#456c60]">
                <Building2 size={19} />
              </div>
            </div>
          </div>

          {/* Active */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_4px_18px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Active suppliers
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-800">
                  {activeCount}
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  Currently operational
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={19} />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_4px_18px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Average rating
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-800">
                  {avgRating}
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  Supplier performance
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <Star size={19} />
              </div>
            </div>
          </div>

          {/* Lead time */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_4px_18px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Avg. lead time
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-800">
                  {avgLead}
                  <span className="ml-1 text-sm font-medium text-stone-400">
                    days
                  </span>
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  Typical delivery time
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <Truck size={19} />
              </div>
            </div>
          </div>

        </div>

        {/* ================= ANALYTICS ================= */}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Operational Status */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_4px_18px_rgba(0,0,0,0.04)]">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-stone-800">
                  Supplier operational status
                </h2>

                <p className="mt-1 text-xs text-stone-400">
                  Active versus inactive suppliers
                </p>
              </div>

              <Building2 size={18} className="text-stone-400" />
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-6 sm:flex-row">

              <div
                className="grid h-32 w-32 place-items-center rounded-full"
                style={{
                  background: items.length
                    ? `conic-gradient(#4e7e71 0% ${activePercent}%, #d6d3d1 ${activePercent}% 100%)`
                    : '#e7e5e4',
                }}
              >
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
                  <span className="text-xl font-semibold text-stone-800">
                    {activePercent}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-sm bg-[#4e7e71]" />
                  <span className="text-stone-500">
                    Active
                  </span>
                  <span className="font-semibold text-stone-800">
                    {activeCount}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-sm bg-stone-300" />
                  <span className="text-stone-500">
                    Inactive
                  </span>
                  <span className="font-semibold text-stone-800">
                    {inactiveCount}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Lead Time */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_4px_18px_rgba(0,0,0,0.04)]">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-stone-800">
                  Lead time distribution
                </h2>

                <p className="mt-1 text-xs text-stone-400">
                  Suppliers grouped by delivery time
                </p>
              </div>

              <Truck size={18} className="text-stone-400" />
            </div>

            <div className="mt-6 flex h-40 items-end gap-3">

              {Object.entries(leadTimeBuckets).map(
                ([label, count]) => {
                  const heightPct =
                    (count / maxBucketVal) * 100;

                  return (
                    <div
                      key={label}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <span className="mb-2 text-xs font-semibold text-stone-600">
                        {count}
                      </span>

                      <div className="flex h-28 w-full items-end">
                        <div
                          className="w-full rounded-t-md bg-[#6f968a] transition-all duration-300"
                          style={{
                            height: `${Math.max(
                              heightPct,
                              count > 0 ? 8 : 3
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="mt-2 text-center text-[10px] leading-4 text-stone-400">
                        {label}
                      </span>
                    </div>
                  );
                }
              )}

            </div>
          </div>

        </div>

        {/* ================= SUPPLIER DIRECTORY ================= */}

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_4px_18px_rgba(0,0,0,0.04)]">

          {/* Directory Header */}
          <div className="flex flex-col gap-4 border-b border-stone-100 p-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-sm font-semibold text-stone-800">
                Supplier directory
              </h2>

              <p className="mt-1 text-xs text-stone-400">
                Search and manage registered suppliers
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

              <div className="flex min-w-0 items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 sm:w-72">
                <Search
                  size={16}
                  className="shrink-0 text-stone-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search suppliers..."
                  className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
                />
              </div>

              <span className="whitespace-nowrap text-xs font-medium text-stone-400">
                {filtered.length} supplier(s)
              </span>

            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">

            <table className="min-w-[900px] w-full text-left">

              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/70">

                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Supplier
                  </th>

                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Location
                  </th>

                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Rating
                  </th>

                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Lead Time
                  </th>

                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">

                {/* Loading */}
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-14 text-center"
                    >
                      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-stone-200 border-t-[#456c60]" />

                      <p className="mt-3 text-sm text-stone-400">
                        Loading suppliers...
                      </p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (

                  /* Empty */
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-14 text-center"
                    >
                      <Truck
                        size={26}
                        className="mx-auto text-stone-300"
                      />

                      <p className="mt-3 text-sm font-medium text-stone-600">
                        No suppliers found
                      </p>

                      <p className="mt-1 text-xs text-stone-400">
                        Try adjusting your search.
                      </p>
                    </td>
                  </tr>

                ) : (

                  /* Data */
                  filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="transition hover:bg-stone-50/60"
                    >

                      {/* Supplier */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-stone-800">
                            {s.name}
                          </p>

                          <p className="mt-1 text-[11px] text-stone-400">
                            {s.gstNumber ||
                              s.licenseNumber ||
                              'No registration number'}
                          </p>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-stone-700">
                          {s.contactPerson || '—'}
                        </p>

                        <p className="mt-1 text-[11px] text-stone-400">
                          {s.email || s.phone || ''}
                        </p>
                      </td>

                      {/* Location */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-stone-700">
                          {[s.city, s.state]
                            .filter(Boolean)
                            .join(', ') || '—'}
                        </p>

                        <p className="mt-1 text-[11px] text-stone-400">
                          {s.pincode || ''}
                        </p>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-sm font-medium ${
                            Number(s.rating) < 3.0
                              ? 'text-amber-600'
                              : 'text-stone-700'
                          }`}
                        >
                          <Star
                            size={13}
                            fill={
                              Number(s.rating) >= 3.0
                                ? '#f59e0b'
                                : 'none'
                            }
                            className="text-amber-500"
                          />

                          {s.rating ?? '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={s.status} />
                      </td>

                      {/* Lead Time */}
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-medium ${
                            Number(s.leadTimeDays) > 14
                              ? 'text-red-600'
                              : 'text-stone-700'
                          }`}
                        >
                          {s.leadTimeDays == null
                            ? '—'
                            : `${s.leadTimeDays} days`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">

                          {canWrite && (
                            <button
                              type="button"
                              onClick={() => openEdit(s)}
                              title="Edit supplier"
                              className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-[#edf4f1] hover:text-[#456c60]"
                            >
                              <Edit3 size={15} />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => remove(s.id)}
                              title="Delete supplier"
                              className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}

                          {!canWrite && (
                            <span className="self-center text-xs text-stone-400">
                              View only
                            </span>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>

          </div>
        </div>

        {/* ================= ADD / EDIT MODAL ================= */}

        {showForm && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-[2px]"
            onMouseDown={() => setShowForm(false)}
          >
            <div
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl"
              onMouseDown={(e) => e.stopPropagation()}
            >

              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white px-6 py-4">

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Supplier record
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-stone-800">
                    {editingId
                      ? 'Edit supplier'
                      : 'Add supplier'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                >
                  <X size={19} />
                </button>

              </div>

              {/* Form */}
              <form
                className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2"
                onSubmit={save}
              >

                {/* Supplier Name */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    Supplier name
                  </span>

                  <input
                    required
                    maxLength="150"
                    value={form.name}
                    onChange={(e) =>
                      handleFormChange('name', e.target.value)
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="Enter supplier name"
                  />
                </label>

                {/* Contact Person */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    Contact person
                  </span>

                  <input
                    value={form.contactPerson}
                    onChange={(e) =>
                      handleFormChange(
                        'contactPerson',
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="Contact person"
                  />
                </label>

                {/* Email */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    Email
                  </span>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      handleFormChange('email', e.target.value)
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="supplier@example.com"
                  />
                </label>

                {/* Phone */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    Phone
                  </span>

                  <input
                    value={form.phone}
                    onChange={(e) =>
                      handleFormChange('phone', e.target.value)
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="Phone number"
                  />
                </label>

                {/* Address */}
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-xs font-semibold text-stone-600">
                    Address
                  </span>

                  <input
                    value={form.address}
                    onChange={(e) =>
                      handleFormChange('address', e.target.value)
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="Full address"
                  />
                </label>

                {/* City */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    City
                  </span>

                  <input
                    value={form.city}
                    onChange={(e) =>
                      handleFormChange('city', e.target.value)
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="City"
                  />
                </label>

                {/* State */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    State
                  </span>

                  <input
                    value={form.state}
                    onChange={(e) =>
                      handleFormChange('state', e.target.value)
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="State"
                  />
                </label>

                {/* Pincode */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    Pincode
                  </span>

                  <input
                    value={form.pincode}
                    onChange={(e) =>
                      handleFormChange('pincode', e.target.value)
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="Pincode"
                  />
                </label>

                {/* GST */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    GST number
                  </span>

                  <input
                    value={form.gstNumber}
                    onChange={(e) =>
                      handleFormChange(
                        'gstNumber',
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="GST number"
                  />
                </label>

                {/* License */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    License number
                  </span>

                  <input
                    value={form.licenseNumber}
                    onChange={(e) =>
                      handleFormChange(
                        'licenseNumber',
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="License number"
                  />
                </label>

                {/* Status */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    Status
                  </span>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      handleFormChange(
                        'status',
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </label>

                {/* Rating */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    Rating (0–5)
                  </span>

                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) =>
                      handleFormChange(
                        'rating',
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="0 - 5"
                  />
                </label>

                {/* Lead Time */}
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    Lead time (days)
                  </span>

                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={form.leadTimeDays}
                    onChange={(e) =>
                      handleFormChange(
                        'leadTimeDays',
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#6f968a] focus:ring-2 focus:ring-[#edf4f1]"
                    placeholder="Days"
                  />
                </label>

                {/* Modal Actions */}
                <div className="flex flex-col-reverse gap-2 border-t border-stone-100 pt-4 sm:col-span-2 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-[#456c60] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#36564d]"
                  >
                    {editingId
                      ? 'Update supplier'
                      : 'Save supplier'}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Suppliers;