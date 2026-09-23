import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  FileText,
  Package,
  Plus,
  Truck,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import authFetch from "../services/authFetch";
import { useAuth } from "../context/useAuth";
import { getDaysUntilExpiry } from "../utils/expiryUtils";
import "./MainDashboard.css";

const API_URL = "http://localhost:8082/api";

const MainDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      };

      try {
        const [medicineResponse, inventoryResponse] = await Promise.all([
          authFetch(`${API_URL}/medicines`, {
            method: "GET",
            headers,
          }),
          authFetch(`${API_URL}/inventory`, {
            method: "GET",
            headers,
          }),
        ]);

        if (!medicineResponse.ok) {
          throw new Error("Medicine API unavailable");
        }

        const medicineData = await medicineResponse.json();
        const inventoryData = inventoryResponse.ok
          ? await inventoryResponse.json()
          : [];

        setMedicines(Array.isArray(medicineData) ? medicineData : []);
        setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      } catch (err) {
        console.error(err);
        setError(
          "Some dashboard data could not be loaded. Please check the backend."
        );
        setMedicines([]);
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.token]);

  const quantityFor = (medicineId) => {
    const item = inventory.find(
      (entry) => entry.medicineId === medicineId
    );

    return item?.quantity ?? 0;
  };

  const stats = useMemo(() => {
    const totalStock = medicines.reduce(
      (sum, medicine) => sum + quantityFor(medicine.id),
      0
    );

    const lowStock = medicines.filter((medicine) => {
      const quantity = quantityFor(medicine.id);

      return (
        quantity > 0 &&
        medicine.reorderLevel != null &&
        quantity <= medicine.reorderLevel
      );
    }).length;

    const outOfStock = medicines.filter(
      (medicine) => quantityFor(medicine.id) === 0
    ).length;

    const datedMedicines = medicines.filter(
      (medicine) => medicine.expiryDate
    );

    const expired = datedMedicines.filter(
      (medicine) => getDaysUntilExpiry(medicine.expiryDate) < 0
    ).length;

    const expiringSoon = datedMedicines.filter((medicine) => {
      const days = getDaysUntilExpiry(medicine.expiryDate);
      return days >= 0 && days <= 30;
    }).length;

    return {
      totalStock,
      lowStock,
      outOfStock,
      expired,
      expiringSoon,
    };
  }, [medicines, inventory]);

  const categoryData = useMemo(() => {
    const map = {};

    medicines.forEach((medicine) => {
      const category = medicine.category || "Uncategorized";

      map[category] =
        (map[category] || 0) + quantityFor(medicine.id);
    });

    return Object.entries(map).map(([category, stock]) => ({
      category,
      stock,
    }));
  }, [medicines, inventory]);

  const expiryData = [
    {
      name: "Expired",
      value: stats.expired,
    },
    {
      name: "Expiring Soon",
      value: stats.expiringSoon,
    },
    {
      name: "Safe",
      value: Math.max(
        medicines.filter((m) => m.expiryDate).length -
          stats.expired -
          stats.expiringSoon,
        0
      ),
    },
  ];

  return (
    <div className="main-dashboard">
      <main className="dashboard-content">
        <header className="dashboard-topbar">
          <div>
            <p className="eyebrow">MEDICAL INVENTORY MANAGEMENT</p>

            <h1>Dashboard</h1>

            <p className="welcome-text">
              Welcome back, {user?.name || "User"}. Here is your inventory
              overview.
            </p>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              onClick={() => navigate("/alerts")}
              title="Alerts"
            >
              <Bell size={20} />
              <span className="notification-dot" />
            </button>

            <div className="profile-chip">
              <div className="avatar">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{user?.name || "User"}</strong>
                <span>{user?.role || "USER"}</span>
              </div>
            </div>
          </div>
        </header>

        {error && <div className="dashboard-error">{error}</div>}

        <section className="stat-grid">
          <div className="stat-card blue">
            <div className="stat-icon">
              <Package size={21} />
            </div>

            <div>
              <span>Total Medicines</span>
              <strong>{loading ? "—" : medicines.length}</strong>
            </div>
          </div>

          <div className="stat-card teal">
            <div className="stat-icon">
              <Boxes size={21} />
            </div>

            <div>
              <span>Available Stock</span>
              <strong>{loading ? "—" : stats.totalStock}</strong>
            </div>
          </div>

          <div className="stat-card amber">
            <div className="stat-icon">
              <TriangleAlert size={21} />
            </div>

            <div>
              <span>Low Stock</span>
              <strong>{loading ? "—" : stats.lowStock}</strong>
            </div>
          </div>

          <div className="stat-card red">
            <div className="stat-icon">
              <XCircle size={21} />
            </div>

            <div>
              <span>Out of Stock</span>
              <strong>{loading ? "—" : stats.outOfStock}</strong>
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <div>
            <h2>Quick Actions</h2>
            <p>Access the most-used inventory tasks.</p>
          </div>

          <div className="action-buttons">
            <Link
              to="/add-medicine"
              className="action-button primary"
            >
              <Plus size={18} />
              Add Medicine
            </Link>

            <Link
              to="/inventory"
              className="action-button"
            >
              <Boxes size={18} />
              View Inventory
            </Link>

            <Link
              to="/suppliers"
              className="action-button"
            >
              <Truck size={18} />
              Suppliers
            </Link>

            <Link
              to="/expiry-analytics"
              className="action-button"
            >
              <ChartNoAxesCombined size={18} />
              Expiry Analytics
            </Link>
          </div>
        </section>

        <section className="chart-grid">
          <div className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h2>Stock by Category</h2>
                <p>Current quantity across medicine categories</p>
              </div>

              <Link to="/inventory">View inventory</Link>
            </div>

            {categoryData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={categoryData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="stock"
                    fill="#2563eb"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                No inventory data available.
              </div>
            )}
          </div>

          <div className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h2>Expiry Overview</h2>
                <p>
                  Based only on medicines with an actual expiry date
                </p>
              </div>

              <Link to="/expiry-analytics">
                Open analytics
              </Link>
            </div>

            {expiryData.some((item) => item.value > 0) ? (
              <div className="pie-wrap">
                <ResponsiveContainer width="58%" height={250}>
                  <PieChart>
                    <Pie
                      data={expiryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {expiryData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            ["#dc2626", "#f59e0b", "#16a34a"][
                              index
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pie-legend">
                  {expiryData.map((item, index) => (
                    <div key={item.name}>
                      <i
                        style={{
                          background: [
                            "#dc2626",
                            "#f59e0b",
                            "#16a34a",
                          ][index],
                        }}
                      />

                      <span>{item.name}</span>

                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-chart">
                No expiry dates have been provided yet.
              </div>
            )}
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel attention-panel">
            <div className="panel-heading">
              <div>
                <h2>Needs Attention</h2>
                <p>Items that may need action</p>
              </div>
            </div>

            <div className="attention-list">
              {stats.outOfStock > 0 && (
                <button onClick={() => navigate("/inventory")}>
                  <XCircle size={18} />
                  <span>Out-of-stock medicines</span>
                  <strong>{stats.outOfStock}</strong>
                </button>
              )}

              {stats.lowStock > 0 && (
                <button onClick={() => navigate("/inventory")}>
                  <TriangleAlert size={18} />
                  <span>Low-stock medicines</span>
                  <strong>{stats.lowStock}</strong>
                </button>
              )}

              {stats.expired > 0 && (
                <button
                  onClick={() => navigate("/expiry-analytics")}
                >
                  <XCircle size={18} />
                  <span>Expired medicines</span>
                  <strong>{stats.expired}</strong>
                </button>
              )}

              {stats.expiringSoon > 0 && (
                <button
                  onClick={() => navigate("/expiry-analytics")}
                >
                  <Bell size={18} />
                  <span>Expiring within 30 days</span>
                  <strong>{stats.expiringSoon}</strong>
                </button>
              )}

              {!stats.outOfStock &&
                !stats.lowStock &&
                !stats.expired &&
                !stats.expiringSoon && (
                  <div className="all-clear">
                    <ClipboardList size={20} />
                    <span>
                      No current alerts based on available data.
                    </span>
                  </div>
                )}
            </div>
          </div>

          <div className="panel modules-panel">
            <div className="panel-heading">
              <div>
                <h2>Management Modules</h2>
                <p>More areas of the MediStock system</p>
              </div>
            </div>

            <div className="module-grid">
              <Link to="/suppliers">
                <Truck size={20} />
                <span>Supplier Management</span>
                <small>Manage suppliers</small>
              </Link>

              <Link to="/alerts">
                <Bell size={20} />
                <span>Alerts & Notifications</span>
                <small>Review alerts</small>
              </Link>

              <Link to="/reports">
                <FileText size={20} />
                <span>Reports</span>
                <small>View reports</small>
              </Link>

              <Link to="/expiry-analytics">
                <ChartNoAxesCombined size={20} />
                <span>Analytics</span>
                <small>Expiry & stock insights</small>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainDashboard;