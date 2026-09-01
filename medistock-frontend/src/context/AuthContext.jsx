import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const DEMO_ACCOUNTS = [
  { email: "admin@medistock.app", password: "admin123", name: "Anita Rao", role: "Admin" },
  { email: "pharmacist@medistock.app", password: "pharma123", name: "Karthik Subramaniam", role: "Pharmacist" },
  { email: "staff@medistock.app", password: "staff123", name: "Priya Menon", role: "Staff" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("medistock_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("medistock_user", JSON.stringify(user));
    else localStorage.removeItem("medistock_user");
  }, [user]);

  const login = async (email, password) => {
    // TODO: replace with `api.post(endpoints.auth.login, { email, password })`
    // once the Spring Boot backend issues a real JWT.
    await new Promise((r) => setTimeout(r, 450));
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!account) throw new Error("Invalid email or password.");
    const sessionUser = { name: account.name, email: account.email, role: account.role };
    localStorage.setItem("medistock_token", "demo-jwt-token");
    setUser(sessionUser);
    return sessionUser;
  };

  const register = async ({ name, email, password, role }) => {
    await new Promise((r) => setTimeout(r, 450));
    if (!name || !email || !password) throw new Error("All fields are required.");
    const sessionUser = { name, email, role: role || "Staff" };
    localStorage.setItem("medistock_token", "demo-jwt-token");
    setUser(sessionUser);
    return sessionUser;
  };

  const logout = () => {
    localStorage.removeItem("medistock_token");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout, demoAccounts: DEMO_ACCOUNTS }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
