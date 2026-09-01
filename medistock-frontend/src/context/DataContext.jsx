import { createContext, useContext, useMemo, useState } from "react";
import {
  initialMedicines,
  initialSuppliers,
  initialNotifications,
  initialUsers,
  purchaseOrders,
} from "../data/mockData";

const DataContext = createContext(null);

let medIdCounter = initialMedicines.length + 1;
let supIdCounter = initialSuppliers.length + 1;

export function DataProvider({ children }) {
  const [medicines, setMedicines] = useState(initialMedicines);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [users] = useState(initialUsers);
  const [orders] = useState(purchaseOrders);

  const addMedicine = (med) => {
    const id = `MED-${String(medIdCounter++).padStart(4, "0")}`;
    setMedicines((prev) => [{ id, ...med }, ...prev]);
  };

  const updateMedicine = (id, patch) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const deleteMedicine = (id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const addSupplier = (sup) => {
    const id = `SUP-${1000 + supIdCounter++}`;
    setSuppliers((prev) => [{ id, medicinesSupplied: 0, lastOrder: "-", performance: 80, ...sup }, ...prev]);
  };

  const updateSupplier = (id, patch) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const deleteSupplier = (id) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const supplierName = (id) => suppliers.find((s) => s.id === id)?.name || "Unknown supplier";

  const value = useMemo(
    () => ({
      medicines,
      suppliers,
      notifications,
      users,
      orders,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      markNotificationRead,
      markAllNotificationsRead,
      supplierName,
    }),
    [medicines, suppliers, notifications, users, orders]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
