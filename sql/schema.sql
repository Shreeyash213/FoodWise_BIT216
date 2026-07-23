-- Larder / FoodWise Household Food Management System Schema
-- MySQL 8.0+ / MariaDB Compatible

CREATE DATABASE IF NOT EXISTS foodwise;
USE foodwise;

-- ==========================================
-- 1. Users Table (Authentication)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. Food Items Table (Inventory Management)
-- ==========================================
CREATE TABLE IF NOT EXISTS food_items (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category ENUM('Produce','Dairy','Pantry','Frozen','Meat','Bakery') NOT NULL,
  quantity DOUBLE NOT NULL,
  unit VARCHAR(30) NOT NULL,
  location ENUM('Fridge','Freezer','Pantry Shelf') NOT NULL,
  days_left INT NOT NULL,
  added_by VARCHAR(50) NOT NULL,
  low_stock_threshold DOUBLE NOT NULL DEFAULT 2,
  INDEX idx_days_left (days_left),
  INDEX idx_category (category)
);

-- ==========================================
-- 3. Notifications Table (System & Alert Logs)
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  tone ENUM('expiry','low-stock','plan','system','update') NOT NULL,
  message VARCHAR(255) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- ==========================================
-- 4. Meal Plans Table (Weekly Meal Schedule)
-- ==========================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id VARCHAR(36) PRIMARY KEY,
  day VARCHAR(20) NOT NULL,
  meal VARCHAR(150) NOT NULL,
  uses_expiring TINYINT(1) NOT NULL DEFAULT 0
);

-- ==========================================
-- 5. Household Members Table (Sharing & Privacy)
-- ==========================================
CREATE TABLE IF NOT EXISTS household_members (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  privacy VARCHAR(100) NOT NULL
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Seed Data: Demo Users
INSERT INTO users (id, name, email, password) VALUES
(1, 'Asha Sharma', 'asha@example.com', '$2a$10$e8T8f4d1m3s.demoHashedPasswordHere')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Data: Food Items
INSERT INTO food_items (id, name, category, quantity, unit, location, days_left, added_by, low_stock_threshold) VALUES
('i1', 'Whole Milk', 'Dairy', 1, 'L', 'Fridge', 2, 'Asha', 2),
('i2', 'Spinach', 'Produce', 200, 'g', 'Fridge', 1, 'Asha', 300),
('i3', 'Basmati Rice', 'Pantry', 5, 'kg', 'Pantry Shelf', 180, 'Ram', 2),
('i4', 'Chicken Thighs', 'Meat', 800, 'g', 'Freezer', 45, 'Ram', 500),
('i5', 'Greek Yogurt', 'Dairy', 500, 'g', 'Fridge', 4, 'Nisha', 200),
('i6', 'Sourdough Loaf', 'Bakery', 1, 'loaf', 'Pantry Shelf', 3, 'Nisha', 1),
('i7', 'Frozen Peas', 'Frozen', 400, 'g', 'Freezer', 90, 'Ram', 200),
('i8', 'Tomatoes', 'Produce', 6, 'pcs', 'Fridge', 5, 'Asha', 3),
('i9', 'Turmeric Powder', 'Pantry', 150, 'g', 'Pantry Shelf', 300, 'Ram', 50),
('i10', 'Cheddar Block', 'Dairy', 250, 'g', 'Fridge', 12, 'Nisha', 100)
ON DUPLICATE KEY UPDATE name=VALUES(name), quantity=VALUES(quantity), days_left=VALUES(days_left);

-- Seed Data: Notifications
INSERT INTO notifications (id, tone, message, is_read) VALUES
('n1', 'expiry', 'Spinach expires tomorrow — use in tonight\'s dal.', 0),
('n2', 'expiry', 'Whole Milk expires in 2 days.', 0),
('n3', 'low-stock', 'Basmati Rice is running low — 5 kg left, add to shopping list?', 0),
('n4', 'plan', 'Thursday\'s dinner (Chicken Curry) still needs 2 ingredients.', 1),
('n5', 'system', 'Weekly freshness report is ready to view.', 1)
ON DUPLICATE KEY UPDATE message=VALUES(message);

-- Seed Data: Meal Plans
INSERT INTO meal_plans (id, day, meal, uses_expiring) VALUES
('m1', 'Mon', 'Spinach & Paneer Curry', 1),
('m2', 'Tue', 'Tomato Basil Pasta', 1),
('m3', 'Wed', 'Fried Rice with Peas', 0),
('m4', 'Thu', 'Chicken Curry', 0),
('m5', 'Fri', 'Sourdough Grilled Cheese', 1),
('m6', 'Sat', 'Yogurt Marinated Chicken', 1),
('m7', 'Sun', 'Leftovers & Pantry Clean-out', 0)
ON DUPLICATE KEY UPDATE meal=VALUES(meal), uses_expiring=VALUES(uses_expiring);

-- Seed Data: Household Members
INSERT INTO household_members (id, name, role, privacy) VALUES
('h1', 'Asha', 'Owner', 'Shares full inventory'),
('h2', 'Ram', 'Member', 'Shares full inventory'),
('h3', 'Nisha', 'Member', 'Shares purchases only')
ON DUPLICATE KEY UPDATE role=VALUES(role), privacy=VALUES(privacy);
