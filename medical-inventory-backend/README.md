# MediStock API

Week 1–2 baseline for a role-based medical inventory system.

## Roles

- **ADMIN**: users, roles, configuration and all inventory operations.
- **PHARMACIST**: medicines, suppliers, purchase orders, stock and expiry work.
- **STAFF**: read inventory and record permitted stock activity.

## Run

Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and a base64 `JWT_SECRET` (32+ bytes), then run `./mvnw spring-boot:run`.
For local MySQL the defaults target `medistock_db` on port 3306. For an embedded local database, run with the `dev` profile: `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`. On first startup, `ADMIN`, `PHARMACIST`, and `STAFF` roles are created. An admin account is created only when both `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` are supplied.

## Auth API

- `POST /api/auth/register` — `{name,email,password,role}` (public registration is STAFF only)
- `POST /api/auth/login` — `{email,password}`
- `GET /api/users/me` — authenticated user profile

Send the returned access token as `Authorization: Bearer <token>`.
