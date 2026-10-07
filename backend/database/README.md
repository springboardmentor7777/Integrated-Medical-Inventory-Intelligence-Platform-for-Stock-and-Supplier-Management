# MediStock Database Configuration

This project uses PostgreSQL for runtime data and supports Supabase-hosted PostgreSQL.

## PostgreSQL configuration

Set environment variables before starting the backend:

```bash
export DB_URL=jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require
export DB_USERNAME=postgres
export DB_PASSWORD=<SUPABASE_DATABASE_PASSWORD>
export DB_DRIVER=org.postgresql.Driver
```

For local PostgreSQL, use `jdbc:postgresql://localhost:5432/medistock` instead. Then start the app with:

```bash
./mvnw spring-boot:run
```

## Schema notes

The project uses Spring Boot JPA with `ddl-auto=update`, so tables are generated automatically when the app starts. H2 remains available only through the test profile.