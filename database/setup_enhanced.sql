-- PonyParadise Database Setup Script (Enhanced)
-- Compatible with: MySQL 8.0+ / TiDB
-- Created: 2026-03-22

-- ============================================================================
-- 1. PONY_TYPE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pony_type (
  type_id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL UNIQUE,
  special_ability VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_type_name_length CHECK (LENGTH(type_name) > 0),
  INDEX idx_type_name (type_name)
);

-- ============================================================================
-- 2. PONY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pony (
  pony_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  rarity VARCHAR(10) NOT NULL DEFAULT 'C' CHECK (rarity IN ('A', 'B', 'C')),
  type_id INT NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES pony_type(type_id) ON DELETE RESTRICT,
  CONSTRAINT chk_price_precision CHECK (price >= 0 AND price <= 999999.99),
  INDEX idx_pony_name (name),
  INDEX idx_pony_rarity (rarity),
  INDEX idx_pony_type_rarity (type_id, rarity),
  INDEX idx_pony_price (price),
  INDEX idx_pony_active (is_active)
);

-- ============================================================================
-- 3. CUSTOMER TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(50),
  postal_code VARCHAR(10),
  country VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  CONSTRAINT chk_email_format CHECK (email LIKE '%@%.%'),
  CONSTRAINT chk_username_length CHECK (LENGTH(username) >= 3),
  INDEX idx_customer_email (email),
  INDEX idx_customer_username (username),
  INDEX idx_customer_is_active (is_active),
  INDEX idx_customer_deleted (is_deleted)
);

