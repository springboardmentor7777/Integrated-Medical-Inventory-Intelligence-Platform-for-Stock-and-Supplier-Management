DROP DATABASE IF EXISTS medistock_db;
CREATE DATABASE IF NOT EXISTS medistock_db;
USE medistock_db;

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(100) NOT NULL,
    generic_name VARCHAR(100),
    category VARCHAR(50),
    unit VARCHAR(20),
    manufacturer VARCHAR(100),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    batch_number VARCHAR(50),
    quantity INT NOT NULL DEFAULT 0,
    expiry_date DATE,
    purchase_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    location VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE stock_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NOT NULL,
    user_id INT,
    action_type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    quantity_changed INT NOT NULL,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255),
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE purchase_orders (
    po_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    medicine_id INT NOT NULL,
    order_date DATE DEFAULT (CURRENT_DATE),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2),
    status ENUM('PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED') DEFAULT 'PENDING',
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

SHOW TABLES;