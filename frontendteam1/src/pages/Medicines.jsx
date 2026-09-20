import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import MedicineForm from "../components/MedicineForm";
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../services/medicineService";
import { getInventory } from "../services/inventoryService";
import "../styles/Medicines.css";

function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(dateString) - today) / (1000 * 60 * 60 * 24));
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Medicines() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMedicines() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMedicines(token);
      setMedicines(Array.isArray(data) ? data : []);

      const inventoryData = await getInventory(token);
      setInventory(Array.isArray(inventoryData) ? inventoryData : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load medicines. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingMedicine(null);
    setFormOpen(true);
  }

  function openEditForm(medicine) {
    setEditingMedicine(medicine);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingMedicine(null);
  }

  async function handleSave(values) {
    setSaving(true);
    setError(null);
    try {
      if (editingMedicine) {
        const updated = await updateMedicine(editingMedicine.id, values, token);
        setMedicines((prev) =>
          prev.map((m) => (m.id === editingMedicine.id ? { ...m, ...updated } : m))
        );
      } else {
        const created = await createMedicine(values, token);
        setMedicines((prev) => [...prev, created]);
      }
      closeForm();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the medicine.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteMedicine(deleteTarget.id, token);
      setMedicines((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the medicine.");
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    { key: "medicineName", header: "Name" },
    { key: "category", header: "Category" },
    {
      key: "supplier",
      header: "Supplier",
      render: (row) => row.supplier?.name || "—",
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (row) => {
        const stock = inventory.find(
            (item) => item.medicine?.id === row.id
        );

        const quantity = stock?.quantity ?? row.quantity ?? 0;
        const low = Number(quantity) <= 10;

        return (
            <span
                className={
                  low ? "medicine-badge medicine-badge-warning" : undefined
                }
            >
        {quantity}
      </span>
        );
      },
    },
    {
      key: "price",
      header: "Price",
      render: (row) => `₹${Number(row.price).toFixed(2)}`,
    },
    {
      key: "expiryDate",
      header: "Expiry date",
      render: (row) => {
        const days = daysUntil(row.expiryDate);
        const expired = days !== null && days < 0;
        const soon = days !== null && days >= 0 && days <= 30;
        return (
          <span
            className={
              expired
                ? "medicine-badge medicine-badge-danger"
                : soon
                ? "medicine-badge medicine-badge-warning"
                : undefined
            }
          >
            {formatDate(row.expiryDate)}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="medicine-row-actions">
          <Button variant="secondary" size="sm" onClick={() => openEditForm(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="medicines-page">
      <nav className="medicines-navbar">
        <div className="medicines-brand" onClick={() => navigate("/dashboard")}>
          <span className="medicines-logo">Ⓜ️</span>
          <span>MediStock</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard")}>
          ← Back to dashboard
        </Button>
      </nav>

      <main className="medicines-content">
        <div className="medicines-header">
          <div>
            <h1>Medicine inventory</h1>
            <p>Add, edit, and track the medicines in stock.</p>
          </div>
          <Button variant="primary" onClick={openAddForm}>
            + Add medicine
          </Button>
        </div>

        {error && (
          <div className="medicines-alert" role="alert">
            <span>{error}</span>
            <button type="button" onClick={loadMedicines}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="medicines-loading">Loading medicines…</div>
        ) : (
          <DataTable
            columns={columns}
            rows={medicines}
            emptyLabel="No medicines in inventory yet. Add one to get started."
          />
        )}
      </main>

      {formOpen && (
        <MedicineForm
          medicine={editingMedicine}
          onSave={handleSave}
          onCancel={closeForm}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <div className="medicine-form-overlay" role="dialog" aria-modal="true">
          <div className="medicine-form-panel medicine-confirm-panel">
            <h2>Delete {deleteTarget.name}?</h2>
            <p>This removes it from inventory. This can't be undone.</p>
            <div className="medicine-form-actions">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" loading={deleting} onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
