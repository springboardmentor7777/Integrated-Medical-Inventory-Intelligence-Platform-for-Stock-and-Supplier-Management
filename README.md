# 🏥 Integrated Medical Inventory Intelligence Platform (Team Two)

### Stock and Supplier Management System

A comprehensive, full-stack **Medical Inventory Intelligence Platform** featuring a **Spring Boot 3 + Java 21 REST API Backend** and a **React 18 + Vite Frontend** with real-time stock monitoring, supplier management, batch expiry tracking, and role-based access control.

---

## 🌟 Team Two Integration Highlights & Changes

### 1. 🔄 Full-Stack REST API Integration
- **Frontend Service Layer**: Enhanced `frontend/src/services/api.js` and `frontend/src/api/` to communicate directly with Spring Boot REST endpoints (`/api/v1/*`) with unified token handling and offline fallback.
- **API Client Modules**: Integrated Team Two client modules (`apiClient`, `authApi`, `medicineApi`, `supplierApi`, `inventoryApi`, `expiryApi`) directly into `frontend/src/api/`.
- **Backend Architecture**: Layered Spring Boot architecture in `backend/` with JPA repositories, DTO validation, BCrypt password hashing, and stateless JWT security filters.

### 2. 🔐 Authentication & Startup Flow
- **Default Login Startup**: Configured application routing in `frontend/src/App.jsx` so the application always starts directly on `/login` with clean redirects.
- **Role-Based Access Control (RBAC)**: Support for `ADMIN`, `PHARMACIST`, `INVENTORY_MANAGER`, `DOCTOR`, and `NURSE` roles.
- **Pre-seeded Credentials**: Auto-initialized accounts (`admin@medistock.com` / `admin123` and `pharmacist@medistock.com` / `admin123`).

### 3. 📦 Core Modules
- **Medicine & Inventory Management**: Live stock tracking, batch numbers, storage conditions, and low/out-of-stock indicators.
- **Supplier & Purchase Orders**: Vendor metrics, delivery tracking, and automatic stock replenishment on order fulfillment.
- **Stock Monitoring & Expiry Alerts**: Real-time ticker banner, critical alert badges, and expiry summary reports.
- **Dashboard & Analytics**: Aggregated inventory valuation, category breakdown, and stock movement audit trails.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + Vite |
| **Frontend Routing** | React Router DOM v6 |
| **Icons & Styling** | Lucide React + Glassmorphism Theme CSS |
| **Backend Framework** | Spring Boot 3.2.5 (Java 21 LTS) |
| **Security & Auth** | Spring Security 6 + JJWT (Stateless JWT) |
| **Persistence** | Spring Data JPA + Hibernate + H2 / MySQL |
| **Build Tools** | Maven 3.9+ (Backend) & npm / Vite (Frontend) |

---

## 📁 Project Structure

```
SpringboadProject/
├── backend/                         # Spring Boot Backend Application
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   ├── README.md
│   └── src/
│       ├── main/java/com/medistock/ # Controllers, Services, DTOs, Entities, Security
│       └── test/java/com/medistock/ # JUnit 5 & Integration Test Suites
├── frontend/                        # React + Vite Frontend Application
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js               # Proxies /api requests to http://localhost:8080
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  # Main routes starting on /login
│       ├── index.css
│       ├── api/                     # Team Two REST API Client Modules
│       ├── context/                 # AuthContext & Session State
│       ├── components/              # Navbar, Sidebar, Modals, Cards
│       ├── pages/                   # LoginPage, DashboardPage, InventoryPage, etc.
│       └── services/                # api.js REST Service Layer with Fallback
├── api/                             # Root API Client definitions
└── README.md
```

---

## 🚀 How to Run the Platform

### 1. Start the Backend Server (Port 8080)
```bash
cd backend
./mvnw spring-boot:run
```
*Health Check: `http://localhost:8080/api/v1/health`*

### 2. Start the Frontend Application (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*Open in Browser: `http://localhost:3000` (Starts directly on `/login`)*

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@medistock.com` | `admin123` | Full system, user, and catalog access |
| **Pharmacist** | `pharmacist@medistock.com` | `admin123` | Inventory, dispensing, and batch tracking |

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/springboardmentor7777/Integrated-Medical-Inventory-Intelligence-Platform-for-Stock-and-Supplier-Management.git

# Navigate to the frontend directory
cd Integrated-Medical-Inventory-Intelligence-Platform-for-Stock-and-Supplier-Management/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000/`

### Default Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medistock.com | any password |
| Pharmacist | pharm@medistock.com | any password |
| Manager | manager@medistock.com | any password |

---

## 🎨 UI Highlights

- **Dark Glassmorphism Theme** — premium, modern healthcare aesthetic
- **Responsive Layout** — sidebar navigation with collapsible design
- **Micro-Animations** — smooth transitions, hover effects, and loading states
- **Real-Time Badge Updates** — notification bell with live unread count
- **Emergency Alert Banner** — top ticker for critical stock/expiry warnings
- **Export Functionality** — download reports as CSV or JSON

---

## 📊 Architecture

The platform follows a **microservices-inspired frontend architecture** with 5 dedicated service modules:

1. 🟢 **Authentication Service** — Login, Registration, OAuth2, JWT
2. 🔵 **User & Role Management Service** — Staff directory, RBAC, Permissions
3. 🟡 **Medicine Inventory Management Service** — Catalog, Categories, Batches
4. 🟣 **Supplier Management Service** — Vendors, Purchase Orders, Auto-Restock
5. 🔴 **Stock Monitoring Service** — Alerts, Adjustments, Threshold Detection

---

## 📝 License

This project is developed as part of the **Springboard Mentorship Program**.

---

## 👨‍💻 Author

**Shaikh Rizwan** — [GitHub Profile](https://github.com/shaikhrizwan988010-lang)
