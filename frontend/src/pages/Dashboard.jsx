import React, { useEffect, useState } from 'react';
import { BellRing, Boxes, Building2, CircleAlert, PackageCheck, ShieldCheck, TriangleAlert } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import authService from '../services/authService';
import MetricCard from '../components/MetricCard';

const Dashboard = () => {
  const user = authService.getCurrentUser();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getSummary().then(setSummary).catch((err) => setError(authService.handleError(err)));
  }, []);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <p className="eyebrow">Supplier + Alerts operations</p>
          <h1>Welcome, {user?.name}</h1>
          <p>PostgreSQL-backed supplier operations, medicine stock signals, and alert response in one role-protected workspace.</p>
        </div>
        <div className="page-badge"><ShieldCheck size={17} /> {user?.role} · JWT protected</div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="metric-grid">
        <MetricCard title="Total Suppliers" value={summary?.totalSuppliers ?? '—'} icon={Building2} tone="blue" subtitle={`${summary?.activeSuppliers ?? '—'} active`} />
        <MetricCard title="Medicine Items" value={summary?.totalMedicineItems ?? '—'} icon={Boxes} tone="emerald" subtitle={`${summary?.optimalStockItems ?? '—'} optimal`} />
        <MetricCard title="Low Stock" value={summary?.lowStockItems ?? '—'} icon={TriangleAlert} tone="amber" subtitle="Needs replenishment" />
        <MetricCard title="Out of Stock" value={summary?.outOfStockItems ?? '—'} icon={CircleAlert} tone="red" subtitle="Immediate action" />
      </div>

      <div className="dashboard-grid">
        <div className="content-card dashboard-panel">
          <div className="panel-icon warning"><BellRing size={21} /></div>
          <div><span>Open alerts</span><strong>{summary?.openAlerts ?? '—'}</strong><small>{summary?.acknowledgedAlerts ?? '—'} acknowledged</small></div>
        </div>
        <div className="content-card dashboard-panel">
          <div className="panel-icon critical"><CircleAlert size={21} /></div>
          <div><span>Critical active alerts</span><strong>{summary?.criticalActiveAlerts ?? '—'}</strong><small>Out-of-stock and critical operational events</small></div>
        </div>
        <div className="content-card dashboard-panel">
          <div className="panel-icon good"><PackageCheck size={21} /></div>
          <div><span>Healthy stock</span><strong>{summary?.optimalStockItems ?? '—'}</strong><small>Items above reorder level</small></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
