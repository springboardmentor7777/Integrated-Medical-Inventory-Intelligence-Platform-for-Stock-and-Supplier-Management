import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMedicines } from "../services/medicineService";
import "../styles/MedicineSearch.css";

function MedicineSearch() {
  const { token } = useAuth();

  const [medicines, setMedicines] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMedicines(token);

        setMedicines(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setError("Unable to load medicines.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadMedicines();
    }
  }, [token]);

  const categories = useMemo(
    () => [
      ...new Set(
        medicines
          .map((medicine) => medicine.category)
          .filter(Boolean)
      ),
    ],
    [medicines]
  );

  const suppliers = useMemo(
    () => [
      ...new Set(
        medicines
          .map((medicine) => medicine.supplier?.name)
          .filter(Boolean)
      ),
    ],
    [medicines]
  );

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const medicineName = medicine.medicineName || "";
      const batchNumber = medicine.batchNumber || "";
      const medicineCategory = medicine.category || "";
      const supplierName = medicine.supplier?.name || "";

      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        medicineName.toLowerCase().includes(searchValue) ||
        batchNumber.toLowerCase().includes(searchValue) ||
        medicineCategory.toLowerCase().includes(searchValue) ||
        supplierName.toLowerCase().includes(searchValue);

      const matchesCategory =
        !category || medicine.category === category;

      const matchesSupplier =
        !supplier ||
        supplierName.trim().toLowerCase() ===
          supplier.trim().toLowerCase();

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSupplier
      );
    });
  }, [medicines, search, category, supplier]);

  const totalMedicines = medicines.length;

  const totalUnits = medicines.reduce(
    (total, medicine) =>
      total + Number(medicine.quantity || 0),
    0
  );

  const availableMedicines = medicines.filter(
    (medicine) => Number(medicine.quantity || 0) > 0
  ).length;

  const lowStockMedicines = medicines.filter(
    (medicine) => {
      const quantity = Number(medicine.quantity || 0);

      return quantity > 0 && quantity <= 10;
    }
  ).length;

  const getStockStatus = (quantity) => {
    const value = Number(quantity || 0);

    if (value === 0) {
      return {
        label: "Out of Stock",
        className: "stock-empty",
      };
    }

    if (value <= 10) {
      return {
        label: "Low Stock",
        className: "stock-low",
      };
    }

    return {
      label: "Available",
      className: "stock-available",
    };
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) {
      return {
        label: "N/A",
        className: "expiry-normal",
      };
    }

    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const difference =
      (expiry - today) / (1000 * 60 * 60 * 24);

    if (difference < 0) {
      return {
        label: "Expired",
        className: "expiry-danger",
      };
    }

    if (difference <= 30) {
      return {
        label: "Expiring Soon",
        className: "expiry-warning",
      };
    }

    return {
      label: "Valid",
      className: "expiry-normal",
    };
  };

  const getMedicineIcon = (category) => {
    const value = (category || "").toLowerCase();

    if (
      value.includes("cream") ||
      value.includes("ointment") ||
      value.includes("gel")
    ) {
      return "🧴";
    }

    if (
      value.includes("injection") ||
      value.includes("inject")
    ) {
      return "💉";
    }

    if (value.includes("syrup")) {
      return "🧪";
    }

    if (value.includes("capsule")) {
      return "💊";
    }

    if (value.includes("inhaler")) {
      return "🌬️";
    }

    if (
      value.includes("powder") ||
      value.includes("sachet")
    ) {
      return "🧂";
    }

    if (
      value.includes("lozenge") ||
      value.includes("tablet")
    ) {
      return "💊";
    }

    if (
      value.includes("solution") ||
      value.includes("mouthwash")
    ) {
      return "🧴";
    }

    return "⚕️";
  };

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setSupplier("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="medicine-search-page">

      {/* Background decoration */}
      <div className="search-glow search-glow-one"></div>
      <div className="search-glow search-glow-two"></div>
      <div className="search-grid"></div>

      {/* Header */}
      <section className="medicine-search-hero">

        <div className="hero-content">

          <div className="hero-badge">
            <span className="hero-badge-icon">⌕</span>
            MEDICINE INTELLIGENCE
          </div>

          <h1>
            Medicine
            <span> Search Center</span>
          </h1>

          <p>
            Find medicines quickly using medicine name, batch,
            category or supplier.
          </p>

        </div>

        <div className="hero-medical-orb">
          <div className="orb-ring orb-ring-one"></div>
          <div className="orb-ring orb-ring-two"></div>
          <div className="orb-cross">✚</div>
          <span>⚕</span>
        </div>

      </section>

      {/* Statistics */}
      {!loading && !error && (
        <section className="medicine-search-stats">

          <div className="search-stat-card">

            <div className="search-stat-icon purple">
              💊
            </div>

            <div>
              <span>Total Medicines</span>
              <strong>{totalMedicines}</strong>
              <small>Medicine records</small>
            </div>

          </div>

          <div className="search-stat-card">

            <div className="search-stat-icon cyan">
              📦
            </div>

            <div>
              <span>Total Units</span>
              <strong>{totalUnits}</strong>
              <small>Available inventory units</small>
            </div>

          </div>

          <div className="search-stat-card">

            <div className="search-stat-icon green">
              ✓
            </div>

            <div>
              <span>Available</span>
              <strong>{availableMedicines}</strong>
              <small>Currently in stock</small>
            </div>

          </div>

          <div className="search-stat-card">

            <div className="search-stat-icon orange">
              !
            </div>

            <div>
              <span>Low Stock</span>
              <strong>{lowStockMedicines}</strong>
              <small>Needs attention</small>
            </div>

          </div>

        </section>
      )}

      {/* Search panel */}
      <section className="medicine-search-panel">

        <div className="search-panel-heading">

          <div>
            <span className="section-kicker">
              INVENTORY SEARCH
            </span>

            <h2>Find the right medicine</h2>

            <p>
              Search across your medicine inventory and
              narrow results using smart filters.
            </p>
          </div>

          <div className="result-counter">
            <span>RESULTS</span>
            <strong>
              {loading ? "—" : filteredMedicines.length}
            </strong>
          </div>

        </div>

        <div className="medicine-filter-card">

          <div className="search-input-wrapper">

            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search medicine, batch, category or supplier..."
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
            />

            {searchInput && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
              >
                ×
              </button>
            )}

          </div>

          <div className="filter-select-wrapper">

            <span>◈</span>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              <option value="">
                All Categories
              </option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

          <div className="filter-select-wrapper">

            <span>🏢</span>

            <select
              value={supplier}
              onChange={(event) =>
                setSupplier(event.target.value)
              }
            >
              <option value="">
                All Suppliers
              </option>

              {suppliers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

          <button
            className="search-button"
            onClick={handleSearch}
          >
            <span>⌕</span>
            Search
          </button>

          <button
            className="reset-button"
            onClick={handleReset}
            type="button"
          >
            Reset
          </button>

        </div>

        <div className="active-filters">

          <span className="filter-label">
            Active filters:
          </span>

          {search && (
            <span className="filter-chip">
              Search: "{search}"
            </span>
          )}

          {category && (
            <span className="filter-chip">
              Category: {category}
            </span>
          )}

          {supplier && (
            <span className="filter-chip">
              Supplier: {supplier}
            </span>
          )}

          {!search && !category && !supplier && (
            <span className="no-filter">
              Showing all medicines
            </span>
          )}

        </div>

      </section>

      {/* Loading */}
      {loading && (
        <div className="search-status-card">

          <div className="loading-spinner"></div>

          <div>
            <strong>Loading medicine inventory</strong>
            <p>
              Connecting to your medicine database...
            </p>
          </div>

        </div>
      )}

      {/* Error */}
      {error && (
        <div className="search-error-card">

          <span>⚠</span>

          <div>
            <strong>Unable to load medicines</strong>
            <p>{error}</p>
          </div>

        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <section className="medicine-results-section">

          <div className="results-heading">

            <div>
              <span className="section-kicker">
                MEDICINE CATALOG
              </span>

              <h2>
                {search || category || supplier
                  ? "Filtered Medicines"
                  : "Available Medicines"}
              </h2>
            </div>

            <div className="results-meta">
              <span>
                {filteredMedicines.length} result
                {filteredMedicines.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>

          </div>

          {medicines.length === 0 ? (
            <div className="empty-results">

              <div className="empty-icon">
                💊
              </div>

              <h3>No medicines available yet</h3>

              <p>
                Medicine records will appear here once
                they are added to the inventory.
              </p>

            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="empty-results">

              <div className="empty-icon">
                ⌕
              </div>

              <h3>No medicines found</h3>

              <p>
                Try changing your search term or filters.
              </p>

              <button
                className="empty-reset-button"
                onClick={handleReset}
              >
                Clear Filters
              </button>

            </div>
          ) : (
            <div className="medicine-search-table-card">

              <div className="table-scroll">

                <table>

                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Batch</th>
                      <th>Category</th>
                      <th>Supplier</th>
                      <th>Stock</th>
                      <th>Expiry</th>
                      <th>Price</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredMedicines.map(
                      (medicine) => {
                        const stockStatus =
                          getStockStatus(
                            medicine.quantity
                          );

                        const expiryStatus =
                          getExpiryStatus(
                            medicine.expiryDate
                          );

                        return (
                          <tr key={medicine.id}>

                            {/* Medicine */}
                            <td>

                              <div className="medicine-name-cell">

                                <div className="medicine-type-icon">
                                  {getMedicineIcon(
                                    medicine.category
                                  )}
                                </div>

                                <div>
                                  <strong>
                                    {medicine.medicineName ||
                                      "Unnamed Medicine"}
                                  </strong>

                                  <span>
                                    ID #{medicine.id}
                                  </span>
                                </div>

                              </div>

                            </td>

                            {/* Batch */}
                            <td>

                              <span className="batch-badge">
                                {medicine.batchNumber ||
                                  "N/A"}
                              </span>

                            </td>

                            {/* Category */}
                            <td>

                              <span className="category-badge">
                                {medicine.category ||
                                  "Uncategorized"}
                              </span>

                            </td>

                            {/* Supplier */}
                            <td>

                              <div className="supplier-cell">

                                <span className="supplier-avatar">
                                  {(
                                    medicine.supplier?.name ||
                                    "N"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>

                                <span>
                                  {medicine.supplier?.name ||
                                    "N/A"}
                                </span>

                              </div>

                            </td>

                            {/* Stock */}
                            <td>

                              <div className="stock-cell">

                                <strong>
                                  {medicine.quantity ?? 0}
                                </strong>

                                <span
                                  className={
                                    stockStatus.className
                                  }
                                >
                                  {stockStatus.label}
                                </span>

                              </div>

                            </td>

                            {/* Expiry */}
                            <td>

                              <div className="expiry-cell">

                                <strong>
                                  {medicine.expiryDate ||
                                    "N/A"}
                                </strong>

                                <span
                                  className={
                                    expiryStatus.className
                                  }
                                >
                                  {expiryStatus.label}
                                </span>

                              </div>

                            </td>

                            {/* Price */}
                            <td>

                              <span className="price-cell">
                                ₹
                                {Number(
                                  medicine.price || 0
                                ).toFixed(2)}
                              </span>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

              <div className="table-footer">

                <span>
                  Showing{" "}
                  <strong>
                    {filteredMedicines.length}
                  </strong>{" "}
                  of{" "}
                  <strong>{medicines.length}</strong>{" "}
                  medicines
                </span>

                <span className="secure-data">
                  🔒 Inventory data
                </span>

              </div>

            </div>
          )}

        </section>
      )}

      {/* Bottom information strip */}
      {!loading && !error && medicines.length > 0 && (
        <section className="medicine-search-info">

          <div className="info-icon">
            ✦
          </div>

          <div>
            <strong>
              Smart Medicine Lookup
            </strong>

            <p>
              Search by medicine name, batch number,
              category or supplier to quickly locate
              inventory records.
            </p>
          </div>

          <div className="info-stat">
            <span>Categories</span>
            <strong>{categories.length}</strong>
          </div>

          <div className="info-stat">
            <span>Suppliers</span>
            <strong>{suppliers.length}</strong>
          </div>

        </section>
      )}

    </div>
  );
}

export default MedicineSearch;

