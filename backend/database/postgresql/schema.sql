CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500),
    storage VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(120),
    email VARCHAR(120),
    phone VARCHAR(50),
    address VARCHAR(255),
    tax_id VARCHAR(50),
    payment_terms VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    rating DOUBLE PRECISION DEFAULT 4.5,
    on_time_delivery_rate DOUBLE PRECISION DEFAULT 95.0,
    lead_time_days INTEGER DEFAULT 3,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicines (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    category_id BIGINT NOT NULL,
    supplier_id BIGINT,
    dosage_form VARCHAR(100),
    storage_condition VARCHAR(200),
    description VARCHAR(1000),
    unit_price DOUBLE PRECISION NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 20,
    stock_status VARCHAR(30),
    expiry_status VARCHAR(30),
    nearest_expiry_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT NOT NULL UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 20,
    stock_status VARCHAR(30) NOT NULL,
    updated_at TIMESTAMP
);