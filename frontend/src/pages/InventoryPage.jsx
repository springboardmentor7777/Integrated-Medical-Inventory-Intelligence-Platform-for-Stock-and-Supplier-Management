import React, { useState, useEffect } from 'react';
import { MedicineService, SupplierService } from '../services/api';
import { MedicineModal } from '../components/MedicineModal';
import { ViewMedicineModal } from '../components/ViewMedicineModal';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Package, 
  RefreshCw, 
  AlertCircle, 
  Layers, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight,
  Pill,
  Box,
  Minus,
  AlertTriangle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const InventoryPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'categories' | 'batches'
  
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState(searchParams.get('stockStatus') || 'ALL');
  const [expiryStatusFilter, setExpiryStatusFilter] = useState(searchParams.get('expiryStatus') || 'ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Category Modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', code: '', description: '', storage: 'Room Temperature (15-25°C)' });

  // Add Batch Modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchTargetMedId, setBatchTargetMedId] = useState('');
  const [batchForm, setBatchForm] = useState({
    batchNumber: '',
    quantity: 100,
    mfgDate: '2025-01-01',
    expiryDate: '2027-12-31',
    purchasePrice: 12.50
  });

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [meds, cats, sups] = await Promise.all([
        MedicineService.getAll({
          search: searchTerm,
          categoryId: categoryFilter,
          stockStatus: stockStatusFilter,
          expiryStatus: expiryStatusFilter
        }),
        MedicineService.getCategories(),
        SupplierService.getAll()
      ]);
      setMedicines(meds);
      setCategories(cats);
      setSuppliers(sups);
      if (meds.length > 0 && !batchTargetMedId) {
        setBatchTargetMedId(meds[0].id);
      }
    } catch (err) {
      showToast('error', 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [searchTerm, categoryFilter, stockStatusFilter, expiryStatusFilter]);

  const handleSaveMedicine = async (formData) => {
    try {
      if (selectedMedicine && isAddModalOpen) {
        await MedicineService.update(selectedMedicine.id, formData);
        showToast('success', `Updated ${formData.name}`);
      } else {
        await MedicineService.create(formData);
        showToast('success', `Added ${formData.name} to inventory!`);
      }
      setIsAddModalOpen(false);
      fetchAllData();
    } catch (err) {
      showToast('error', 'Failed to save medicine');
    }
  };

  // Quick inline stock adjustment for interview demo
  const handleQuickStockStep = async (med, delta) => {
    const newQty = Math.max(0, med.totalQuantity + delta);
    try {
      await MedicineService.update(med.id, {
        totalQuantity: newQty
      });
      showToast('success', `${med.name} stock updated: ${med.totalQuantity} → ${newQty} units`);
      fetchAllData();
    } catch (err) {
      showToast('error', 'Failed to adjust stock');
    }
  };

  // Quick inline scenario preset (Out of stock, Low stock, Expiring soon, Expired)
  const handleQuickRowScenario = async (med, scenario) => {
    let updatePayload = {};
    if (scenario === 'ZERO') {
      updatePayload = { totalQuantity: 0, stockStatus: 'OUT_OF_STOCK' };
    } else if (scenario === 'LOW') {
      const lowVal = Math.max(1, Math.floor(med.reorderLevel / 2));
      updatePayload = { totalQuantity: lowVal, stockStatus: 'LOW_STOCK' };
    } else if (scenario === 'EXP_SOON') {
      const soonDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      updatePayload = { nearestExpiryDate: soonDate, expiryStatus: 'EXPIRING_SOON' };
    } else if (scenario === 'EXPIRED') {
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      updatePayload = { nearestExpiryDate: pastDate, expiryStatus: 'EXPIRED' };
    } else if (scenario === 'RESET') {
      updatePayload = { totalQuantity: 150, stockStatus: 'IN_STOCK', nearestExpiryDate: '2028-06-30', expiryStatus: 'VALID' };
    }

    try {
      await MedicineService.update(med.id, updatePayload);
      showToast('success', `Demo Triggered: ${med.name} is now ${scenario}`);
      fetchAllData();
    } catch (err) {
      showToast('error', 'Failed to trigger scenario');
    }
  };

  const handleDeleteMedicine = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from inventory?`)) {
      await MedicineService.delete(id);
      showToast('success', `${name} deleted`);
      fetchAllData();
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await MedicineService.createCategory(catForm);
      showToast('success', `Category ${catForm.name} created!`);
      setShowCatModal(false);
      setCatForm({ name: '', code: '', description: '', storage: 'Room Temperature (15-25°C)' });
      fetchAllData();
    } catch (err) {
      showToast('error', 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Delete category ${name}?`)) {
      await MedicineService.deleteCategory(id);
      showToast('success', `Category ${name} removed`);
      fetchAllData();
    }
  };

  const openAddBatchModal = (medicineId = null) => {
    const targetId = medicineId || (medicines.length > 0 ? medicines[0].id : '');
    setBatchTargetMedId(targetId);
    setBatchForm({
      batchNumber: 'BAT-' + Math.floor(Math.random() * 90000 + 10000),
      quantity: 50,
      mfgDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      purchasePrice: 10.00
    });
    setShowBatchModal(true);
  };

  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    if (!batchTargetMedId) {
      showToast('error', 'Please select a medicine for the batch.');
      return;
    }
    if (!batchForm.batchNumber || !batchForm.batchNumber.trim()) {
      showToast('error', 'Batch number is required.');
      return;
    }
    try {
      await MedicineService.addBatch(batchTargetMedId, batchForm);
      showToast('success', `Batch ${batchForm.batchNumber} added! Stock synced.`);
      setShowBatchModal(false);
      fetchAllData();
    } catch (err) {
      showToast('error', 'Failed to add batch');
    }
  };

  const openEditModal = (medicine) => {
    setSelectedMedicine(medicine);
    setIsAddModalOpen(true);
  };

  const openViewModal = (medicine) => {
    setSelectedMedicine(medicine);
    setIsViewModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedMedicine(null);
    setIsAddModalOpen(true);
  };

  // Compile all batches across all medicines
  const allBatches = medicines.flatMap(m => 
    (m.batches || []).map(b => ({
      ...b,
      medicineName: m.name,
      medicineCode: m.code,
      medicineId: m.id
    }))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }}>
              <Package style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              Medicine Inventory Management Service
            </h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px', margin: 0 }}>
            Manage medicine catalog, category classification, multi-batch tracking, and dispensing
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => openAddBatchModal()} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Layers style={{ width: '16px', height: '16px' }} />
            <span>Add Batch</span>
          </button>
          <button onClick={openCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus style={{ width: '18px', height: '18px' }} />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {feedback.message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: '600',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          color: feedback.type === 'success' ? '#34d399' : '#fca5a5'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 style={{ width: '18px', height: '18px' }} /> : <AlertCircle style={{ width: '18px', height: '18px' }} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
        {[
          { id: 'inventory', label: `Medicines Catalog (${medicines.length})`, icon: Package },
          { id: 'categories', label: `Category Management (${categories.length})`, icon: Tag },
          { id: 'batches', label: `Batch Explorer (${allBatches.length})`, icon: Layers },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isActive ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)' : 'transparent',
                border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                color: isActive ? '#fbbf24' : '#94a3b8'
              }}
            >
              <Icon style={{ width: '18px', height: '18px' }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: MEDICINES CATALOG --- */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filter & Search Bar */}
          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '14px', top: '11px', width: '18px', height: '18px', color: '#64748b' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '42px' }}
                placeholder="Search by medicine name, code, category, supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <select
                className="form-control"
                style={{ width: '160px' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                className="form-control"
                style={{ width: '150px' }}
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
              >
                <option value="ALL">All Stock Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>

              <select
                className="form-control"
                style={{ width: '150px' }}
                value={expiryStatusFilter}
                onChange={(e) => setExpiryStatusFilter(e.target.value)}
              >
                <option value="ALL">All Expiry Status</option>
                <option value="VALID">Valid</option>
                <option value="EXPIRING_SOON">Expiring Soon</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          {/* Medicines Table */}
          <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Medicine Details</th>
                  <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Unit Price</th>
                  <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Stock Quantity</th>
                  <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Stock Status</th>
                  <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Expiry Status</th>
                  <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med) => (
                  <tr key={med.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.95rem' }}>{med.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span>Code: {med.code}</span>
                        <span>•</span>
                        <span>{med.dosageForm || 'Oral'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#cbd5e1', fontSize: '0.88rem' }}>
                      {med.categoryName}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: '700', color: '#f8fafc', fontSize: '0.92rem' }}>
                      ${Number(med.unitPrice).toFixed(2)}
                    </td>
                    
                    {/* Clean Stock Quantity Display */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '800', fontSize: '1rem', color: med.totalQuantity === 0 ? '#ef4444' : '#f8fafc' }}>
                        {med.totalQuantity} units
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Reorder point: {med.reorderLevel}
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge ${
                        med.stockStatus === 'IN_STOCK' ? 'badge-success' : 
                        med.stockStatus === 'LOW_STOCK' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {med.stockStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className={`badge ${
                          med.expiryStatus === 'VALID' ? 'badge-success' : 
                          med.expiryStatus === 'EXPIRING_SOON' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {med.expiryStatus.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          {med.nearestExpiryDate}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button onClick={() => openViewModal(med)} className="btn btn-secondary btn-icon" title="View Batches & Info">
                          <Eye style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
                        </button>
                        <button onClick={() => openEditModal(med)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }} title="Edit Medicine">
                          <Edit3 style={{ width: '14px', height: '14px' }} /> Edit
                        </button>
                        <button onClick={() => handleDeleteMedicine(med.id, med.name)} className="btn btn-danger btn-icon" title="Delete Medicine">
                          <Trash2 style={{ width: '15px', height: '15px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: CATEGORY MANAGEMENT --- */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
              Therapeutic Drug Categories
            </h3>
            <button onClick={() => setShowCatModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}>
              <Plus style={{ width: '16px', height: '16px' }} /> Add Category
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            {categories.map((c) => (
              <div key={c.id} className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>{c.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700' }}>{c.code}</span>
                  </div>
                  <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {c.medicineCount || 0} Drugs
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                  {c.description || 'General pharmacological classification'}
                </p>

                <div style={{ background: 'rgba(15,23,42,0.5)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                  Storage: <strong>{c.storage}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button onClick={() => handleDeleteCategory(c.id, c.name)} className="btn btn-danger btn-icon" style={{ padding: '6px' }}>
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: BATCH EXPLORER --- */}
      {activeTab === 'batches' && (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Batch Number</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Associated Drug</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Mfg Date</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Expiry Date</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Batch Units</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Purchase Cost</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allBatches.map((b, index) => (
                <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: '700', color: '#fbbf24', fontSize: '0.88rem' }}>
                    {b.batchNumber}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#f8fafc', fontWeight: '600', fontSize: '0.88rem' }}>
                    {b.medicineName}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.82rem' }}>
                    {b.mfgDate || '2025-01-01'}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#cbd5e1', fontSize: '0.82rem' }}>
                    {b.expiryDate}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: '800', color: '#f8fafc', fontSize: '0.9rem' }}>
                    {b.quantity} units
                  </td>
                  <td style={{ padding: '14px 18px', color: '#34d399', fontWeight: '700', fontSize: '0.88rem' }}>
                    ${Number(b.purchasePrice || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span className={`badge ${
                      b.expiryStatus === 'VALID' ? 'badge-success' : 
                      b.expiryStatus === 'EXPIRING_SOON' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {b.expiryStatus || 'VALID'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ADD / EDIT MEDICINE MODAL --- */}
      {isAddModalOpen && (
        <MedicineModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveMedicine}
          medicine={selectedMedicine}
          categories={categories}
          suppliers={suppliers}
        />
      )}

      {/* --- VIEW MEDICINE MODAL --- */}
      {isViewModalOpen && (
        <ViewMedicineModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          medicine={selectedMedicine}
        />
      )}

      {/* --- CREATE CATEGORY MODAL --- */}
      {showCatModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '30px', borderRadius: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Add Drug Category</h3>
              <button onClick={() => setShowCatModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dermatological Agents"
                  className="form-control"
                  value={catForm.name}
                  onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Category Code</label>
                <input
                  type="text"
                  placeholder="CAT-DERM"
                  className="form-control"
                  value={catForm.code}
                  onChange={(e) => setCatForm(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Storage Requirement</label>
                <input
                  type="text"
                  placeholder="Cold Chain (2-8°C)"
                  className="form-control"
                  value={catForm.storage}
                  onChange={(e) => setCatForm(prev => ({ ...prev, storage: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCatModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD BATCH MODAL --- */}
      {showBatchModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '30px', borderRadius: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Add Medicine Batch</h3>
              </div>
              <button onClick={() => setShowBatchModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <form onSubmit={handleAddBatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Select Medicine</label>
                <select
                  className="form-control"
                  value={batchTargetMedId}
                  onChange={(e) => setBatchTargetMedId(e.target.value)}
                  required
                >
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Batch Number</label>
                  <input
                    type="text"
                    required
                    placeholder="BAT-2026-X"
                    className="form-control"
                    value={batchForm.batchNumber}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Quantity Received</label>
                  <input
                    type="number"
                    min={1}
                    required
                    className="form-control"
                    value={batchForm.quantity}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Mfg Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={batchForm.mfgDate}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, mfgDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Expiry Date</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={batchForm.expiryDate}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowBatchModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryPage;
