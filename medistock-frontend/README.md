# MediStock — Frontend

React.js frontend for the **MediStock Medical Inventory Management Platform**, built to sit in front of a Spring Boot backend (see the original project brief). This package is **frontend-only**: it runs entirely on realistic mock data so you can demo every screen today, and it's structured so the Spring Boot team can wire in the real REST APIs without any UI rework.

## Tech stack

- React 19 + Vite
- React Router v6 (routing, protected routes, role-based access)
- Tailwind CSS (design tokens in `tailwind.config.js`)
- Recharts (dashboard charts)
- Axios (API client, pre-wired for JWT)
- lucide-react (icons)

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build → dist/
```

## Demo logins

The login screen has one-click buttons for all three, or use manually:

| Role       | Email                        | Password    |
|------------|-------------------------------|-------------|
| Admin      | admin@medistock.app          | admin123    |
| Pharmacist | pharmacist@medistock.app     | pharma123   |
| Staff      | staff@medistock.app          | staff123    |

Each role sees a different sidebar: Staff can view inventory/alerts/expiry/notifications; Pharmacist additionally gets Suppliers and Reports; Admin additionally gets Users & Roles.

## What's implemented

- **Auth** — Login, Register, role selection, protected + role-gated routes (mocked; see `src/context/AuthContext.jsx`)
- **Dashboard** — KPI cards, 7-day stock movement chart, batch-health donut, expiry watchlist, recent purchase orders
- **Medicine Inventory** — search, filter by category/supplier/status, add/edit/delete (modal form)
- **Suppliers** — card grid with contact info, performance, supply count, add/edit/delete
- **Stock Alerts** — out-of-stock / low-stock views with estimated reorder cost
- **Expiry Tracking** — color-coded shelf-life progress bars per batch, filterable by severity
- **Notifications** — expiry/stock/purchase alerts, mark as read
- **Reports & Export** — CSV export of inventory/expiry/low-stock/supplier data (PDF is stubbed for the backend report service)
- **Users & Roles** (Admin only) — user list, invite modal stubbed for the backend

## Connecting the real Spring Boot backend

Everything currently runs on in-memory mock data (`src/data/mockData.js`) via `src/context/DataContext.jsx`, so the UI works standalone. To connect the real backend:

1. Set the API base URL:
   ```bash
   # .env
   VITE_API_BASE_URL=https://your-backend-host/api
   ```
2. `src/services/api.js` already exports a configured Axios instance (`api`) that attaches the JWT from `localStorage` to every request, plus an `endpoints` map matching the services in the project brief (`/auth`, `/medicines`, `/suppliers`, `/purchase-orders`, `/stock/alerts`, `/expiry`, `/notifications`, `/reports`, `/users`).
3. Replace the mock functions in `AuthContext.jsx` (`login`, `register`) and `DataContext.jsx` (`addMedicine`, `updateMedicine`, etc.) with calls to `api.get/post/put/delete(endpoints.*, ...)`. The function signatures and component usage don't need to change.
4. Enable OAuth2 Google login by pointing the "Continue with Google" button on the Login page at your backend's `/auth/oauth2/google` redirect.

## Design notes

Palette and type system live in `tailwind.config.js` and `src/index.css` — a clinical teal/ink palette (`primary`, `ok`/`amber`/`crit` status colors) with Space Grotesk for headings, IBM Plex Sans for body text, and IBM Plex Mono for batch codes and figures. The expiry-tracking page's color-coded shelf-life bars are the app's signature visual and reuse the same status colors as the stock/expiry pills elsewhere for consistency.
