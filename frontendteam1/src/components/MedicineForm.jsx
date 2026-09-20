import { useEffect, useState } from "react";
import Button from "./Button";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const EMPTY_MEDICINE = {
  medicineName: "",
  batchNumber: "",
  category: "",
  supplierId: "",
  quantity: "",
  manufacturingDate: "",
  expiryDate: "",
  price: "",
};

function validate(values) {
  const errors = {};

  if (!values.medicineName.trim()) {
    errors.medicineName = "Enter the medicine name.";
  }

  if (!values.category.trim()) {
    errors.category = "Enter a category.";
  }

  if (!values.supplierId) {
    errors.supplierId = "Select a supplier.";
  }

  if (values.quantity === "" || values.quantity === null) {
    errors.quantity = "Enter a quantity.";
  } else if (
      Number(values.quantity) < 0 ||
      !Number.isInteger(Number(values.quantity))
  ) {
    errors.quantity = "Quantity must be a whole number, 0 or higher.";
  }

  if (values.price === "" || values.price === null) {
    errors.price = "Enter a price.";
  } else if (Number(values.price) <= 0) {
    errors.price = "Price must be greater than zero.";
  }

  if (!values.expiryDate) {
    errors.expiryDate = "Select an expiry date.";
  }

  return errors;
}

export default function MedicineForm({
                                       medicine,
                                       onSave,
                                       onCancel,
                                       saving,
                                     }) {
  const { token } = useAuth();

  const isEditing = Boolean(medicine);

  const [values, setValues] = useState(() => ({
    ...EMPTY_MEDICINE,
    ...(medicine
        ? {
          medicineName: medicine.medicineName || "",
          batchNumber: medicine.batchNumber || "",
          category: medicine.category || "",
          supplierId: medicine.supplier?.id || "",
          quantity: medicine.quantity ?? "",
          manufacturingDate: medicine.manufacturingDate || "",
          expiryDate: medicine.expiryDate || "",
          price: medicine.price ?? "",
        }
        : {}),
  }));

  const [suppliers, setSuppliers] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(true);
  const [supplierError, setSupplierError] = useState("");

  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadSuppliers() {
      try {
        setSupplierLoading(true);
        setSupplierError("");

        const response = await axios.get(
            "http://localhost:8080/api/suppliers",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );

        setSuppliers(response.data);
      } catch (error) {
        console.error("Failed to load suppliers:", error);
        setSupplierError("Could not load suppliers.");
      } finally {
        setSupplierLoading(false);
      }
    }

    if (token) {
      loadSuppliers();
    }
  }, [token]);

  function handleChange(field, value) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validate(values);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSave({
      ...values,
      supplierId: Number(values.supplierId),
      quantity: Number(values.quantity),
      price: Number(values.price),
    });
  }

  return (
      <div className="medicine-form-overlay" role="dialog" aria-modal="true">
        <div className="medicine-form-panel">
          <div className="medicine-form-header">
            <h2>{isEditing ? "Edit medicine" : "Add medicine"}</h2>

            <button
                type="button"
                className="medicine-form-close"
                onClick={onCancel}
                aria-label="Close"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="medicine-field">
              <label htmlFor="med-name">Medicine name</label>

              <input
                  id="med-name"
                  type="text"
                  value={values.medicineName}
                  onChange={(e) =>
                      handleChange("medicineName", e.target.value)
                  }
              />

              {errors.medicineName && (
                  <p className="medicine-field-error">
                    {errors.medicineName}
                  </p>
              )}
            </div>

            <div className="medicine-field-row">
              <div className="medicine-field">
                <label htmlFor="med-category">Category</label>

                <input
                    id="med-category"
                    type="text"
                    placeholder="e.g. Painkiller"
                    value={values.category}
                    onChange={(e) =>
                        handleChange("category", e.target.value)
                    }
                />

                {errors.category && (
                    <p className="medicine-field-error">
                      {errors.category}
                    </p>
                )}
              </div>

              <div className="medicine-field">
                <label htmlFor="med-supplier">Supplier</label>

                <select
                    id="med-supplier"
                    value={values.supplierId}
                    onChange={(e) =>
                        handleChange("supplierId", e.target.value)
                    }
                    disabled={supplierLoading}
                >
                  <option value="">
                    {supplierLoading
                        ? "Loading suppliers..."
                        : "Select supplier"}
                  </option>

                  {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                  ))}
                </select>

                {supplierError && (
                    <p className="medicine-field-error">
                      {supplierError}
                    </p>
                )}

                {errors.supplierId && (
                    <p className="medicine-field-error">
                      {errors.supplierId}
                    </p>
                )}
              </div>
            </div>

            <div className="medicine-field-row">
              <div className="medicine-field">
                <label htmlFor="med-batch">Batch number</label>

                <input
                    id="med-batch"
                    type="text"
                    value={values.batchNumber}
                    onChange={(e) =>
                        handleChange("batchNumber", e.target.value)
                    }
                />
              </div>

              <div className="medicine-field">
                <label htmlFor="med-quantity">Quantity</label>

                <input
                    id="med-quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={values.quantity}
                    onChange={(e) =>
                        handleChange("quantity", e.target.value)
                    }
                />

                {errors.quantity && (
                    <p className="medicine-field-error">
                      {errors.quantity}
                    </p>
                )}
              </div>
            </div>

            <div className="medicine-field-row">
              <div className="medicine-field">
                <label htmlFor="med-price">Price</label>

                <input
                    id="med-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={values.price}
                    onChange={(e) =>
                        handleChange("price", e.target.value)
                    }
                />

                {errors.price && (
                    <p className="medicine-field-error">
                      {errors.price}
                    </p>
                )}
              </div>

              <div className="medicine-field">
                <label htmlFor="med-manufacturing">
                  Manufacturing date
                </label>

                <input
                    id="med-manufacturing"
                    type="date"
                    value={values.manufacturingDate}
                    onChange={(e) =>
                        handleChange("manufacturingDate", e.target.value)
                    }
                />
              </div>
            </div>

            <div className="medicine-field">
              <label htmlFor="med-expiry">Expiry date</label>

              <input
                  id="med-expiry"
                  type="date"
                  value={values.expiryDate}
                  onChange={(e) =>
                      handleChange("expiryDate", e.target.value)
                  }
              />

              {errors.expiryDate && (
                  <p className="medicine-field-error">
                    {errors.expiryDate}
                  </p>
              )}
            </div>

            <div className="medicine-form-actions">
              <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
              >
                Cancel
              </Button>

              <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
              >
                {isEditing ? "Save changes" : "Add medicine"}
              </Button>
            </div>
          </form>
        </div>
      </div>
  );
}