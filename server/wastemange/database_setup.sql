-- ============================================================================
-- ReLoop Database Setup Script (MySQL 8.0+)
-- Farmer-to-Recycler Waste Management Platform
-- Database: reloop_db
-- ============================================================================

-- 1. Create Database if it does not already exist
CREATE DATABASE IF NOT EXISTS reloop_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE reloop_db;

-- (Optional) Create application user if you do not want to use 'root'
-- CREATE USER IF NOT EXISTS 'reloop_user'@'localhost' IDENTIFIED BY 'reloop_pass123';
-- GRANT ALL PRIVILEGES ON reloop_db.* TO 'reloop_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- 2. Drop existing tables if re-initializing (Ordered to respect Foreign Keys)
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS buyer_material_requirements;
DROP TABLE IF EXISTS waste_listings;
DROP TABLE IF EXISTS material_types;
DROP TABLE IF EXISTS buyer_profiles;
DROP TABLE IF EXISTS farmer_profiles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 3. Table Creation DDL
-- ============================================================================

-- Table A: users
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL COMMENT 'SUPPLIER (Farmer), BUYER (Recycler), ADMIN',
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, SUSPENDED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table B: farmer_profiles
CREATE TABLE farmer_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    farmer_name VARCHAR(150),
    farm_name VARCHAR(150),
    address_line VARCHAR(255),
    village VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(15),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    farm_description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_farmer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farmer_city_state (city, state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table C: buyer_profiles
CREATE TABLE buyer_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    buyer_type VARCHAR(50) NOT NULL DEFAULT 'RECYCLER' COMMENT 'RECYCLER, COMPOST_MANUFACTURER, COMPOST_UNIT, OTHER',
    organization_name VARCHAR(150),
    address_line VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(15),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_buyer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_buyer_city_state (city, state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table D: material_types
CREATE TABLE material_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL DEFAULT 'ORGANIC' COMMENT 'ORGANIC, PAPER, PLASTIC, METAL, OTHER',
    default_unit VARCHAR(20) NOT NULL DEFAULT 'KG' COMMENT 'KG, TON, PIECE',
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_materials_category (category),
    INDEX idx_materials_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table E: waste_listings
CREATE TABLE waste_listings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    material_type_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    quantity_available DECIMAL(12, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price_per_unit DECIMAL(12, 2) NOT NULL,
    minimum_order_quantity DECIMAL(12, 3) DEFAULT 1.000,
    pickup_address VARCHAR(255),
    village VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(15),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    availability_date DATE,
    listing_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' COMMENT 'AVAILABLE, RESERVED, SOLD, CLOSED',
    image_url VARCHAR(500),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_supplier FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_listing_material FOREIGN KEY (material_type_id) REFERENCES material_types(id) ON DELETE RESTRICT,
    INDEX idx_listing_supplier (supplier_id),
    INDEX idx_listing_material (material_type_id),
    INDEX idx_listing_status (listing_status),
    INDEX idx_listing_location (city, state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table F: buyer_material_requirements
CREATE TABLE buyer_material_requirements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    material_type_id BIGINT NOT NULL,
    required_quantity DECIMAL(12, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    max_price_per_unit DECIMAL(12, 2),
    max_distance_km DECIMAL(8, 2),
    preferred_village VARCHAR(100),
    preferred_city VARCHAR(100),
    preferred_state VARCHAR(100),
    pickup_or_delivery VARCHAR(20) NOT NULL DEFAULT 'EITHER' COMMENT 'PICKUP, DELIVERY, EITHER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_req_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_material FOREIGN KEY (material_type_id) REFERENCES material_types(id) ON DELETE RESTRICT,
    INDEX idx_req_buyer (buyer_id),
    INDEX idx_req_material (material_type_id),
    INDEX idx_req_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table G: orders
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    quantity_ordered DECIMAL(12, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    delivery_fee DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    pickup_or_delivery VARCHAR(20) NOT NULL DEFAULT 'PICKUP' COMMENT 'PICKUP, DELIVERY',
    order_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED',
    delivery_address VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_listing FOREIGN KEY (listing_id) REFERENCES waste_listings(id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_supplier FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_order_buyer (buyer_id),
    INDEX idx_order_supplier (supplier_id),
    INDEX idx_order_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table H: payments
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    payment_provider VARCHAR(50) NOT NULL,
    provider_order_id VARCHAR(150),
    provider_transaction_id VARCHAR(150),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'UPI' COMMENT 'UPI, CARD, CASH_ON_PICKUP, OTHER',
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'CREATED' COMMENT 'CREATED, PENDING, SUCCESS, FAILED, REFUNDED',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_payment_order (order_id),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table I: reviews (Optional rating & feedback)
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    reviewer_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. Initial Seed Data
-- ============================================================================

-- Seed Organic Agricultural & Vegetable Materials
INSERT INTO material_types (name, category, default_unit, description, active) VALUES
('Vegetable Waste', 'ORGANIC', 'KG', 'Organic kitchen and field vegetable residues, ideal for composting and microbial decomposition.', TRUE),
('Fruit Waste', 'ORGANIC', 'KG', 'Discarded pulp, peels, and spoiled fruits rich in sugars, ideal for organic fertilizer and bio-enzymes.', TRUE),
('Crop Residue & Stubble', 'ORGANIC', 'TON', 'Post-harvest wheat, paddy straw, and stalks suitable for mulching, bio-char, or composting.', TRUE),
('Sugarcane Bagasse', 'ORGANIC', 'TON', 'Fibrous residue remaining after crushing sugarcane, utilized in composting and biomass processing.', TRUE),
('Cattle Manure & Bio-Waste', 'ORGANIC', 'TON', 'Aged cow dung and farm animal slurry for direct enrichment of organic fertilizer units.', TRUE),
('Mustard & Oilseed Husk', 'ORGANIC', 'TON', 'Deoiled seed cake and pod residue for nitrogen-rich compost manufacturing.', TRUE);

-- ============================================================================
-- 5. Sample Test Data (Optional for testing immediately)
-- Password for all sample users is: Password@123
-- BCrypt Hash: $2a$10$wWk2Y0Q9JgV57LrkR8wSmeb94tK12jV3Z6n7dY8hK9zB5z6mPzN7a
-- ============================================================================

-- Sample Farmer User & Profile
INSERT INTO users (id, full_name, email, phone, password_hash, role, account_status)
VALUES (1, 'Ramesh Kumar (Farmer)', 'ramesh.farmer@reloop.com', '+919876543210', 
        '$2a$10$tQjI7JtS5cR7fQh2.q0bueyZzGZ2y5E5sU9zDq.sWj0Z3KjL6H4xO', 'SUPPLIER', 'ACTIVE');

INSERT INTO farmer_profiles (id, user_id, farmer_name, farm_name, address_line, village, city, state, postal_code, latitude, longitude, farm_description)
VALUES (1, 1, 'Ramesh Kumar', 'Kisan Organic Farm', 'GT Road, Near Canal', 'Samrala', 'Ludhiana', 'Punjab', '141114', 30.9010000, 75.8573000, 'Specialized in seasonal vegetable cultivation, wheat stubble, and organic composting feed.');

-- Sample Recycler Buyer User & Profile
INSERT INTO users (id, full_name, email, phone, password_hash, role, account_status)
VALUES (2, 'BioCompost Recyclers Ltd', 'procurement@biocompost.com', '+919812345678', 
        '$2a$10$tQjI7JtS5cR7fQh2.q0bueyZzGZ2y5E5sU9zDq.sWj0Z3KjL6H4xO', 'BUYER', 'ACTIVE');

INSERT INTO buyer_profiles (id, user_id, buyer_type, organization_name, address_line, city, state, postal_code, latitude, longitude, description)
VALUES (1, 2, 'COMPOST_MANUFACTURER', 'BioCompost Agro Solutions', 'Industrial Area Phase 2', 'Ludhiana', 'Punjab', '141010', 30.8800000, 75.8300000, 'Certified organic bio-fertilizer manufacturing unit procuring bulk vegetable and green farm waste.');

-- Sample Waste Listing by Farmer (1000 kg Vegetable Waste at ₹3.50/kg)
INSERT INTO waste_listings (id, supplier_id, material_type_id, title, description, quantity_available, unit, price_per_unit, minimum_order_quantity, pickup_address, village, city, state, postal_code, latitude, longitude, availability_date, listing_status)
VALUES (1, 1, 1, 'Fresh Vegetable Field Waste (Tomato & Greens)', 'Farm sorting residues, clean organic vegetable waste ideal for bio-compost digestion.', 1000.000, 'KG', 3.50, 100.000, 'Kisan Organic Farm, GT Road', 'Samrala', 'Ludhiana', 'Punjab', '141114', 30.9010000, 75.8573000, CURRENT_DATE, 'AVAILABLE');

-- Sample Buyer Requirement (Need 500 kg Vegetable Waste at max ₹4.00/kg)
INSERT INTO buyer_material_requirements (id, buyer_id, material_type_id, required_quantity, unit, max_price_per_unit, max_distance_km, preferred_city, preferred_state, pickup_or_delivery, active)
VALUES (1, 2, 1, 500.000, 'KG', 4.00, 50.00, 'Ludhiana', 'Punjab', 'EITHER', TRUE);
