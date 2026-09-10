<<<<<<< HEAD
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Alerts from './pages/Alerts';
import StockTracking from './pages/StockTracking';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import authService from './services/authService';

function App() {
  const home = authService.isAuthenticated() ? '/dashboard' : '/login';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/stock" element={<StockTracking />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>

        <Route path="/" element={<Navigate to={home} replace />} />
        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </BrowserRouter>
  );
=======
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
>>>>>>> 30faecb (Complete medicine and inventory frontend integration)
}

export default App;