import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

const DashboardView = () => (
  <div>
    <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
    <p className="text-slate-500 mt-2">Welcome to the pharmacy management portal.</p>
  </div>
);

const InventoryView = () => (
  <div>
    <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
    <p className="text-slate-500 mt-2">Stock tracking and batch numbers will render here.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
              <div className="p-8 bg-white shadow rounded-lg text-center">
                <h2 className="text-xl font-bold mb-2">Login Page</h2>
                <p className="text-sm text-slate-500">Role 5 Auth Form will link here.</p>
              </div>
            </div>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/inventory" element={<InventoryView />} />
            <Route path="/medicines" element={<div className="text-xl font-bold">Medicines Catalog</div>} />
            <Route path="/suppliers" element={<div className="text-xl font-bold">Suppliers Directory</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;