import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, PackageCheck, RefreshCw, Search, TriangleAlert } from 'lucide-react';
import authService from '../services/authService';
import stockService from '../services/stockService';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import StockAdjuster from '../components/StockAdjuster';

const StockTracking = () => {
  const user = authService.getCurrentUser();
  const canAdjust = ['ADMIN', 'PHARMACIST'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setItems(await stockService.getAll()); }
    catch (err) { setError(authService.handleError(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    total: items.length,
    optimal: items.filter((i) => i.status === 'OPTIMAL').length,
    low: items.filter((i) => i.status === 'LOW_STOCK').length,
    out: items.filter((i) => i.status === 'OUT_OF_STOCK').length,
  }), [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => (filter === 'ALL' || item.status === filter))
      .filter((item) => !q || [item.medicineName, item.medicineCode, item.category, item.batchNumber, item.supplierName]
        .filter(Boolean).some((value) => String(value).toLowerCase().includes(q)));
  }, [items, filter, search]);

  const updateQuantity = async (item, quantity) => {
    if (!canAdjust || quantity < 0) return;
    setBusyId(item.id); setError(''); setMessage('');
    try {
      const updated = await stockService.updateQuantity(item.id, quantity);
      setItems((current) => current.map((row) => row.id === item.id ? updated : row));
      setMessage(`${updated.medicineName} updated to ${updated.quantity} ${updated.unit}. Alert status was checked automatically.`);
    } catch (err) {
      setError(authService.handleError(err));
    } finally {
      setBusyId(null);
    }
  };

  const refreshAlerts = async () => {
    setError(''); setMessage('');
    try {
      await stockService.refreshAlerts();
      await load();
      setMessage('All medicine stock levels were checked and alerts synchronized.');
    } catch (err) { setError(authService.handleError(err)); }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <p className="eyebrow">Supplier + Alerts integration</p>
          <h1>Medicine Stock Tracking</h1>
          <p>Integration dataset for testing low-stock detection. Quantity changes automatically create, escalate, or resolve alerts.</p>
        </div>
        {canAdjust && <button className="secondary-btn" onClick={refreshAlerts}><RefreshCw size={16} /> Sync alerts</button>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="metric-grid">
        <MetricCard title="Medicine Items" value={counts.total} icon={Boxes} tone="blue" subtitle="Integration stock records" />
        <MetricCard title="Optimal Stock" value={counts.optimal} icon={PackageCheck} tone="emerald" subtitle="Above reorder level" />
        <MetricCard title="Low Stock" value={counts.low} icon={TriangleAlert} tone="amber" subtitle="Reorder required" />
        <MetricCard title="Out of Stock" value={counts.out} icon={TriangleAlert} tone="red" subtitle="Immediate action" />
      </div>

      <div className="content-card">
        <div className="table-toolbar toolbar-wrap">
          <div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicine, batch, supplier..." /></div>
          <div className="filter-tabs">
            {['ALL', 'OPTIMAL', 'LOW_STOCK', 'OUT_OF_STOCK'].map((value) => (
              <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value.replaceAll('_', ' ')}</button>
            ))}
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Medicine</th><th>Category / Batch</th><th>Supplier</th><th>Stock</th><th>Reorder</th><th>Status</th><th>Expiry</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7" className="empty-cell">Loading medicine stock...</td></tr> : visible.length === 0 ? (
                <tr><td colSpan="7" className="empty-cell">No medicine stock matches this filter.</td></tr>
              ) : visible.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.medicineName}</strong><small>{item.medicineCode}</small></td>
                  <td>{item.category || '—'}<small>{item.batchNumber || 'No batch'}</small></td>
                  <td>{item.supplierName || '—'}</td>
                  <td>
                    {canAdjust ? <StockAdjuster quantity={item.quantity} disabled={busyId === item.id} onDecrease={() => updateQuantity(item, item.quantity - 1)} onIncrease={() => updateQuantity(item, item.quantity + 1)} /> : <strong>{item.quantity}</strong>}
                    <small>{item.unit}</small>
                  </td>
                  <td>{item.reorderLevel} <small>{item.unit}</small></td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>{item.expiryDate || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockTracking;
