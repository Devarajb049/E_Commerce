-- ========================================================
-- Simple E-Commerce Cart & Order Management System
-- Database Schema: ecommerce_db
-- ========================================================

CREATE DATABASE IF NOT EXISTS ecommerce_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ecommerce_db;

-- 1. Categories Table
DROP TABLE IF EXISTS Order_Items;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Categories;

CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Products Table
CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES Categories(category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_product_price CHECK (price > 0),
    CONSTRAINT chk_product_stock CHECK (stock_quantity >= 0)
) ENGINE=InnoDB;

-- Indexes for product search & category lookups
CREATE INDEX idx_products_category ON Products(category_id);
CREATE INDEX idx_products_name ON Products(product_name);
CREATE INDEX idx_products_price ON Products(price);

-- 3. Orders Table
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(30) NOT NULL UNIQUE,
    user_id INT NULL,
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status ENUM('PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED') NOT NULL DEFAULT 'PLACED',
    delivery_method VARCHAR(50) DEFAULT 'STANDARD',
    shipping_fee DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) DEFAULT 'COD',
    payment_status ENUM('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Indexes for order analytics and filtering
CREATE INDEX idx_orders_status ON Orders(order_status);
CREATE INDEX idx_orders_created_at ON Orders(created_at);
CREATE INDEX idx_orders_email ON Orders(email);
CREATE INDEX idx_orders_user_id ON Orders(user_id);

-- Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    changed_by VARCHAR(100) DEFAULT 'SYSTEM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_order FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Customer Saved Addresses Table
CREATE TABLE IF NOT EXISTS user_addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Returns & Refunds Table
CREATE TABLE IF NOT EXISTS order_returns (
    return_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    product_id INT NULL,
    reason TEXT NOT NULL,
    status ENUM('REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'COMPLETED', 'CANCELLED') DEFAULT 'REQUESTED',
    refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_return_order FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_return_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Order_Items Table
CREATE TABLE Order_Items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES Orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_order_item_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_item_price CHECK (price > 0)
) ENGINE=InnoDB;

-- Indexes for order item lookups and aggregation
CREATE INDEX idx_order_items_order_id ON Order_Items(order_id);
CREATE INDEX idx_order_items_product_id ON Order_Items(product_id);

-- 5. Users Table (Authentication & Role-Based Access Control)
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
