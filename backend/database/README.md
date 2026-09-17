# MediStock Database Configuration

This project supports both local development and PostgreSQL-ready deployment.

## Local default

The application uses the built-in H2 database by default and stores data in `backend/data/medistock`.

## PostgreSQL configuration

Set environment variables before starting the backend:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/medistock
export DB_USERNAME=medistock
export DB_PASSWORD=medistock
export DB_DRIVER=org.postgresql.Driver
```

Then start the app with:

```bash
./mvnw spring-boot:run
```

## Schema notes

The project uses Spring Boot JPA with `ddl-auto=update`, so tables are generated automatically when the app starts.