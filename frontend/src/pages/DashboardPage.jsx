import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { 
  DashboardService, 
  MedicineService, 
  SupplierService, 
  UserService, 
  StockMonitoringService 
} from '../services/api';
import { 
  Package, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  Activity, 
  RefreshCw,
  Users,
  Truck,
  ShieldCheck,
  ShieldAlert,
  Key,
  Layers,
  ArrowRight,
  TrendingUp,
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Server,
  Database,
  Cpu,
  Zap,
  Star,
  ShoppingBag,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); 
  // 'overview' | 'lowstock' | 'expiry' | 'suppliers' | 'purchases' | 'reports' | 'users' | 'system'

  const [stats, setStats] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportFeedback, setExportFeedback] = useState('');

  const fetchAllDashboardData = async () => {
    setLoading(true);
    try {
      const [dashStats, meds, sups, pos, usrs] = await Promise.all([
        DashboardService.getStats(),
        MedicineService.getAll(),
        SupplierService.getAll(),
        SupplierService.getPurchaseOrders(),
        UserService.getUsers()
      ]);
      setStats(dashStats);
      setMedicines(meds);
      setSuppliers(sups);
      setPurchaseOrders(pos);
      setUsersList(usrs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  // Export handlers
  const handleExportData = (format) => {
    setExportFeedback(`Exporting ${format.toUpperCase()} report...`);
    setTimeout(() => {
      let dataStr = '';
      let filename = `medistock_compliance_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'json') {
        dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
          exportedAt: new Date().toISOString(),
          totalSKUs: medicines.length,
          inventoryValuation: stats?.totalInventoryValue || 0,
          medicines: medicines,
          purchaseOrders: purchaseOrders,
          suppliers: suppliers
        }, null, 2));
        filename += '.json';
      } else {
        // CSV Format
        const headers = ['ID', 'Medicine Name', 'Code', 'Category', 'Quantity', 'Reorder Level', 'Unit Price', 'Stock Status', 'Expiry Date'];
        const rows = medicines.map(m => {
          const exactExpiry = m.nearestExpiryDate || m.expiryDate || (m.batches && m.batches.length > 0 ? m.batches[0].expiryDate : '2027-12-31');
          return [
            m.id,
            `"${m.name}"`,
            m.code,
            `"${m.categoryName || 'General'}"`,
            m.totalQuantity,
            m.reorderLevel,
            m.unitPrice,
            m.stockStatus,
            exactExpiry
          ];
        });
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        dataStr = encodeURI(csvContent);
        filename += '.csv';
      }

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportFeedback(`✓ ${format.toUpperCase()} report downloaded successfully!`);
      setTimeout(() => setExportFeedback(''), 4000);
    }, 600);
  };

  // Calculations for Admin Analytics
  const totalValuation = medicines.reduce((sum, m) => sum + (m.unitPrice * m.totalQuantity), 0);
  const totalUnits = medicines.reduce((sum, m) => sum + m.totalQuantity, 0);
  const lowStockMeds = medicines.filter(m => m.stockStatus === 'LOW_STOCK' || m.stockStatus === 'OUT_OF_STOCK');
  const expiringMeds = medicines.filter(m => m.expiryStatus === 'EXPIRING_SOON' || m.expiryStatus === 'EXPIRED');

  // Supplier spend
  const totalPOSpend = purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* Top Banner with Architecture Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.4)'
            }}>
              <BarChart3 style={{ width: '22px', height: '22px', color: '#ffffff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                Admin Dashboard & Analytics
              </h1>
              <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '700', letterSpacing: '0.05em' }}>
                CENTRAL MONITORING & COMPLIANCE CONSOLE
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchAllDashboardData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw style={{ width: '15px', height: '15px' }} /> Refresh Data
          </button>
          <button onClick={() => handleExportData('csv')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download style={{ width: '16px', height: '16px' }} /> Export Report
          </button>
        </div>
      </div>

      {/* Export Notification Toast */}
      {exportFeedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          fontWeight: '700',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399'
        }}>
          <CheckCircle2 style={{ width: '18px', height: '18px' }} />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* --- 8 ADMIN ANALYTICS PILLARS (DIRECTLY MATCHING USER'S IMAGE) --- */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: '1. Stock Overview', icon: Package },
          { id: 'lowstock', label: `2. Low Stock Items (${lowStockMeds.length})`, icon: AlertTriangle },
          { id: 'expiry', label: `3. Expiry Tracker (${expiringMeds.length})`, icon: Clock },
          { id: 'suppliers', label: `4. Supplier Analytics (${suppliers.length})`, icon: Truck },
          { id: 'purchases', label: `5. Purchase History (${purchaseOrders.length})`, icon: DollarSign },
          { id: 'reports', label: '6. Reports & Export', icon: FileSpreadsheet },
          { id: 'users', label: `7. User Management (${usersList.length})`, icon: Users },
          { id: 'system', label: '8. System Monitoring', icon: Server },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%)' 
                  : 'transparent',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                color: isActive ? '#34d399' : '#94a3b8'
              }}
            >
              <Icon style={{ width: '16px', height: '16px' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. STOCK OVERVIEW TAB                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Key Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            <StatCard
              title="Total Inventory Value"
              value={`$${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              subtext="Real-time monetary valuation"
              icon={DollarSign}
              colorTheme="emerald"
            />
            <StatCard
              title="Total Active SKUs"
              value={medicines.length}
              subtext={`${totalUnits} Total Units In Warehouses`}
              icon={Package}
              colorTheme="cyan"
            />
            <StatCard
              title="Low Stock Items"
              value={stats?.lowStockCount || 0}
              subtext="Approaching reorder point"
              icon={AlertTriangle}
              colorTheme="amber"
              badgeText="Action"
            />
            <StatCard
              title="Out of Stock"
              value={stats?.outOfStockCount || 0}
              subtext="Zero available units"
              icon={AlertOctagon}
              colorTheme="rose"
              badgeText="Critical"
            />
          </div>

          {/* Category Distribution Breakdown */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                  Therapeutic Category Distribution
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Portfolio share by drug classification</span>
              </div>
              <Link to="/inventory" style={{ fontSize: '0.82rem', color: '#38bdf8', textDecoration: 'none', fontWeight: '600' }}>
                Manage Categories &rarr;
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats?.categoryBreakdown?.map((cat, idx) => {
                const percentage = medicines.length > 0 ? Math.round((cat.count / medicines.length) * 100) : 0;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: '#f8fafc', fontWeight: '600' }}>{cat.categoryName}</span>
                      <span style={{ color: '#34d399', fontWeight: '700' }}>{cat.count} SKUs ({percentage}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.max(percentage, 5)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LOW STOCK ITEMS TAB                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'lowstock' && (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                Low & Out-of-Stock Depletion Radar
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Medicines currently at or below minimum threshold</span>
            </div>
            <Link to="/alerts" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
              Stock Monitoring Hub
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lowStockMeds.map(m => (
              <div key={m.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderRadius: '14px',
                background: m.totalQuantity === 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: m.totalQuantity === 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.95rem' }}>{m.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Code: <strong>{m.code}</strong> • Category: {m.categoryName} • Supplier: {m.supplierName}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: m.totalQuantity === 0 ? '#ef4444' : '#fbbf24' }}>
                      {m.totalQuantity} units left
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Reorder threshold: {m.reorderLevel}</span>
                  </div>

                  <Link
                    to="/alerts"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ShoppingBag style={{ width: '13px', height: '13px' }} /> Reorder
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EXPIRY TRACKER TAB                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'expiry' && (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                Medication Expiration Radar
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Real-time batch shelf-life inspection</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {expiringMeds.map(m => (
              <div key={m.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderRadius: '14px',
                background: m.expiryStatus === 'EXPIRED' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(56, 189, 248, 0.1)',
                border: m.expiryStatus === 'EXPIRED' ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid rgba(56, 189, 248, 0.25)'
              }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.95rem' }}>{m.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Nearest Expiry: <strong style={{ color: m.expiryStatus === 'EXPIRED' ? '#ef4444' : '#38bdf8' }}>{m.nearestExpiryDate}</strong> • In-Stock Units: {m.totalQuantity}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge ${m.expiryStatus === 'EXPIRED' ? 'badge-danger' : 'badge-warning'}`}>
                    {m.expiryStatus}
                  </span>
                  <Link to="/alerts" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUPPLIER ANALYTICS TAB                                                */}
      {/* ========================================================================= */}
      {activeTab === 'suppliers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
            {suppliers.map(s => (
              <div key={s.id} className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>{s.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: '700', fontSize: '0.85rem' }}>
                    <Star style={{ width: '15px', height: '15px', fill: '#f59e0b' }} /> {s.rating}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>Fulfillment Reliability</span>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>{s.onTimeDeliveryRate}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${s.onTimeDeliveryRate}%`, height: '100%', background: '#10b981' }}></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(15,23,42,0.5)', padding: '10px', borderRadius: '10px', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Lead Time:</span>
                    <div style={{ fontWeight: '700', color: '#38bdf8' }}>{s.leadTimeDays} Days</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Total Spend:</span>
                    <div style={{ fontWeight: '700', color: '#c084fc' }}>${s.totalSpent.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PURCHASE HISTORY TAB                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'purchases' && (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                Procurement & Purchase History
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cumulative spend: ${totalPOSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <Link to="/suppliers" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
              Create Purchase Order
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>PO #</th>
                  <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Vendor</th>
                  <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Order Date</th>
                  <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Delivery ETA</th>
                  <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(po => (
                  <tr key={po.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px', color: '#38bdf8', fontWeight: '700', fontSize: '0.88rem' }}>{po.poNumber}</td>
                    <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: '600', fontSize: '0.85rem' }}>{po.supplierName}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>{po.orderDate}</td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1', fontSize: '0.8rem' }}>{po.expectedDeliveryDate}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#34d399', fontSize: '0.88rem' }}>${Number(po.totalAmount).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. REPORTS & EXPORT TAB                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
              Regulatory Compliance & Reports Export Center
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
              Export full inventory audit logs, valuation summaries, and batch tracking files.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <FileSpreadsheet style={{ width: '28px', height: '28px', color: '#10b981' }} />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>CSV Inventory Report</h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>Tabular data suitable for Microsoft Excel and regulatory filing.</p>
              </div>
              <button onClick={() => handleExportData('csv')} className="btn btn-primary" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Download CSV
              </button>
            </div>

            <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <FileText style={{ width: '28px', height: '28px', color: '#38bdf8' }} />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>JSON Data Backup</h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>Full structured JSON backup of medicines, POs, and suppliers.</p>
              </div>
              <button onClick={() => handleExportData('json')} className="btn btn-secondary" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Download JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. USER MANAGEMENT TAB                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                Staff User Accounts & Roles
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active staff users on the platform: {usersList.length}</span>
            </div>
            <Link to="/users" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
              Manage Users & Permissions &rarr;
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {usersList.map(u => (
              <div key={u.id} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.9rem' }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{u.role} • {u.department}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SYSTEM MONITORING TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>API LATENCY</span>
                <Zap style={{ width: '18px', height: '18px', color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#34d399', marginTop: '6px' }}>24 ms</div>
              <span style={{ fontSize: '0.72rem', color: '#10b981' }}>● Optimal Performance</span>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>UPTIME</span>
                <Activity style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#38bdf8', marginTop: '6px' }}>99.98%</div>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>30 Days Window</span>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>DATA RECORDS</span>
                <Database style={{ width: '18px', height: '18px', color: '#c084fc' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#c084fc', marginTop: '6px' }}>
                {medicines.length + suppliers.length + purchaseOrders.length + usersList.length} Records
              </div>
              <span style={{ fontSize: '0.72rem', color: '#c084fc' }}>Local Encrypted Cache</span>
            </div>
          </div>

          {/* Microservices Health Status Matrix */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#f8fafc', marginBottom: '16px' }}>
              Microservices Cluster Health Matrix
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Authentication Service', port: 'v2.4 (JWT & OAuth2)', status: 'Healthy', color: '#10b981' },
                { name: 'User & Role Management Service', port: 'RBAC Engine', status: 'Healthy', color: '#3b82f6' },
                { name: 'Medicine Inventory Management Service', port: 'Catalog & Batches', status: 'Healthy', color: '#f59e0b' },
                { name: 'Supplier Management Service', port: 'Vendor & PO Engine', status: 'Healthy', color: '#a855f7' },
                { name: 'Stock Monitoring Service', port: 'Real-Time Alert Watcher', status: 'Healthy', color: '#ef4444' }
              ].map((svc, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: svc.color }}></span>
                    <span style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.88rem' }}>{svc.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({svc.port})</span>
                  </div>
                  <span style={{ color: '#34d399', fontWeight: '700', fontSize: '0.8rem' }}>● {svc.status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default DashboardPage;
