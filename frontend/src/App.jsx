import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { UsersPage } from './pages/UsersPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { AlertsPage } from './pages/AlertsPage';
import { ProfilePage } from './pages/ProfilePage';
import { StockMonitoringService } from './services/api';
import { AlertOctagon, ArrowRight, X } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [criticalBanner, setCriticalBanner] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      StockMonitoringService.getAlerts().then(data => {
        const outCount = data.outOfStock?.length || 0;
        const expCount = data.expired?.length || 0;
        if (outCount > 0 || expCount > 0) {
          setCriticalBanner({
            outCount,
            expCount,
            message: `${outCount > 0 ? `${outCount} Critical Medication(s) Out of Stock` : ''} ${outCount > 0 && expCount > 0 ? '• ' : ''}${expCount > 0 ? `${expCount} Expired Batch(es) Detected` : ''}`
          });
        }
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* Top Real-Time Emergency Notification Ticker */}
      {criticalBanner && !bannerDismissed && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.9) 100%)',
          color: '#ffffff',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.84rem',
          fontWeight: '700',
          boxShadow: '0 2px 10px rgba(239, 68, 68, 0.35)',
          zIndex: 90
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertOctagon style={{ width: '18px', height: '18px', shrink: 0 }} />
            <span>ATTENTION: {criticalBanner.message}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              to="/alerts"
              style={{
                color: '#ffffff',
                textDecoration: 'underline',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem'
              }}
            >
              Review & Resolve Alerts <ArrowRight style={{ width: '14px', height: '14px' }} />
            </Link>
            <button
              onClick={() => setBannerDismissed(true)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
              title="Dismiss banner"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        {/* Service 2: User & Role Management Service */}
        <Route path="/users" element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } />
        
        {/* Service 3: Medicine Inventory Management Service */}
        <Route path="/inventory" element={
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        } />
        
        {/* Service 4: Supplier Management Service */}
        <Route path="/suppliers" element={
          <ProtectedRoute>
            <SuppliersPage />
          </ProtectedRoute>
        } />
        
        {/* Service 5: Stock Monitoring Service */}
        <Route path="/alerts" element={
          <ProtectedRoute>
            <AlertPageWithRoute />
          </ProtectedRoute>
        } />
        <Route path="/stock-monitoring" element={
          <ProtectedRoute>
            <AlertPageWithRoute />
          </ProtectedRoute>
        } />

        {/* Analytics & Profile */}
        <Route path="/analytics" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Root and fallback redirect to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

const AlertPageWithRoute = () => <AlertsPage />;

export default App;
