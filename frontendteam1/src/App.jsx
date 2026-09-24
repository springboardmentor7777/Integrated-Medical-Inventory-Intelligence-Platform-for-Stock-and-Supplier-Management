import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Suppliers from "./pages/Suppliers";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MedicineSearch from "./pages/MedicineSearch";
import Medicines from "./pages/Medicines";
import Inventory from "./pages/Inventory.jsx";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/medicine-search" element={<MedicineSearch />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/inventory" element={<Inventory />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
