import axios from "axios";

// Base URL of the Spring Boot backend. Set VITE_API_BASE_URL in a .env file
// once the backend (medistock-api) is deployed — see README.md.
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT issued by /auth/login to every request once available.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("medistock_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Central map of the REST endpoints this frontend expects from the
// Spring Boot services described in the project brief. Components call
// these; today they are not yet wired to `api` (the app runs on mock
// data via DataContext), so swapping to live data means implementing
// each function body with the matching `api.get/post/...` call.
export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    oauthGoogle: "/auth/oauth2/google",
  },
  medicines: "/medicines",
  suppliers: "/suppliers",
  purchaseOrders: "/purchase-orders",
  stockAlerts: "/stock/alerts",
  expiry: "/expiry",
  notifications: "/notifications",
  reports: "/reports",
  users: "/users",
};

export default api;
