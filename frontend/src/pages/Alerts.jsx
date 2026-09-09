import React, { useEffect, useMemo, useState } from 'react';
import { BellRing, Check, CircleAlert, RefreshCcw, ShieldAlert, Trash2, TriangleAlert } from 'lucide-react';
import alertService from '../services/alertService';
import authService from '../services/authService';
import stockService from '../services/stockService';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';

const Alerts = () => {
  const user = authService.getCurrentUser();
  const canResolve = ['ADMIN', 'PHARMACIST'].includes(user?.role);
  const canDelete = user?.role === 'ADMIN';
  const [alerts, setAlerts] = useState([]);
  const [stock, setStock] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedStockId, setSelectedStockId] = useState('');

  const load = async () => {
    setError('');
    try {
      const [alertData, stockData] = await Promise.all([alertService.getAll(), stockService.getAll()]);
      setAlerts(alertData); setStock(stockData);
      if (!selectedStockId && stockData.length) setSelectedStockId(String(stockData[0].id));
    } catch (err) { setError(authService.handleError(err)); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => alerts
    .filter((a) => statusFilter === 'ALL' || a.status === statusFilter)
    .filter((a) => typeFilter === 'ALL' || a.type === typeFilter), [alerts, statusFilter, typeFilter]);

  const counts = useMemo(() => ({
    open: alerts.filter((a) => a.status === 'OPEN').length,
    critical: alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length,
    warning: alerts.filter((a) => a.severity === 'WARNING' && a.status !== 'RESOLVED').length,
    resolved: alerts.filter((a) => a.status === 'RESOLVED').length,
  }), [alerts]);

  const act = async (fn, success) => {
    try { setError(''); setMessage(''); await fn(); if (success) setMessage(success); await load(); }
    catch (err) { setError(authService.handleError(err)); }
  };

  const detectSelected = async () => {
    const item = stock.find((row) => String(row.id) === selectedStockId);
    if (!item || !canResolve) return;
    await act(async () => {
      const result = await alertService.detectLowStock([{ medicineId: item.id, medicineName: item.medicineName, currentStock: item.quantity, reorderLevel: item.reorderLevel }]);
      setMessage(`Checked ${item.medicineName}: ${result.lowStock} low, ${result.outOfStock} out of stock, ${result.recovered} recovered.`);
    });
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div><p className="eyebrow">Backend 2 · Alert intelligence</p><h1>Alerts</h1><p>Automatic low-stock and out-of-stock signals with acknowledgement, escalation, and resolution workflow.</p></div>
        <button className="secondary-btn" onClick={load}><RefreshCcw size={16} /> Refresh</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="metric-grid">
        <MetricCard title="Open Alerts" value={counts.open} icon={BellRing} tone="blue" subtitle="Awaiting action" />
        <MetricCard title="Critical Active" value={counts.critical} icon={ShieldAlert} tone="red" subtitle="Highest priority" />
        <MetricCard title="Warnings" value={counts.warning} icon={TriangleAlert} tone="amber" subtitle="Low stock conditions" />
        <MetricCard title="Resolved" value={counts.resolved} icon={Check} tone="emerald" subtitle="Closed events" />
      </div>

      {canResolve && stock.length > 0 && (
        <div className="content-card detector-card">
          <div><h3>Low-stock detector</h3><p>Select a real seeded medicine stock record and run the detector manually. Stock adjustments also trigger this automatically.</p></div>
          <div className="detector-select-row">
            <select value={selectedStockId} onChange={(e) => setSelectedStockId(e.target.value)}>
              {stock.map((item) => <option key={item.id} value={item.id}>{item.medicineName} · {item.quantity}/{item.reorderLevel}</option>)}
            </select>
            <button className="action-btn" type="button" onClick={detectSelected}><CircleAlert size={16} /> Run check</button>
          </div>
        </div>
      )}

      <div className="content-card">
        <div className="table-toolbar toolbar-wrap">
          <div className="filter-tabs">
            {['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'].map((value) => <button key={value} className={statusFilter === value ? 'active' : ''} onClick={() => setStatusFilter(value)}>{value}</button>)}
          </div>
          <select className="compact-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">All alert types</option><option value="LOW_STOCK">Low stock</option><option value="OUT_OF_STOCK">Out of stock</option><option value="EXPIRY">Expiry</option><option value="SUPPLIER_DELAY">Supplier delay</option><option value="SYSTEM">System</option>
          </select>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Alert</th><th>Medicine</th><th>Severity</th><th>Status</th><th>Stock</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan="7" className="empty-cell"><BellRing size={22} /> No alerts for this filter.</td></tr> : filtered.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.title}</strong><small>{a.message}</small></td>
                  <td>{a.medicineName || '—'}<small>{a.type?.replaceAll('_', ' ')}</small></td>
                  <td><StatusBadge status={a.severity} /></td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{a.currentStock == null ? '—' : `${a.currentStock} / ${a.thresholdStock}`}</td>
                  <td>{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}<small>{a.actedBy ? `Action: ${a.actedBy}` : ''}</small></td>
                  <td><div className="row-actions">
                    {a.status === 'OPEN' && <button onClick={() => act(() => alertService.acknowledge(a.id), 'Alert acknowledged.')} title="Acknowledge"><Check size={16} /></button>}
                    {canResolve && a.status !== 'RESOLVED' && <button onClick={() => act(() => alertService.resolve(a.id), 'Alert resolved.')} title="Resolve"><RefreshCcw size={16} /></button>}
                    {canDelete && <button className="danger-icon" onClick={() => window.confirm('Delete this alert?') && act(() => alertService.remove(a.id), 'Alert deleted.')} title="Delete"><Trash2 size={16} /></button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
