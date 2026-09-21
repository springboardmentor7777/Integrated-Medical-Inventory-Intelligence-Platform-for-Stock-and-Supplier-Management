import { useEffect, useId, useMemo, useState } from "react";
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


/* =====================================================
   DATE HELPERS
   ===================================================== */

function daysUntil(dateString) {
  if (!dateString) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(dateString);
  expiry.setHours(0, 0, 0, 0);

  const difference =
      expiry.getTime() - today.getTime();

  return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
  );
}


function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


/* =====================================================
   PROFESSIONAL MEDICINE ILLUSTRATIONS
   ===================================================== */

function MedicineIllustration({ category }) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");

  const value = String(category || "")
      .toLowerCase()
      .trim();

  /*
   * Tablet
   */
  if (value.includes("tablet")) {
    return (
        <svg
            viewBox="0 0 80 80"
            className="medicine-svg"
            role="img"
            aria-label="Tablet medicine"
        >
          <defs>
            <linearGradient
                id={`tablet-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#e9d5ff" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            <linearGradient
                id={`tablet-edge-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>

          <ellipse
              cx="40"
              cy="64"
              rx="23"
              ry="5"
              fill="#6d28d9"
              opacity="0.12"
          />

          <g transform="rotate(-18 40 40)">
            <rect
                x="15"
                y="25"
                width="50"
                height="29"
                rx="14.5"
                fill={`url(#tablet-${uid})`}
                stroke={`url(#tablet-edge-${uid})`}
                strokeWidth="1.7"
            />

            <path
                d="M40 25V54"
                stroke="#8b5cf6"
                strokeWidth="2"
                opacity="0.7"
            />

            <path
                d="M21 33C27 28 33 28 37 30"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.75"
            />

            <ellipse
                cx="29"
                cy="47"
                rx="8"
                ry="2.5"
                fill="#ffffff"
                opacity="0.2"
            />
          </g>
        </svg>
    );
  }


  /*
   * Capsule
   */
  if (value.includes("capsule")) {
    return (
        <svg
            viewBox="0 0 80 80"
            className="medicine-svg"
            role="img"
            aria-label="Capsule medicine"
        >
          <defs>
            <linearGradient
                id={`capsule-left-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#f5f3ff" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>

            <linearGradient
                id={`capsule-right-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>

          <ellipse
              cx="40"
              cy="64"
              rx="22"
              ry="5"
              fill="#6d28d9"
              opacity="0.12"
          />

          <g transform="rotate(-32 40 40)">
            <rect
                x="18"
                y="27"
                width="44"
                height="23"
                rx="11.5"
                fill={`url(#capsule-left-${uid})`}
                stroke="#7c3aed"
                strokeWidth="1.5"
            />

            <path
                d="
              M40 27
              H50.5
              A11.5 11.5 0 0 1 50.5 50
              H40
              Z
            "
                fill={`url(#capsule-right-${uid})`}
            />

            <path
                d="M40 27V50"
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.55"
            />

            <path
                d="M25 32C29 29 34 29 37 31"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.75"
            />
          </g>
        </svg>
    );
  }


  /*
   * Cream / Ointment
   */
  if (
      value.includes("cream") ||
      value.includes("ointment") ||
      value.includes("gel")
  ) {
    return (
        <svg
            viewBox="0 0 80 80"
            className="medicine-svg"
            role="img"
            aria-label="Cream medicine"
        >
          <defs>
            <linearGradient
                id={`cream-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ddd6fe" />
            </linearGradient>

            <linearGradient
                id={`cream-cap-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>

          <ellipse
              cx="40"
              cy="67"
              rx="22"
              ry="4.5"
              fill="#6d28d9"
              opacity="0.12"
          />

          <path
              d="
            M25 25
            H55
            L52 61
            Q51.5 64 48 64
            H32
            Q28.5 64 28 61
            Z
          "
              fill={`url(#cream-${uid})`}
              stroke="#7c3aed"
              strokeWidth="1.7"
          />

          <rect
              x="27"
              y="20"
              width="26"
              height="9"
              rx="3"
              fill={`url(#cream-cap-${uid})`}
          />

          <rect
              x="32"
              y="15"
              width="16"
              height="7"
              rx="2"
              fill="#6d28d9"
          />

          <rect
              x="29"
              y="36"
              width="22"
              height="18"
              rx="2"
              fill="#ede9fe"
          />

          <path
              d="M33 41H47"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeLinecap="round"
          />

          <path
              d="M35 46H45"
              stroke="#c084fc"
              strokeWidth="2"
              strokeLinecap="round"
          />

          <circle
              cx="40"
              cy="50"
              r="2"
              fill="#7c3aed"
              opacity="0.7"
          />
        </svg>
    );
  }


  /*
   * Injection
   */
  if (
      value.includes("injection") ||
      value.includes("inject")
  ) {
    return (
        <svg
            viewBox="0 0 80 80"
            className="medicine-svg"
            role="img"
            aria-label="Injection medicine"
        >
          <defs>
            <linearGradient
                id={`vial-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>

            <linearGradient
                id={`liquid-${uid}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
            >
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>

          <ellipse
              cx="41"
              cy="67"
              rx="24"
              ry="4"
              fill="#0891b2"
              opacity="0.12"
          />

          <g transform="rotate(-25 40 40)">
            {/* vial */}
            <rect
                x="29"
                y="25"
                width="22"
                height="27"
                rx="3"
                fill={`url(#vial-${uid})`}
                stroke="#0891b2"
                strokeWidth="1.5"
            />

            {/* liquid */}
            <path
                d="
              M31 38
              H49
              V49
              Q49 50 48 50
              H32
              Q31 50 31 49
              Z
            "
                fill={`url(#liquid-${uid})`}
            />

            {/* vial top */}
            <rect
                x="31"
                y="21"
                width="18"
                height="7"
                rx="2"
                fill="#bae6fd"
                stroke="#0891b2"
                strokeWidth="1.3"
            />

            <rect
                x="33"
                y="18"
                width="14"
                height="5"
                rx="1.5"
                fill="#64748b"
            />

            {/* label */}
            <rect
                x="33"
                y="31"
                width="14"
                height="7"
                rx="1"
                fill="#ffffff"
                opacity="0.9"
            />

            {/* syringe */}
            <rect
                x="8"
                y="34"
                width="20"
                height="7"
                rx="2"
                fill="#f8fafc"
                stroke="#64748b"
                strokeWidth="1.2"
            />

            <line
                x1="8"
                y1="37.5"
                x2="2"
                y2="37.5"
                stroke="#64748b"
                strokeWidth="1.5"
            />

            <line
                x1="51"
                y1="37.5"
                x2="67"
                y2="37.5"
                stroke="#64748b"
                strokeWidth="1.5"
            />

            <line
                x1="67"
                y1="37.5"
                x2="73"
                y2="37.5"
                stroke="#334155"
                strokeWidth="1"
            />

            <line
                x1="14"
                y1="34"
                x2="14"
                y2="41"
                stroke="#94a3b8"
                strokeWidth="1"
            />
          </g>
        </svg>
    );
  }


  /*
   * Syrup
   */
  if (value.includes("syrup")) {
    return (
        <svg
            viewBox="0 0 80 80"
            className="medicine-svg"
            role="img"
            aria-label="Syrup medicine"
        >
          <defs>
            <linearGradient
                id={`bottle-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>

            <linearGradient
                id={`syrup-${uid}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
            >
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>

          <ellipse
              cx="40"
              cy="67"
              rx="21"
              ry="4.5"
              fill="#7e22ce"
              opacity="0.12"
          />

          {/* bottle */}
          <path
              d="
            M29 26
            H51
            V59
            Q51 63 47 64
            H33
            Q29 63 29 59
            Z
          "
              fill={`url(#bottle-${uid})`}
              stroke="#7c3aed"
              strokeWidth="1.7"
          />

          {/* liquid */}
          <path
              d="
            M31 43
            H49
            V58
            Q49 61 46 61
            H34
            Q31 61 31 58
            Z
          "
              fill={`url(#syrup-${uid})`}
              opacity="0.88"
          />

          {/* neck */}
          <rect
              x="33"
              y="18"
              width="14"
              height="10"
              rx="2"
              fill="#ddd6fe"
              stroke="#7c3aed"
              strokeWidth="1.3"
          />

          {/* cap */}
          <rect
              x="31"
              y="12"
              width="18"
              height="8"
              rx="2"
              fill="#6d28d9"
          />

          {/* label */}
          <rect
              x="32"
              y="31"
              width="16"
              height="11"
              rx="2"
              fill="#ffffff"
              opacity="0.95"
          />

          <path
              d="M35 35H45"
              stroke="#8b5cf6"
              strokeWidth="1.7"
              strokeLinecap="round"
          />

          <path
              d="M37 38H43"
              stroke="#c084fc"
              strokeWidth="1.5"
              strokeLinecap="round"
          />
        </svg>
    );
  }


  /*
   * Inhaler
   */
  if (value.includes("inhaler")) {
    return (
        <svg
            viewBox="0 0 80 80"
            className="medicine-svg"
            role="img"
            aria-label="Inhaler medicine"
        >
          <defs>
            <linearGradient
                id={`inhaler-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
          </defs>

          <ellipse
              cx="40"
              cy="67"
              rx="21"
              ry="4"
              fill="#0284c7"
              opacity="0.12"
          />

          {/* main body */}
          <rect
              x="27"
              y="23"
              width="25"
              height="37"
              rx="5"
              fill={`url(#inhaler-${uid})`}
              stroke="#0284c7"
              strokeWidth="1.7"
          />

          {/* top canister */}
          <rect
              x="32"
              y="15"
              width="15"
              height="12"
              rx="3"
              fill="#0ea5e9"
          />

          <rect
              x="34"
              y="12"
              width="11"
              height="5"
              rx="2"
              fill="#0369a1"
          />

          {/* mouthpiece */}
          <path
              d="M33 59H47V65H33Q30 65 30 62Q30 59 33 59Z"
              fill="#64748b"
          />

          {/* front display */}
          <circle
              cx="39.5"
              cy="40"
              r="7"
              fill="#e0f2fe"
              stroke="#38bdf8"
              strokeWidth="1.5"
          />

          <path
              d="M36 40H43"
              stroke="#0284c7"
              strokeWidth="1.8"
              strokeLinecap="round"
          />

          <path
              d="M39.5 36.5V43.5"
              stroke="#0284c7"
              strokeWidth="1.8"
              strokeLinecap="round"
          />
        </svg>
    );
  }


  /*
   * Powder / Sachet
   */
  if (value.includes("powder") || value.includes("sachet")) {
    return (
        <svg
            viewBox="0 0 80 80"
            className="medicine-svg"
            role="img"
            aria-label="Powder sachet"
        >
          <defs>
            <linearGradient
                id={`sachet-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ede9fe" />
            </linearGradient>
          </defs>

          <ellipse
              cx="40"
              cy="66"
              rx="22"
              ry="4"
              fill="#7c3aed"
              opacity="0.12"
          />

          <path
              d="
            M23 18
            H57
            L54 61
            Q53.5 64 50 64
            H30
            Q26.5 64 26 61
            Z
          "
              fill={`url(#sachet-${uid})`}
              stroke="#7c3aed"
              strokeWidth="1.7"
          />

          {/* sealed edges */}
          <path
              d="M24 23H56"
              stroke="#c4b5fd"
              strokeWidth="2"
          />

          <path
              d="M27 58H53"
              stroke="#c4b5fd"
              strokeWidth="2"
          />

          {/* medicine symbol */}
          <circle
              cx="40"
              cy="39"
              r="10"
              fill="#ede9fe"
              stroke="#8b5cf6"
              strokeWidth="1.5"
          />

          <path
              d="M35 39H45"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
          />

          <path
              d="M40 34V44"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
          />

          <path
              d="M32 49H48"
              stroke="#c084fc"
              strokeWidth="2"
              strokeLinecap="round"
          />
        </svg>
    );
  }


  /*
   * Lozenge
   */
  if (value.includes("lozenge")) {
    return (
        <svg
            viewBox="0 0 80 80"
            className="medicine-svg"
            role="img"
            aria-label="Lozenge medicine"
        >
          <defs>
            <linearGradient
                id={`lozenge-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          <ellipse
              cx="40"
              cy="65"
              rx="21"
              ry="4"
              fill="#7e22ce"
              opacity="0.12"
          />

          <g transform="rotate(-12 40 40)">
            <path
                d="
              M40 17
              C50 17 57 25 57 36
              C57 47 50 56 40 63
              C30 56 23 47 23 36
              C23 25 30 17 40 17
              Z
            "
                fill={`url(#lozenge-${uid})`}
                stroke="#7e22ce"
                strokeWidth="1.7"
            />

            <path
                d="M30 29C35 24 44 24 50 29"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.55"
            />

            <circle
                cx="40"
                cy="43"
                r="4"
                fill="#ffffff"
                opacity="0.45"
            />
          </g>
        </svg>
    );
  }


  /*
   * Solution
   */
  if (value.includes("solution") || value.includes("mouthwash")) {
    return (
        <svg
            viewBox="0 0 80 80"
            className="medicine-svg"
            role="img"
            aria-label="Solution medicine"
        >
          <defs>
            <linearGradient
                id={`solution-bottle-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ccfbf1" />
            </linearGradient>

            <linearGradient
                id={`solution-liquid-${uid}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
            >
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>

          <ellipse
              cx="40"
              cy="67"
              rx="21"
              ry="4"
              fill="#0f766e"
              opacity="0.12"
          />

          <path
              d="
            M28 25
            H52
            V59
            Q52 63 48 64
            H32
            Q28 63 28 59
            Z
          "
              fill={`url(#solution-bottle-${uid})`}
              stroke="#0f766e"
              strokeWidth="1.7"
          />

          {/* liquid */}
          <path
              d="
            M30 43
            H50
            V58
            Q50 61 47 61
            H33
            Q30 61 30 58
            Z
          "
              fill={`url(#solution-liquid-${uid})`}
          />

          {/* cap */}
          <rect
              x="32"
              y="14"
              width="16"
              height="13"
              rx="3"
              fill="#0f766e"
          />

          <rect
              x="35"
              y="11"
              width="10"
              height="5"
              rx="1.5"
              fill="#115e59"
          />

          {/* label */}
          <rect
              x="32"
              y="31"
              width="16"
              height="11"
              rx="2"
              fill="#ffffff"
              opacity="0.95"
          />

          <path
              d="M35 35H45"
              stroke="#0f766e"
              strokeWidth="1.7"
              strokeLinecap="round"
          />

          <path
              d="M37 38H43"
              stroke="#5eead4"
              strokeWidth="1.5"
              strokeLinecap="round"
          />
        </svg>
    );
  }


  /*
   * Default
   */
  return (
      <svg
          viewBox="0 0 80 80"
          className="medicine-svg"
          role="img"
          aria-label="Medicine"
      >
        <defs>
          <linearGradient
              id={`default-${uid}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </linearGradient>
        </defs>

        <ellipse
            cx="40"
            cy="65"
            rx="22"
            ry="5"
            fill="#6d28d9"
            opacity="0.12"
        />

        <rect
            x="16"
            y="27"
            width="48"
            height="24"
            rx="12"
            fill={`url(#default-${uid})`}
            stroke="#7c3aed"
            strokeWidth="1.7"
        />

        <path
            d="M40 28V50"
            stroke="#8b5cf6"
            strokeWidth="2"
        />

        <path
            d="M22 33C27 29 33 29 37 31"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
        />
      </svg>
  );
}


/* =====================================================
   MAIN COMPONENT
   ===================================================== */

export default function Medicines() {
  const { token, user } = useAuth();
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

  const role = user?.role?.toUpperCase();

  const canEdit =
      role === "ADMIN" ||
      role === "PHARMACIST";

  const canDelete =
      role === "ADMIN";


  /* =====================================================
     LOAD DATA
     ===================================================== */

  useEffect(() => {
    loadMedicines();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  async function loadMedicines() {
    setLoading(true);
    setError(null);

    try {
      const medicineData =
          await getMedicines(token);

      setMedicines(
          Array.isArray(medicineData)
              ? medicineData
              : []
      );

      try {
        const inventoryData =
            await getInventory(token);

        setInventory(
            Array.isArray(inventoryData)
                ? inventoryData
                : []
        );
      } catch (inventoryError) {
        console.error(
            "Inventory loading error:",
            inventoryError
        );

        setInventory([]);
      }

    } catch (err) {
      console.error(err);

      setError(
          err.response?.data?.message ||
          "Could not load medicines. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }


  /* =====================================================
     FORM HANDLERS
     ===================================================== */

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
        const updated =
            await updateMedicine(
                editingMedicine.id,
                values,
                token
            );

        setMedicines((prev) =>
            prev.map((medicine) =>
                medicine.id === editingMedicine.id
                    ? {
                      ...medicine,
                      ...updated,
                    }
                    : medicine
            )
        );

      } else {
        const created =
            await createMedicine(
                values,
                token
            );

        setMedicines((prev) => [
          ...prev,
          created,
        ]);
      }

      closeForm();

    } catch (err) {
      console.error(err);

      setError(
          err.response?.data?.message ||
          "Could not save the medicine."
      );
    } finally {
      setSaving(false);
    }
  }


  /* =====================================================
     DELETE
     ===================================================== */

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteMedicine(
          deleteTarget.id,
          token
      );

      setMedicines((prev) =>
          prev.filter(
              (medicine) =>
                  medicine.id !== deleteTarget.id
          )
      );

      setDeleteTarget(null);

    } catch (err) {
      console.error(err);

      setError(
          err.response?.data?.message ||
          "Could not delete the medicine."
      );
    } finally {
      setDeleting(false);
    }
  }


  /* =====================================================
     DASHBOARD CALCULATIONS
     ===================================================== */

  const totalMedicines =
      medicines.length;


  const totalUnits = useMemo(() => {
    return medicines.reduce(
        (total, medicine) => {
          const stock =
              inventory.find(
                  (item) =>
                      item.medicine?.id ===
                      medicine.id
              );

          const quantity =
              stock?.quantity ??
              medicine.quantity ??
              0;

          return (
              total +
              Number(quantity)
          );
        },
        0
    );
  }, [medicines, inventory]);


  const lowStockCount = useMemo(() => {
    return medicines.filter(
        (medicine) => {
          const stock =
              inventory.find(
                  (item) =>
                      item.medicine?.id ===
                      medicine.id
              );

          const quantity =
              Number(
                  stock?.quantity ??
                  medicine.quantity ??
                  0
              );

          return (
              quantity > 0 &&
              quantity <= 30
          );
        }
    ).length;
  }, [medicines, inventory]);


  const expiredCount = useMemo(() => {
    return medicines.filter(
        (medicine) => {
          const days =
              daysUntil(
                  medicine.expiryDate
              );

          return (
              days !== null &&
              days < 0
          );
        }
    ).length;
  }, [medicines]);


  const expiringSoonCount = useMemo(() => {
    return medicines.filter(
        (medicine) => {
          const days =
              daysUntil(
                  medicine.expiryDate
              );

          return (
              days !== null &&
              days >= 0 &&
              days <= 30
          );
        }
    ).length;
  }, [medicines]);


  const categoriesCount =
      new Set(
          medicines
              .map(
                  (medicine) =>
                      medicine.category
              )
              .filter(Boolean)
      ).size;


  /* =====================================================
     TABLE COLUMNS
     ===================================================== */

  const columns = [
    {
      key: "medicineName",

      header: "Medicine",

      render: (row) => (
          <div className="medicine-name-cell">

            <div className="medicine-mini-icon">
              <MedicineIllustration
                  category={row.category}
              />
            </div>

            <div className="medicine-name-info">

              <strong className="medicine-name">
                {row.medicineName}
              </strong>

              <span className="medicine-subtext">
              ID #{row.id}
            </span>

            </div>

          </div>
      ),
    },


    {
      key: "category",

      header: "Category",

      render: (row) => (
          <span className="medicine-category">
          {row.category || "General"}
        </span>
      ),
    },


    {
      key: "supplier",

      header: "Supplier",

      render: (row) => (
          <div className="medicine-supplier">

            <span className="supplier-dot"></span>

            {row.supplier?.name || "—"}

          </div>
      ),
    },


    {
      key: "quantity",

      header: "Stock",

      render: (row) => {
        const stock =
            inventory.find(
                (item) =>
                    item.medicine?.id ===
                    row.id
            );

        const quantity =
            Number(
                stock?.quantity ??
                row.quantity ??
                0
            );

        let statusClass =
            "stock-normal";

        if (quantity === 0) {
          statusClass =
              "stock-empty";
        } else if (quantity <= 30) {
          statusClass =
              "stock-low";
        }

        return (
            <div className="medicine-stock-cell">

              <strong>
                {quantity}
              </strong>

              <span
                  className={
                    `stock-status-dot ${statusClass}`
                  }
              ></span>

            </div>
        );
      },
    },


    {
      key: "price",

      header: "Price",

      render: (row) => (
          <span className="medicine-price">
          ₹
            {Number(
                row.price || 0
            ).toFixed(2)}
        </span>
      ),
    },


    {
      key: "expiryDate",

      header: "Expiry",

      render: (row) => {
        const days =
            daysUntil(
                row.expiryDate
            );

        const expired =
            days !== null &&
            days < 0;

        const soon =
            days !== null &&
            days >= 0 &&
            days <= 30;

        return (
            <div className="medicine-expiry-cell">

            <span
                className={
                  expired
                      ? "medicine-badge medicine-badge-danger"
                      : soon
                          ? "medicine-badge medicine-badge-warning"
                          : "medicine-badge medicine-badge-safe"
                }
            >
              {formatDate(
                  row.expiryDate
              )}
            </span>

              {expired && (
                  <small>
                    Expired
                  </small>
              )}

              {!expired && soon && (
                  <small>
                    Expires soon
                  </small>
              )}

            </div>
        );
      },
    },

{
  key: "actions",

  header: "Actions",

  render: (row) => (
      <div className="medicine-row-actions">

        <Button
            variant="secondary"
            size="sm"
            onClick={() =>
                openEditForm(row)
            }
        >
          Edit
        </Button>

        <Button
            variant="danger"
            size="sm"
            onClick={() =>
                setDeleteTarget(row)
            }
        >
          Delete
        </Button>

      </div>
  ),
},


  ];


  /* =====================================================
     RENDER
     ===================================================== */

  return (
      <div className="medicines-page">

        {/* BACKGROUND */}

        <div className="medicines-bg-orb medicines-bg-orb-one"></div>
        <div className="medicines-bg-orb medicines-bg-orb-two"></div>
        <div className="medicines-bg-orb medicines-bg-orb-three"></div>

        <div className="medicines-floating-icon medicine-float-one">
          💊
        </div>

        <div className="medicines-floating-icon medicine-float-two">
          🧬
        </div>

        <div className="medicines-floating-icon medicine-float-three">
          🩺
        </div>

        <div className="medicines-floating-icon medicine-float-four">
          ⚕️
        </div>


        {/* NAVIGATION */}

        <nav className="medicines-navbar">

          <div
              className="medicines-brand"
              onClick={() =>
                  navigate("/dashboard")
              }
          >

          <span className="medicines-logo">
            Ⓜ️
          </span>

            <div>
              <strong>
                MediStock
              </strong>

              <span>
              Healthcare Intelligence
            </span>
            </div>

          </div>


          <div className="medicines-nav-right">

            <div className="medicines-user-pill">

              <div className="medicines-user-avatar">
                {user?.name
                    ? user.name
                        .charAt(0)
                        .toUpperCase()
                    : "U"}
              </div>

              <div>

                <strong>
                  {user?.name || "User"}
                </strong>

                <span>
                {user?.role || "Staff"}
              </span>

              </div>

            </div>


            <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                    navigate("/dashboard")
                }
            >
              ← Dashboard
            </Button>

          </div>

        </nav>


        <main className="medicines-content">


          {/* HERO */}

          <section className="medicines-hero">

            <div className="medicines-hero-content">

              <div className="medicines-eyebrow">

                <span className="live-indicator"></span>

                MEDICINE INTELLIGENCE CENTER

              </div>


              <h1>
                Medicine
                <span>
                Control Center
              </span>
              </h1>


              <p>
                Monitor medicines, stock levels,
                expiry intelligence and supplier
                relationships from one place.
              </p>


              <div className="medicines-hero-actions">

                {canEdit && (
                    <Button
                        variant="primary"
                        onClick={openAddForm}
                    >
                  <span className="add-button-icon">
                    +
                  </span>

                      Add Medicine
                    </Button>
                )}


                <button
                    className="medicines-refresh-button"
                    onClick={loadMedicines}
                    disabled={loading}
                >

                <span
                    className={
                      loading
                          ? "refresh-icon spinning"
                          : "refresh-icon"
                    }
                >
                  ↻
                </span>

                  {loading
                      ? "Syncing..."
                      : "Sync Inventory"}

                </button>

              </div>

            </div>


            {/* HERO VISUAL */}

            <div className="medicines-hero-visual">

              <div className="hero-medical-orbit orbit-one"></div>
              <div className="hero-medical-orbit orbit-two"></div>

              <div className="hero-medical-core">
                💊
              </div>

              <div className="hero-data-chip chip-one">

              <span>
                STOCK
              </span>

                <strong>
                  {loading
                      ? "..."
                      : totalUnits}
                </strong>

              </div>

              <div className="hero-data-chip chip-two">

              <span>
                CATALOG
              </span>

                <strong>
                  {loading
                      ? "..."
                      : totalMedicines}
                </strong>

              </div>

            </div>

          </section>


          {/* INTELLIGENCE CARDS */}

          <section className="medicine-intelligence-grid">

            <div className="medicine-intel-card intel-purple">

              <div className="intel-icon">
                💊
              </div>

              <div>
              <span>
                TOTAL MEDICINES
              </span>

                <strong>
                  {loading
                      ? "..."
                      : totalMedicines}
                </strong>
              </div>

              <div className="intel-decoration">
                +
              </div>

            </div>


            <div className="medicine-intel-card intel-blue">

              <div className="intel-icon">
                📦
              </div>

              <div>
              <span>
                TOTAL UNITS
              </span>

                <strong>
                  {loading
                      ? "..."
                      : totalUnits}
                </strong>
              </div>

              <div className="intel-decoration">
                ↗
              </div>

            </div>


            <div className="medicine-intel-card intel-orange">

              <div className="intel-icon">
                ⚠️
              </div>

              <div>
              <span>
                LOW STOCK
              </span>

                <strong>
                  {loading
                      ? "..."
                      : lowStockCount}
                </strong>
              </div>

              <div className="intel-decoration">
                !
              </div>

            </div>


            <div className="medicine-intel-card intel-red">

              <div className="intel-icon">
                ⏳
              </div>

              <div>
              <span>
                EXPIRY ALERTS
              </span>

                <strong>
                  {loading
                      ? "..."
                      : expiredCount +
                      expiringSoonCount}
                </strong>
              </div>

              <div className="intel-decoration">
                !
              </div>

            </div>

          </section>


          {/* HEALTH STRIP */}

          {!loading &&
              medicines.length > 0 && (

                  <section className="medicine-health-strip">

                    <div className="health-strip-title">

                      <span className="health-pulse"></span>

                      <div>

                        <strong>
                          Inventory Intelligence
                        </strong>

                        <span>
                    Live medicine catalog analysis
                  </span>

                      </div>

                    </div>


                    <div className="health-strip-metrics">

                      <div>
                        <strong>
                          {categoriesCount}
                        </strong>

                        <span>
                    Categories
                  </span>
                      </div>


                      <div>
                        <strong>
                          {expiringSoonCount}
                        </strong>

                        <span>
                    Expiring ≤ 30 days
                  </span>
                      </div>


                      <div>
                        <strong>
                          {expiredCount}
                        </strong>

                        <span>
                    Expired
                  </span>
                      </div>

                    </div>

                  </section>

              )}


          {/* MEDICINE CATALOG */}

          <section className="medicines-catalog-section">

            <div className="catalog-header">

              <div>

                <p className="catalog-label">
                  LIVE CATALOG
                </p>

                <h2>
                  Medicine Inventory
                </h2>

                <p>
                  Complete medicine records,
                  stock information and expiry
                  monitoring.
                </p>

              </div>


              <div className="catalog-count">

                <strong>
                  {loading
                      ? "..."
                      : medicines.length}
                </strong>

                <span>
                records
              </span>

              </div>

            </div>


            {/* ERROR */}

            {error && (

                <div
                    className="medicines-alert"
                    role="alert"
                >

                  <div className="alert-icon">
                    !
                  </div>

                  <div>

                    <strong>
                      Synchronization issue
                    </strong>

                    <span>
                  {error}
                </span>

                  </div>

                  <button
                      type="button"
                      onClick={loadMedicines}
                  >
                    Retry
                  </button>

                </div>

            )}


            {/* LOADING */}

            {loading ? (

                <div className="medicines-loading">

                  <div className="medicine-loading-orbit">
                    <div></div>
                  </div>

                  <strong>
                    Synchronizing medicine intelligence...
                  </strong>

                  <span>
                Connecting to MediStock inventory services
              </span>

                </div>

            ) : (

                <div className="medicine-table-shell">

                  <DataTable
                      columns={columns}
                      rows={medicines}
                      emptyLabel={
                        "No medicines in inventory yet. Add one to get started."
                      }
                  />

                </div>

            )}

          </section>

        </main>


        {/* MEDICINE FORM */}

        {formOpen && (

            <MedicineForm
                medicine={editingMedicine}
                onSave={handleSave}
                onCancel={closeForm}
                saving={saving}
            />

        )}


        {/* DELETE CONFIRMATION */}

        {deleteTarget && (

            <div
                className="medicine-form-overlay"
                role="dialog"
                aria-modal="true"
            >

              <div className="medicine-form-panel medicine-confirm-panel">

                <div className="delete-warning-icon">
                  🗑️
                </div>

                <p className="delete-eyebrow">
                  DESTRUCTIVE ACTION
                </p>

                <h2>
                  Delete{" "}
                  {deleteTarget.medicineName ||
                      "this medicine"}?
                </h2>

                <p>
                  This medicine record will be
                  permanently removed from the
                  inventory system. This action
                  cannot be undone.
                </p>

                <div className="medicine-delete-preview">

              <span>
                MEDICINE
              </span>

                  <strong>
                    {deleteTarget.medicineName}
                  </strong>

                  <small>
                    ID #{deleteTarget.id}
                  </small>

                </div>

                <div className="medicine-form-actions">

                  <Button
                      variant="secondary"
                      onClick={() =>
                          setDeleteTarget(null)
                      }
                  >
                    Cancel
                  </Button>

                  <Button
                      variant="danger"
                      loading={deleting}
                      onClick={confirmDelete}
                  >
                    Delete Medicine
                  </Button>

                </div>

              </div>

            </div>

        )}

      </div>
  );
}