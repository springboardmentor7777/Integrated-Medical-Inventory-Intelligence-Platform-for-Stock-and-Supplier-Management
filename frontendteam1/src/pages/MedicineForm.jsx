import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/MedicineForm.css";


const EMPTY_MEDICINE = {
    medicineName: "",
    category: "",
    supplierId: "",
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    quantity: "",
    price: "",
};


function validate(values) {
    const errors = {};

    if (!values.medicineName.trim()) {
        errors.medicineName =
            "Enter the medicine name.";
    }

    if (!values.category.trim()) {
        errors.category =
            "Enter a category.";
    }

    if (!values.supplierId) {
        errors.supplierId =
            "Select a supplier.";
    }

    if (values.quantity === "" || values.quantity === null) {
        errors.quantity =
            "Enter a quantity.";
    } else if (
        Number(values.quantity) < 0 ||
        !Number.isInteger(Number(values.quantity))
    ) {
        errors.quantity =
            "Quantity must be a whole number, 0 or higher.";
    }

    if (values.price === "" || values.price === null) {
        errors.price =
            "Enter a price.";
    } else if (
        Number(values.price) <= 0
    ) {
        errors.price =
            "Price must be greater than zero.";
    }

    if (!values.expiryDate) {
        errors.expiryDate =
            "Select an expiry date.";
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

    const isEditing =
        Boolean(medicine);


    const [values, setValues] = useState(() => ({
        ...EMPTY_MEDICINE,

        ...(medicine
            ? {
                medicineName:
                    medicine.medicineName || "",

                category:
                    medicine.category || "",

                supplierId:
                    medicine.supplier?.id ||
                    medicine.supplierId ||
                    "",

                batchNumber:
                    medicine.batchNumber || "",

                manufacturingDate:
                    medicine.manufacturingDate || "",

                expiryDate:
                    medicine.expiryDate || "",

                quantity:
                    medicine.quantity ?? "",

                price:
                    medicine.price ?? "",
            }
            : {}),
    }));


    const [suppliers, setSuppliers] =
        useState([]);

    const [supplierLoading, setSupplierLoading] =
        useState(true);

    const [supplierError, setSupplierError] =
        useState("");

    const [errors, setErrors] =
        useState({});


    /* =====================================================
       LOAD SUPPLIERS
       ===================================================== */

    useEffect(() => {

        async function loadSuppliers() {

            try {

                setSupplierLoading(true);
                setSupplierError("");

                const response =
                    await axios.get(
                        "http://localhost:8080/api/suppliers",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                setSuppliers(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

            } catch (error) {

                console.error(
                    "Failed to load suppliers:",
                    error
                );

                setSupplierError(
                    "Could not load suppliers."
                );

            } finally {

                setSupplierLoading(false);

            }
        }


        if (token) {
            loadSuppliers();
        }

    }, [token]);


    /* =====================================================
       CHANGE HANDLER
       ===================================================== */

    function handleChange(
        field,
        value
    ) {

        setValues((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
        }));
    }


    /* =====================================================
       SUBMIT
       ===================================================== */

    function handleSubmit(event) {

        event.preventDefault();

        const validationErrors =
            validate(values);

        setErrors(
            validationErrors
        );

        if (
            Object.keys(
                validationErrors
            ).length > 0
        ) {
            return;
        }

        onSave({

            ...values,

            supplierId:
                Number(
                    values.supplierId
                ),

            quantity:
                Number(
                    values.quantity
                ),

            price:
                Number(
                    values.price
                ),
        });
    }


    return (
        <div
            className="medicine-form-overlay"
            role="dialog"
            aria-modal="true"
        >

            <div className="medicine-form-panel">


                {/* =================================================
                   HEADER
                   ================================================= */}

                <div className="medicine-form-header">

                    <div>

                        <span className="medicine-form-eyebrow">

                            {isEditing
                                ? "UPDATE MEDICINE"
                                : "NEW MEDICINE"}

                        </span>


                        <h2>

                            {isEditing
                                ? "Edit medicine"
                                : "Add medicine"}

                        </h2>


                        <p>

                            {isEditing
                                ? "Update the medicine details below."
                                : "Add a new medicine to your inventory catalog."}

                        </p>

                    </div>


                    <button
                        type="button"
                        className="medicine-form-close"
                        onClick={onCancel}
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>


                {/* =================================================
                   FORM
                   ================================================= */}

                <form
                    onSubmit={handleSubmit}
                    noValidate
                >


                    {/* 1. MEDICINE NAME */}

                    <div className="medicine-field medicine-field-full">

                        <label htmlFor="med-name">
                            Medicine name
                        </label>

                        <input
                            id="med-name"
                            type="text"
                            placeholder="Enter medicine name"
                            value={values.medicineName}
                            onChange={(e) =>
                                handleChange(
                                    "medicineName",
                                    e.target.value
                                )
                            }
                            disabled={saving}
                        />

                        {errors.medicineName && (
                            <p className="medicine-field-error">
                                {errors.medicineName}
                            </p>
                        )}

                    </div>


                    {/* 2. CATEGORY */}

                    <div className="medicine-field medicine-field-full">

                        <label htmlFor="med-category">
                            Category
                        </label>

                        <input
                            id="med-category"
                            type="text"
                            placeholder="e.g. Painkiller"
                            value={values.category}
                            onChange={(e) =>
                                handleChange(
                                    "category",
                                    e.target.value
                                )
                            }
                            disabled={saving}
                        />

                        {errors.category && (
                            <p className="medicine-field-error">
                                {errors.category}
                            </p>
                        )}

                    </div>


                    {/* 3. SUPPLIER */}

                    <div className="medicine-field medicine-field-full">

                        <label htmlFor="med-supplier">
                            Supplier
                        </label>

                        <select
                            id="med-supplier"
                            value={values.supplierId}
                            onChange={(e) =>
                                handleChange(
                                    "supplierId",
                                    e.target.value
                                )
                            }
                            disabled={
                                supplierLoading ||
                                saving
                            }
                        >

                            <option value="">

                                {supplierLoading
                                    ? "Loading suppliers..."
                                    : "Select supplier"}

                            </option>


                            {suppliers.map(
                                (supplier) => (

                                    <option
                                        key={supplier.id}
                                        value={supplier.id}
                                    >
                                        {supplier.name}
                                    </option>

                                )
                            )}

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


                    {/* 4. BATCH NUMBER */}

                    <div className="medicine-field medicine-field-full">

                        <label htmlFor="med-batch">
                            Batch number
                        </label>

                        <input
                            id="med-batch"
                            type="text"
                            placeholder="Enter batch number"
                            value={values.batchNumber}
                            onChange={(e) =>
                                handleChange(
                                    "batchNumber",
                                    e.target.value
                                )
                            }
                            disabled={saving}
                        />

                    </div>


                    {/* 5. MANUFACTURING + EXPIRY */}

                    <div className="medicine-field-row">

                        <div className="medicine-field">

                            <label htmlFor="med-manufacturing">
                                Manufacturing date
                            </label>

                            <input
                                id="med-manufacturing"
                                type="date"
                                value={
                                    values.manufacturingDate
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "manufacturingDate",
                                        e.target.value
                                    )
                                }
                                disabled={saving}
                            />

                        </div>


                        <div className="medicine-field">

                            <label htmlFor="med-expiry">
                                Expiry date
                            </label>

                            <input
                                id="med-expiry"
                                type="date"
                                value={
                                    values.expiryDate
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "expiryDate",
                                        e.target.value
                                    )
                                }
                                disabled={saving}
                            />

                            {errors.expiryDate && (
                                <p className="medicine-field-error">
                                    {errors.expiryDate}
                                </p>
                            )}

                        </div>

                    </div>


                    {/* 6. QUANTITY + PRICE */}

                    <div className="medicine-field-row">

                        <div className="medicine-field">

                            <label htmlFor="med-quantity">
                                Quantity
                            </label>

                            <input
                                id="med-quantity"
                                type="number"
                                min="0"
                                step="1"
                                placeholder="Enter quantity"
                                value={values.quantity}
                                onChange={(e) =>
                                    handleChange(
                                        "quantity",
                                        e.target.value
                                    )
                                }
                                disabled={saving}
                            />

                            {errors.quantity && (
                                <p className="medicine-field-error">
                                    {errors.quantity}
                                </p>
                            )}

                        </div>


                        <div className="medicine-field">

                            <label htmlFor="med-price">
                                Price
                            </label>

                            <div className="medicine-price-wrapper">

                                <span>
                                    ₹
                                </span>

                                <input
                                    id="med-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={values.price}
                                    onChange={(e) =>
                                        handleChange(
                                            "price",
                                            e.target.value
                                        )
                                    }
                                    disabled={saving}
                                />

                            </div>


                            {errors.price && (
                                <p className="medicine-field-error">
                                    {errors.price}
                                </p>
                            )}

                        </div>

                    </div>


                    {/* =================================================
                       ACTIONS
                       ================================================= */}

                    <div className="medicine-form-actions">

                        <button
                            type="button"
                            className="medicine-cancel-button"
                            onClick={onCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="medicine-save-button"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : isEditing
                                    ? "Save changes"
                                    : "Add medicine"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}