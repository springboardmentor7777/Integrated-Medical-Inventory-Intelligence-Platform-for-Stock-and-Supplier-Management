import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/supplierService";
import "../styles/Suppliers.css";

function Suppliers() {
  const { token, user } = useAuth();

  const [suppliers, setSuppliers] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

 const role = user?.role?.toUpperCase();

const canEdit =
  role === "ADMIN" ||
  role === "PHARMACIST";

const canDelete =
  role === "ADMIN";

  useEffect(() => {
    loadSuppliers();
  }, [token]);

  const loadSuppliers = async () => {
    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {

      setLoading(true);
      setError("");

      const data = await getSuppliers(token);
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        setError("Your session is invalid. Please login again.");
      } else if (error.response?.status === 403) {
        setError("You do not have permission to view suppliers.");
      } else {
        setError("Unable to load suppliers.");
      }
    } finally {

      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSupplier((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        const updated = await updateSupplier(
          editingId,
          supplier,
          token
        );

        setSuppliers((prev) =>
          prev.map((item) =>
            item.id === editingId ? updated : item
          )
        );
      } else {
        const created = await addSupplier(
          supplier,
          token
        );

        setSuppliers((prev) => [
          ...prev,
          created,
        ]);
      }

      handleCancel();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError(
          "You do not have permission for this action."
        );
      } else if (error.response?.status === 400) {
        setError("Please check the supplier details.");
      } else {
        setError("Unable to save supplier.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setSupplier({
      name: item.name || "",
      email: item.email || "",
      phone: item.phone || "",
      address: item.address || "",
    });

    setEditingId(item.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!token) {
      setError("Please login again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteSupplier(id, token);

      setSuppliers((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to delete suppliers."
        );
      } else if (error.response?.status === 404) {
        setError("Supplier not found.");
      } else {
        setError("Unable to delete supplier.");
      }
    }
  };

  const handleCancel = () => {
    setSupplier({
      name: "",
      email: "",
      phone: "",
      address: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="supplier-page">

      <div className="supplier-header">
        <div>
          <h1>Supplier Management</h1>
          <p>Manage your medicine suppliers</p>
        </div>

        {canEdit && (
          <button
            className="add-supplier-button"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setError("");
            }}
          >
            + Add Supplier
          </button>
        )}
      </div>


      {showForm && canEdit && (
        <div className="supplier-form-card">

          <h2>
            {editingId
              ? "Edit Supplier"
              : "Add Supplier"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Supplier Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter supplier name"
                value={supplier.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={supplier.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>

              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={supplier.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Address</label>

              <input
                type="text"
                name="address"
                placeholder="Enter address"
                value={supplier.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-buttons">

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Supplier"
                  : "Save Supplier"}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="supplier-table-card">

        <h2>Suppliers</h2>
        {error ? (
            <p className="error-message">
              {error}
            </p>
        ) : loading ? (
          <p className="status-message">
            Loading suppliers...
          </p>
        ) : suppliers.length === 0 ? (
          <p className="empty-message">
            No suppliers found.
          </p>
        ) : (
          <div className="table-container">

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Supplier Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((item) => (
                  <tr key={item.id}>

                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.email || "N/A"}</td>
                    <td>{item.phone || "N/A"}</td>
                    <td>{item.address || "N/A"}</td>

                    <td>
                      {canEdit && (
                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(item)
                          }
                        >
                          Edit
                        </button>
                      )}

                      {canDelete && (
                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                        >
                          Delete
                        </button>
                      )}

                      {!canEdit && !canDelete && (
                        <span>View only</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Suppliers;