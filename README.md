# 🏥 MediStock – Medical Inventory Management Platform

A comprehensive, production-ready, full-stack **Medical Inventory Intelligence Platform** featuring a **Spring Boot 3 + Java 21 REST API Backend** and a **React 18 + Vite Frontend** with real-time stock monitoring, supplier management, batch expiry tracking, analytics dashboard, statutory report exports, and role-based access control (RBAC).

---

## 📌 Project Architecture

```
Browser / Client
      │
      ▼
React 18 + Vite Frontend (Render Static Site)
      │
      │ HTTPS REST API requests (JWT Auth Header)
      ▼
Spring Boot Backend (Render Web Service)
      │
      │ JDBC SSL Connection
      ▼
Neon PostgreSQL (Managed Cloud Database)
```

---

## 🌟 Milestones Completed

### Milestone 1: Requirements, Database Design & JWT Auth
- **Spring Boot Backend**: Scaffolding with JPA entities (`User`, `Role`, `Medicine`, `Category`, `Batch`, `Supplier`, `Inventory`, `StockLog`, `PurchaseOrder`, `PurchaseOrderItem`).
- **Security**: Spring Security 6 with stateless JWT authentication filter, BCrypt password encoder, custom entry point, and access denied handlers.
- **Frontend Skeleton**: React 18 + Vite with `AuthContext`, protected route wrappers, and glassmorphic UI system.

