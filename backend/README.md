# MediStock — Medical Inventory Management Platform (Backend Milestone 1)

## 📌 Project Overview
**MediStock** is an enterprise medical inventory management platform designed for pharmacies, hospitals, and healthcare institutions. 
This repository contains the **Spring Boot** backend foundation for **Milestone 1 (Authentication + Inventory/Stock Foundation)**.

---

## 🏛 Backend Architecture
The backend is structured using a clean, layered architectural pattern:

```
src/main/java/com/medistock/
├── MedistockApplication.java      # Spring Boot application entrypoint
├── config/                        # Spring Security, CORS, and Data Seeding
│   ├── CorsConfig.java
│   ├── DataInitializer.java
│   └── SecurityConfig.java
├── controller/                    # REST API Controllers (JSON endpoints)
│   ├── AuthController.java
│   ├── HealthController.java
│   └── UserController.java
├── dto/                           # Data Transfer Objects & validation schemas
│   ├── auth/
│   ├── common/
│   ├── medicine/
│   └── user/
├── entity/                        # JPA Hibernate Entities (Database mapping)
│   ├── Batch.java
│   ├── Category.java
│   ├── Inventory.java
│   ├── Medicine.java
│   ├── PurchaseOrder.java
│   ├── PurchaseOrderItem.java
│   ├── Role.java
│   ├── StockLog.java
│   ├── Supplier.java
│   └── User.java
├── enums/                         # Core domain enums
│   ├── AdjustmentReason.java
│   ├── ExpiryStatus.java
│   ├── OrderStatus.java
│   ├── RoleName.java
│   ├── StockMovementType.java
│   ├── StockStatus.java
│   └── UserStatus.java
├── exception/                     # Global exception handling & custom errors
│   ├── BadRequestException.java
│   ├── DuplicateResourceException.java
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── UnauthorizedException.java
├── repository/                    # Spring Data JPA Repositories
│   ├── BatchRepository.java
│   ├── CategoryRepository.java
│   ├── InventoryRepository.java
│   ├── MedicineRepository.java
│   ├── PurchaseOrderRepository.java
│   ├── RoleRepository.java
│   ├── StockLogRepository.java
│   ├── SupplierRepository.java
│   └── UserRepository.java
├── security/                      # JWT token generation, filter, and user details
│   ├── CustomAccessDeniedHandler.java
│   ├── CustomUserDetails.java
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationEntryPoint.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtService.java
└── service/                       # Business logic layer
    ├── AuthService.java
    └── UserService.java
```

---

## 🛠 Technology Stack
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.2.5
- **Security**: Spring Security 6 (Stateless JWT Session Management)
- **Persistence**: Spring Data JPA & Hibernate
- **Database**: MySQL 8.0 (with H2 in-memory profile for automated tests)
- **Token Management**: JJWT (Java JWT `io.jsonwebtoken` 0.12.5)
- **Password Hashing**: BCrypt
- **Build Tool**: Apache Maven 3.9+
- **Testing**: JUnit 5, Mockito, Spring Boot Starter Test, MockMvc

---

## ⚙️ Prerequisites & Environment Setup

### 1. Java 21
Verify Java installation:
```bash
java -version
```

### 2. MySQL Database Setup
Log into MySQL CLI or MySQL Workbench:
```sql
CREATE DATABASE IF NOT EXISTS medistock;
```

### 3. Environment Variables
Create a `.env` file or export environment variables:
```bash
# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/medistock?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here

# JWT Configuration
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION=86400000

# CORS Allowed Origins
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173
```

---

## 🚀 How to Run the Backend

### Build and Test
```bash
mvn clean test
```

### Run Application
```bash
mvn spring-boot:run
```
The server will start on: **`http://localhost:8080`**  
All REST APIs are served under base path: **`/api/v1`**

---

## 🔑 Development Seed Credentials
The application automatically seeds default roles, users, and initial inventory idempotently via `DataInitializer.java`:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **ADMIN** | `admin@medistock.com` | `admin123` | Full access to users, settings, and catalog |
| **PHARMACIST** | `pharmacist@medistock.com` | `admin123` | Medicine inventory, dispensing, and batch logs |

> ⚠️ *Note: `admin123` is a development seed credential and must be modified for production deployment.*

---

## 📡 REST API Documentation

### 1. Health Check
- **`GET /api/v1/health`** (Public)
  - Response:
    ```json
    {
      "status": "UP",
      "service": "MediStock Backend"
    }
    ```

### 2. Authentication
- **`POST /api/v1/auth/login`** (Public)
  - Request:
    ```json
    {
      "email": "admin@medistock.com",
      "password": "admin123"
    }
    ```
  - Response (200 OK):
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "type": "Bearer",
      "user": {
        "id": 1,
        "name": "Dr. Sarah Jenkins",
        "email": "admin@medistock.com",
        "role": "ADMIN",
        "department": "Hospital Administration & Pharmacy Board",
        "phone": "+1 (555) 019-2834",
        "licenseNumber": "ADM-99820-US",
        "status": "ACTIVE"
      }
    }
    ```

- **`POST /api/v1/auth/register`** (Public)
  - Request:
    ```json
    {
      "name": "Alex Mercer",
      "email": "alex.mercer@medistock.com",
      "password": "securePassword123",
      "role": "PHARMACIST",
      "department": "Central Pharmacy",
      "phone": "+1 555-0192",
      "licenseNumber": "LIC-98210"
    }
    ```
  - Response (201 Created): Returns token and user profile object.

### 3. User & Profile Management
- **`GET /api/v1/users/me`** (Authenticated User)
  - Header: `Authorization: Bearer <JWT_TOKEN>`
  - Response (200 OK): Current user's profile details.
- **`PUT /api/v1/users/me`** (Authenticated User)
  - Update current profile fields (name, phone, department, bio, newPassword).
- **`GET /api/v1/users`** (`ROLE_ADMIN` only)
  - Returns list of all registered users.
- **`POST /api/v1/users`** (`ROLE_ADMIN` only)
  - Admin provision of new staff accounts.
- **`DELETE /api/v1/users/{id}`** (`ROLE_ADMIN` only)
  - Removes a user account.

---

## 🧪 Postman & cURL Test Verification

### 1. Verify Health
```bash
curl -X GET http://localhost:8080/api/v1/health
```

### 2. Login as Admin
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medistock.com","password":"admin123"}'
```

### 3. Access Protected Profile
```bash
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <TOKEN_RECEIVED>"
```

### 4. Test Role-Based Protection (ADMIN Only)
```bash
# Using Pharmacist token -> 403 Forbidden
# Using Admin token -> 200 OK
curl -X GET http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## 🗺 Milestone Roadmap & Future Scope
- **Milestone 1 (Completed)**: Scaffolding, Spring Security, JWT Auth, JPA Entities (Users, Roles, Medicines, Categories, Inventory, StockLogs, Suppliers, Purchase Orders), Exception Handling, and Data Seeding.
- **Milestone 2 (Upcoming)**: Full Medicine CRUD, Advanced Inventory Search/Filtering, Stock Quantity In/Out workflows, Batch management.
- **Milestone 3 (Upcoming)**: Expiry monitoring engine, low-stock threshold triggers, SMS/Email notifications (Twilio, JavaMailSender).
- **Milestone 4 (Upcoming)**: Aggregated Analytics Dashboard, PDF/Excel export, and Docker containerization.