-- ============================================================================
-- 4. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(12,2) NOT NULL CHECK (total >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_code VARCHAR(50),
  tax_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  payment_method VARCHAR(50),
  shipping_address TEXT,
  estimated_delivery DATE,
  actual_delivery DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
  CONSTRAINT chk_delivery_date CHECK (actual_delivery IS NULL OR actual_delivery >= estimated_delivery),
  INDEX idx_orders_customer_id (customer_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_order_date (order_date),
  INDEX idx_orders_customer_status (customer_id, status, order_date)
);

-- ============================================================================
-- 5. ORDER_ITEM TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_item (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  pony_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
  subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal > 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (pony_id) REFERENCES pony(pony_id) ON DELETE RESTRICT,
  UNIQUE KEY unique_order_item (order_id, pony_id),
  INDEX idx_order_item_order_id (order_id),
  INDEX idx_order_item_pony_id (pony_id),
  INDEX idx_order_item_pony_quantity (pony_id, quantity)
);

-- ============================================================================
-- 6. REVIEW TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS review (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  pony_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
  FOREIGN KEY (pony_id) REFERENCES pony(pony_id) ON DELETE CASCADE,
  UNIQUE KEY unique_review (customer_id, pony_id),
  CONSTRAINT chk_comment_length CHECK (LENGTH(comment) <= 1000),
  INDEX idx_review_pony_id (pony_id),
  INDEX idx_review_customer_id (customer_id),
  INDEX idx_review_pony_rating (pony_id, rating),
  INDEX idx_review_verified (is_verified)
);

-- ============================================================================
-- 7. WISHLIST_ITEM TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS wishlist_item (
  wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  pony_id INT NOT NULL,
  priority INT DEFAULT 0 CHECK (priority >= 0 AND priority <= 5),
  notes TEXT,
  added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
  FOREIGN KEY (pony_id) REFERENCES pony(pony_id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist_item (customer_id, pony_id),
  INDEX idx_wishlist_customer (customer_id),
  INDEX idx_wishlist_pony (pony_id),
  INDEX idx_wishlist_priority (customer_id, priority DESC)
);

-- ============================================================================
-- 8. STOCK_TRANSACTION TABLE (For audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_transaction (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  pony_id INT NOT NULL,
  transaction_type ENUM('purchase', 'return', 'adjustment', 'restock', 'damage') NOT NULL,
  quantity_change INT NOT NULL,
  reference_id INT,
  reason TEXT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pony_id) REFERENCES pony(pony_id),
  INDEX idx_pony_date (pony_id, created_at),
  INDEX idx_transaction_type (transaction_type)
);

-- ============================================================================
-- 9. ORDER_IDEMPOTENCY TABLE (Prevent duplicate orders)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_idempotency (
  idempotency_key VARCHAR(255) PRIMARY KEY,
  customer_id INT NOT NULL,
  order_id INT,
  status ENUM('pending', 'created', 'failed') DEFAULT 'pending',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME DEFAULT DATE_ADD(NOW(), INTERVAL 24 HOUR),
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  INDEX idx_expires (expires_at)
);

-- ============================================================================
-- 10. AUDIT_LOG TABLE (Track all changes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  audit_id INT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id INT NOT NULL,
  action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
  old_values JSON,
  new_values JSON,
  changed_by INT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_table_record (table_name, record_id, changed_at),
  INDEX idx_changed_at (changed_at)
);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Active customers
DROP VIEW IF EXISTS active_customer;
CREATE VIEW active_customer AS
SELECT * FROM customer WHERE is_deleted = FALSE AND is_active = TRUE;

-- View: Available ponies
DROP VIEW IF EXISTS available_pony;
CREATE VIEW available_pony AS
SELECT * FROM pony WHERE is_active = TRUE AND stock_quantity > 0;

-- View: Product ratings summary
DROP VIEW IF EXISTS product_ratings;
CREATE VIEW product_ratings AS
SELECT 
  p.pony_id,
  p.name,
  COUNT(r.review_id) as review_count,
  ROUND(AVG(r.rating), 2) as avg_rating,
  SUM(CASE WHEN r.rating >= 4 THEN 1 ELSE 0 END) as positive_count,
  SUM(CASE WHEN r.rating <= 2 THEN 1 ELSE 0 END) as negative_count
FROM pony p
LEFT JOIN review r ON p.pony_id = r.pony_id AND r.is_deleted = FALSE
GROUP BY p.pony_id, p.name;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Clear existing data (careful with this!)
-- DELETE FROM pony;
-- DELETE FROM pony_type;

-- Insert pony types
INSERT IGNORE INTO pony_type(type_id, type_name, special_ability) VALUES
(1, 'Unicorn', 'Magic'),
(2, 'Pegasus', 'Flying'),
(3, 'Earth Pony', 'Strength'),
(4, 'Alicorn', 'Ultimate Magic');

-- Insert ponies
INSERT IGNORE INTO pony(pony_id, name, price, rarity, type_id, stock_quantity, is_active) VALUES
(1, 'Princess Celestia', 5999.00, 'A', 4, 5, TRUE),
(2, 'Princess Luna', 5999.00, 'A', 4, 5, TRUE),
(3, 'Applejack', 1499.00, 'B', 3, 20, TRUE),
(4, 'Fluttershy', 1499.00, 'B', 2, 15, TRUE),
(5, 'Rarity', 1999.00, 'B', 1, 12, TRUE),
(6, 'Pinkie Pie', 1499.00, 'B', 3, 18, TRUE),
(7, 'Twilight Sparkle', 5999.00, 'A', 4, 8, TRUE),
(8, 'Rainbow Dash', 1499.00, 'B', 2, 16, TRUE),
(9, 'Wensley', 999.00, 'C', 3, 25, TRUE),
(10, 'Princess Cadance', 5999.00, 'A', 4, 6, TRUE);

-- Sample customer
INSERT IGNORE INTO customer(customer_id, username, email, password, phone, address, city, created_at) VALUES
(1, 'john_doe', 'john@example.com', 'hashed_password_here', '0812345678', '123 Main St', 'Bangkok', NOW());

-- Sample order
INSERT IGNORE INTO orders(order_id, customer_id, total, status, order_date) VALUES
(1, 1, 2998.00, 'delivered', DATE_SUB(NOW(), INTERVAL 10 DAY));

-- Sample order items
INSERT IGNORE INTO order_item(item_id, order_id, pony_id, quantity, unit_price, subtotal) VALUES
(1, 1, 3, 2, 1499.00, 2998.00);

-- Sample reviews
INSERT IGNORE INTO review(review_id, customer_id, pony_id, rating, comment, is_verified) VALUES
(1, 1, 3, 5, 'Great quality! Love it.', TRUE),
(2, 1, 8, 4, 'Beautiful design with fast shipping.', TRUE);

-- Sample wishlist
INSERT IGNORE INTO wishlist_item(wishlist_id, customer_id, pony_id, priority, added_date) VALUES
(1, 1, 1, 5, NOW()),
(2, 1, 7, 4, NOW());

-- ============================================================================
-- PROCEDURES & FUNCTIONS
-- ============================================================================

-- Function to verify order total calculation
DELIMITER $$
DROP FUNCTION IF EXISTS verify_order_total$$
CREATE FUNCTION verify_order_total(p_order_id INT) RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_items_total DECIMAL(12,2);
  DECLARE v_order_total DECIMAL(12,2);
  DECLARE v_tax DECIMAL(10,2);
  DECLARE v_discount DECIMAL(10,2);
  
  SELECT SUM(subtotal) INTO v_items_total FROM order_item WHERE order_id = p_order_id;
  SELECT total, tax_amount, discount_amount INTO v_order_total, v_tax, v_discount 
    FROM orders WHERE order_id = p_order_id;
  
  IF v_items_total IS NULL THEN SET v_items_total = 0; END IF;
  IF v_tax IS NULL THEN SET v_tax = 0; END IF;
  IF v_discount IS NULL THEN SET v_discount = 0; END IF;
  
  RETURN ROUND(v_items_total + v_tax - v_discount, 2) = v_order_total;
END$$
DELIMITER ;

-- Procedure to get monthly sales report
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_monthly_sales$$
CREATE PROCEDURE sp_monthly_sales(IN p_year INT, IN p_month INT)
BEGIN
  SELECT 
    DATE_FORMAT(o.order_date, '%Y-%m') as month,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(oi.quantity) as total_items,
    SUM(oi.subtotal) as total_revenue,
    AVG(o.total) as avg_order_value,
    COUNT(DISTINCT o.customer_id) as unique_customers
  FROM orders o
  JOIN order_item oi ON o.order_id = oi.order_id
  WHERE YEAR(o.order_date) = p_year 
    AND MONTH(o.order_date) = p_month
    AND o.status IN ('delivered', 'shipped')
  GROUP BY DATE_FORMAT(o.order_date, '%Y-%m');
END$$
DELIMITER ;

-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================