### Milestone 2: Inventory & Supplier Management
- **Medicine Catalog**: Full CRUD for medicine records, category management, batch tracking, unit pricing, dosage forms, and storage conditions.
- **Search & Filtering**: Multi-field search (by drug name, code, category, supplier) and stock status filtering (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`).
- **Supplier Directory & Procurement**: Supplier management, multi-item purchase order generation, PO lifecycle tracking (`PENDING` ➔ `APPROVED` ➔ `SHIPPED` ➔ `DELIVERED`), and auto-restocking on receipt.

### Milestone 3: Expiry Tracking, Stock Alerts & Notifications
- **Expiry Radar**: Automated detection of expiring-soon medicines and expired batches (`VALID`, `EXPIRING_SOON`, `EXPIRED`).
- **Stock Movements**: Inventory movement logger (`IN` / `OUT` adjustments with reason tagging and audit logs).
- **Alert System**: Low-stock threshold detection, out-of-stock warning banners, and real-time STOMP WebSocket alert broadcasting.

### Milestone 4: Analytics Dashboard, Statutory Reporting, Testing & Production Deployment
- **Admin Analytics Dashboard**:
  1. Total Inventory Valuation (statutory monetary calculation)
  2. Total Active SKUs & Warehoused Units
  3. Low-Stock Depletion Radar
  4. Medication Expiration Radar
  5. Supplier Reliability & Fulfillment Performance
  6. Procurement & Purchase Order History
  7. Statutory Regulatory Compliance & Reports Export Center (CSV & JSON format with exact Expiry Dates)
  8. Microservices Cluster System Health Matrix
- **Statutory Data Export**: Corrected CSV and JSON export center providing exact expiry date output (`yyyy-MM-dd`) for regulatory compliance filings.
- **Testing & Validation**: Complete suite of unit tests, JwtService tests, AuthController tests, and integration test suites passed cleanly.
- **Production Configuration**:
  - Dynamic `$PORT` binding for cloud platforms like Render.
  - Native Neon PostgreSQL connectivity with `sslmode=require`.
  - Production-ready CORS with `allowedOriginPatterns` for HTTPS domain security.
  - Render blueprint configuration (`render.yaml`) for seamless deployment.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + Vite |
| **Frontend Routing** | React Router DOM v6 |
| **Icons & Styling** | Lucide React + Custom Glassmorphism Theme |
| **Backend Framework** | Spring Boot 3.2.5 (Java 21 LTS) |
| **Security & Auth** | Spring Security 6 + JJWT (Stateless JWT) |
| **Database (Production)** | Neon PostgreSQL (Managed PostgreSQL) |
| **Database (Local/Dev)** | H2 / PostgreSQL |
| **Deployment Platform** | Render (Web Service for Backend, Static Site for Frontend) |

---

## ⚡ Production Environment Variables

### Backend Environment Variables (Render Web Service)
| Variable Name | Description | Example / Recommended Value |
|---|---|---|
| `PORT` | Dynamic web service port | `10000` (auto-assigned by Render) |
| `DB_URL` | Neon JDBC Connection URL | `jdbc:postgresql://ep-xxx.neon.tech/neondb?sslmode=require` |
| `DB_USERNAME` | Neon Database Username | `neondb_owner` |
| `DB_PASSWORD` | Neon Database Password | `your_neon_password` |
| `JWT_SECRET` | 256-bit Secret Key for signing JWTs | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
| `CORS_ORIGINS` | Deployed Frontend Domain | `https://medistock-frontend.onrender.com,http://localhost:3000` |

### Frontend Environment Variables (Render Static Site)
| Variable Name | Description | Example / Recommended Value |
|---|---|---|
| `VITE_API_URL` | Deployed Backend REST URL | `https://medistock-backend.onrender.com` |

---

## 🚀 How to Run Locally

### 1. Start Spring Boot Backend (Port 8081)
```bash
cd backend
./mvnw spring-boot:run
```
*Health Check URL: `http://localhost:8081/api/v1/health`*

### 2. Start React Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*App URL: `http://localhost:3000/login`*

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@medistock.com` | `admin123` | Full system, user management, and statutory export |
| **Pharmacist** | `pharmacist@medistock.com` | `admin123` | Inventory, dispensing, and batch tracking |

---

## 📦 Deployment Instructions on Render

### Deploying the Backend (Spring Boot Web Service)
1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Connect your GitHub repository: `https://github.com/springboardmentor7777/Integrated-Medical-Inventory-Intelligence-Platform-for-Stock-and-Supplier-Management`.
3. Set **Root Directory** to `backend`.
4. Set **Runtime** to `Java`.
5. Set **Build Command**: `./mvnw clean package -DskipTests`.
6. Set **Start Command**: `java -jar target/medistock-backend-1.0.0.jar`.
7. Under **Environment Variables**, add:
   - `DB_URL`: `jdbc:postgresql://<your-neon-host>/<dbname>?sslmode=require`
   - `DB_USERNAME`: `<your-neon-user>`
   - `DB_PASSWORD`: `<your-neon-password>`
   - `JWT_SECRET`: `<your-256-bit-secret>`
   - `CORS_ORIGINS`: `https://<your-frontend-render-url>.onrender.com`

### Deploying the Frontend (React Static Site)
1. In Render Dashboard, click **New +** ➔ **Static Site**.
2. Connect the same GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Set **Build Command**: `npm install && npm run build`.
5. Set **Publish Directory**: `dist`.
6. Add **Redirects/Rewrites**:
   - Source: `/*` ➔ Destination: `/index.html` (Action: Rewrite).
7. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-backend-render-url>.onrender.com`

---

## 🧪 Verification & End-to-End Workflow

To verify the platform end-to-end:
1. Navigate to `/login` and authenticate using `admin@medistock.com` / `admin123`.
2. Inspect the **Admin Dashboard** metrics: Total Valuation, Active SKUs, Low Stock, and Expiry status.
3. Open **Inventory Management** (`/inventory`): Add a medicine item, edit price/stock, adjust batch expiry.
4. Open **Supplier Management** (`/suppliers`): Add vendor, issue a Purchase Order, transition to `DELIVERED`, and verify automatic stock increment.
5. Open **Stock Alerts & Expiry Radar** (`/alerts`): View low stock warnings and execute Stock IN / Stock OUT adjustments.
6. Open **Reports & Export Center** (`/dashboard` ➔ Tab 6): Export CSV/JSON compliance report and verify exact expiry dates (`yyyy-MM-dd`) in the last column.
