# PonyParadise Database - Quick Reference Guide

## Common SQL Queries by Use Case

---

## 1. CUSTOMER OPERATIONS

### Register new customer
```sql
INSERT INTO customer (username, email, password, phone, address, city, created_at)
VALUES ('john_doe', 'john@email.com', 'hashed_bcrypt_password', '0812345678', '123 Main St', 'Bangkok', NOW());
-- Returns: customer_id (use for subsequent operations)
```

### Get customer profile
```sql
SELECT customer_id, username, email, phone, address, city, created_at, last_login
FROM customer
WHERE email = 'john@email.com' AND is_deleted = FALSE;
```

### Update customer address
```sql
UPDATE customer
SET address = '456 New St', city = 'Chiang Mai', updated_at = NOW()
WHERE customer_id = 1;
```

### Get customer order history
```sql
SELECT 
  o.order_id, o.order_date, o.status, o.total,
  COUNT(oi.item_id) as item_count,
  MAX(o.order_date) as last_order
FROM orders o
LEFT JOIN order_item oi ON o.order_id = oi.order_id
WHERE o.customer_id = 1 AND o.status != 'cancelled'
GROUP BY o.order_id, o.order_date, o.status, o.total
ORDER BY o.order_date DESC;
```

### Get customer lifetime value
```sql
SELECT 
  customer_id,
  username,
  COUNT(DISTINCT order_id) as total_orders,
  SUM(total) as lifetime_value,
  AVG(total) as avg_order_value,
  MAX(order_date) as last_purchase
FROM customer c
LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.status != 'cancelled'
WHERE c.customer_id = 1
GROUP BY c.customer_id, c.username;
```

### Soft delete customer (preserve data)
```sql
UPDATE customer
SET is_deleted = TRUE, is_active = FALSE, deleted_at = NOW()
WHERE customer_id = 1;
-- Note: All their orders and reviews remain intact
```

---

## 2. PRODUCT MANAGEMENT

### Get all available products
```sql
SELECT 
  p.pony_id,
  p.name,
  p.price,
  p.rarity,
  pt.type_name,
  p.stock_quantity,
  COUNT(r.review_id) as review_count,
  ROUND(AVG(r.rating), 2) as avg_rating
FROM pony p
LEFT JOIN pony_type pt ON p.type_id = pt.type_id
LEFT JOIN review r ON p.pony_id = r.pony_id AND r.is_deleted = FALSE
WHERE p.is_active = TRUE AND p.stock_quantity > 0
GROUP BY p.pony_id, p.name, p.price, p.rarity, pt.type_name, p.stock_quantity
ORDER BY p.name;
```

### Get product by ID with full details
```sql
SELECT 
  p.pony_id,
  p.name,
  p.description,
  p.price,
  p.rarity,
  pt.type_name,
  pt.special_ability,
  p.stock_quantity,
  p.image_url,
  COUNT(r.review_id) as review_count,
  ROUND(AVG(r.rating), 2) as avg_rating
FROM pony p
LEFT JOIN pony_type pt ON p.type_id = pt.type_id
LEFT JOIN review r ON p.pony_id = r.pony_id AND r.is_deleted = FALSE
WHERE p.pony_id = 1 AND p.is_active = TRUE
GROUP BY p.pony_id, p.name, p.description, p.price, p.rarity, pt.type_name, pt.special_ability, p.stock_quantity, p.image_url;
```

### Search products by name
```sql
SELECT 
  pony_id, name, price, rarity, stock_quantity,
  ROUND(AVG(r.rating), 2) as avg_rating
FROM pony p
LEFT JOIN review r ON p.pony_id = r.pony_id AND r.is_deleted = FALSE
WHERE p.is_active = TRUE 
  AND p.name LIKE CONCAT('%', 'Celestia', '%')
GROUP BY p.pony_id, p.name, p.price, p.rarity, p.stock_quantity;
```

### Browse products by type (category)
```sql
SELECT 
  pt.type_id,
  pt.type_name,
  pt.special_ability,
  COUNT(p.pony_id) as product_count,
  SUM(p.stock_quantity) as total_stock,
  AVG(p.price) as avg_price,
  MIN(p.price) as min_price,
  MAX(p.price) as max_price
FROM pony_type pt
LEFT JOIN pony p ON pt.type_id = p.type_id AND p.is_active = TRUE
GROUP BY pt.type_id, pt.type_name, pt.special_ability
HAVING COUNT(p.pony_id) > 0;
```

### Browse products by rarity
```sql
SELECT 
  rarity,
  COUNT(*) as count,
  SUM(stock_quantity) as total_stock,
  ROUND(AVG(price), 2) as avg_price
FROM pony
WHERE is_active = TRUE
GROUP BY rarity
ORDER BY rarity;
```

### Get low stock items (for reorder)
```sql
SELECT 
  pony_id, name, stock_quantity, price,
  (price * stock_quantity) as total_value
FROM pony
WHERE is_active = TRUE AND stock_quantity < 5
ORDER BY stock_quantity ASC;
```

### Update product stock
```sql
-- Method 1: Direct update (less audit trail)
UPDATE pony
SET stock_quantity = stock_quantity - 1
WHERE pony_id = 1 AND stock_quantity > 0;

-- Method 2: With audit trail (recommended)
START TRANSACTION;
UPDATE pony SET stock_quantity = stock_quantity - 1 WHERE pony_id = 1;
INSERT INTO stock_transaction (pony_id, transaction_type, quantity_change, reason)
VALUES (1, 'purchase', -1, 'Order #123 created');
COMMIT;
```

---

## 3. SHOPPING CART (Wishlist)

### Add item to wishlist
```sql
INSERT INTO wishlist_item (customer_id, pony_id, priority, added_date)
VALUES (1, 3, 5, NOW())
ON DUPLICATE KEY UPDATE
  priority = VALUES(priority),
  added_date = NOW();
```

### Get customer wishlist
```sql
SELECT 
  wi.wishlist_id,
  p.pony_id,
  p.name,
  p.price,
  p.rarity,
  pt.type_name,
  p.stock_quantity,
  wi.priority,
  wi.notes,
  wi.added_date,
  ROUND(AVG(r.rating), 2) as avg_rating
FROM wishlist_item wi
JOIN pony p ON wi.pony_id = p.pony_id
LEFT JOIN pony_type pt ON p.type_id = pt.type_id
LEFT JOIN review r ON p.pony_id = r.pony_id AND r.is_deleted = FALSE
WHERE wi.customer_id = 1
GROUP BY wi.wishlist_id, p.pony_id, p.name, p.price, p.rarity, pt.type_name, p.stock_quantity, wi.priority, wi.notes, wi.added_date
ORDER BY wi.priority DESC, wi.added_date DESC;
```

### Remove from wishlist
```sql
DELETE FROM wishlist_item
WHERE customer_id = 1 AND pony_id = 3;
```

### Check if product in wishlist
```sql
SELECT COUNT(*) as in_wishlist
FROM wishlist_item
WHERE customer_id = 1 AND pony_id = 3;
```

---

## 4. ORDER MANAGEMENT

### Create order (with idempotency)
```sql
-- Step 1: Check for existing order with same idempotency key
SELECT order_id FROM order_idempotency 
WHERE idempotency_key = 'uuid-from-client' AND status = 'created';

-- Step 2: If not found, create order within transaction
START TRANSACTION;
  INSERT INTO orders (customer_id, total, status, payment_method, order_date)
  VALUES (1, 2998.00, 'pending', 'credit_card', NOW());
  SET @new_order_id = LAST_INSERT_ID();
  
  INSERT INTO order_item (order_id, pony_id, quantity, unit_price, subtotal)
  VALUES 
    (@new_order_id, 3, 2, 1499.00, 2998.00);
  
  UPDATE pony SET stock_quantity = stock_quantity - 2 WHERE pony_id = 3;
  
  INSERT INTO order_idempotency (idempotency_key, customer_id, order_id, status)
  VALUES ('uuid-from-client', 1, @new_order_id, 'created');
COMMIT;
```

### Get order status
```sql
SELECT 
  o.order_id,
  o.order_date,
  o.status,
  o.total,
  o.estimated_delivery,
  o.actual_delivery,
  COUNT(oi.item_id) as item_count
FROM orders o
LEFT JOIN order_item oi ON o.order_id = oi.order_id
WHERE o.order_id = 1
GROUP BY o.order_id, o.order_date, o.status, o.total, o.estimated_delivery, o.actual_delivery;
```

### Get order details with items
```sql
SELECT 
  o.order_id,
  o.order_date,
  o.status,
  o.total,
  oi.item_id,
  p.name,
  p.rarity,
  pt.type_name,
  oi.quantity,
  oi.unit_price,
  oi.subtotal
FROM orders o
JOIN order_item oi ON o.order_id = oi.order_id
JOIN pony p ON oi.pony_id = p.pony_id
LEFT JOIN pony_type pt ON p.type_id = pt.type_id
WHERE o.order_id = 1
ORDER BY oi.item_id;
```

### Get all pending orders (for fulfillment)
```sql
SELECT 
  o.order_id,
  o.customer_id,
  c.username,
  c.email,
  c.phone,
  c.address,
  o.order_date,
  DATEDIFF(NOW(), o.order_date) as days_pending,
  o.total,
  GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, '×)') SEPARATOR ', ') as items
FROM orders o
JOIN customer c ON o.customer_id = c.customer_id
JOIN order_item oi ON o.order_id = oi.order_id
JOIN pony p ON oi.pony_id = p.pony_id
WHERE o.status = 'pending'
GROUP BY o.order_id, o.customer_id, c.username, c.email, c.phone, c.address, o.order_date, o.total
ORDER BY o.order_date ASC;
```

### Update order status
```sql
-- Mark as shipped
UPDATE orders
SET status = 'shipped', estimated_delivery = DATE_ADD(NOW(), INTERVAL 3 DAY), updated_at = NOW()
WHERE order_id = 1;

-- Mark as delivered
UPDATE orders
SET status = 'delivered', actual_delivery = NOW(), updated_at = NOW()
WHERE order_id = 1;
```

### Cancel order and restore stock
```sql
START TRANSACTION;
  -- Restore stock for all items
  UPDATE pony p
  SET stock_quantity = stock_quantity + (
    SELECT COALESCE(SUM(oi.quantity), 0)
    FROM order_item oi
    WHERE oi.order_id = 1 AND oi.pony_id = p.pony_id
  )
  WHERE pony_id IN (SELECT pony_id FROM order_item WHERE order_id = 1);
  
  -- Mark order as cancelled
  UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE order_id = 1;
  
  -- Log the cancellation
  INSERT INTO stock_transaction (pony_id, transaction_type, quantity_change, reference_id, reason)
  SELECT pony_id, 'return', quantity, 1, 'Order cancelled'
  FROM order_item WHERE order_id = 1;
COMMIT;
```

### Process return
```sql
START TRANSACTION;
  -- Restore stock
  UPDATE pony SET stock_quantity = stock_quantity + 2 WHERE pony_id = 3;
  
  -- Update order status
  UPDATE orders SET status = 'returned', updated_at = NOW() WHERE order_id = 1;
  
  -- Log return
  INSERT INTO stock_transaction (pony_id, transaction_type, quantity_change, reference_id, reason)
  VALUES (3, 'return', 2, 1, 'Customer return requested');
COMMIT;
```

---

## 5. REVIEWS & RATINGS

### Add review (verified purchase)
```sql
-- First verify customer purchased this product
SELECT COUNT(*) as purchased
FROM order_item oi
JOIN orders o ON oi.order_id = o.order_id
WHERE o.customer_id = 1 AND oi.pony_id = 3 AND o.status IN ('shipped', 'delivered');

-- If purchased = 1, insert review:
INSERT INTO review (customer_id, pony_id, rating, comment, is_verified)
VALUES (1, 3, 5, 'Amazing quality! Love the Applejack design.', TRUE)
ON DUPLICATE KEY UPDATE
  rating = VALUES(rating),
  comment = VALUES(comment),
  updated_at = NOW();
```

### Get reviews for product
```sql
SELECT 
  r.review_id,
  r.rating,
  r.comment,
  c.username,
  r.is_verified,
  r.helpful_count,
  r.created_at
FROM review r
JOIN customer c ON r.customer_id = c.customer_id
WHERE r.pony_id = 3 AND r.is_deleted = FALSE
ORDER BY r.created_at DESC;
```

### Get product rating summary
```sql
SELECT 
  p.pony_id,
  p.name,
  COUNT(r.review_id) as review_count,
  ROUND(AVG(r.rating), 2) as avg_rating,
  SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as five_star,
  SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as four_star,
  SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as three_star,
  SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as two_star,
  SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as one_star
FROM pony p
LEFT JOIN review r ON p.pony_id = r.pony_id AND r.is_deleted = FALSE
WHERE p.pony_id = 3
GROUP BY p.pony_id, p.name;
```

### Get customer reviews
```sql
SELECT 
  r.review_id,
  p.name,
  r.rating,
  r.comment,
  r.created_at
FROM review r
JOIN pony p ON r.pony_id = p.pony_id
WHERE r.customer_id = 1 AND r.is_deleted = FALSE
ORDER BY r.created_at DESC;
```

### Mark review as helpful
```sql
UPDATE review
SET helpful_count = helpful_count + 1
WHERE review_id = 5;
```

### Delete review (soft delete)
```sql
UPDATE review
SET is_deleted = TRUE
WHERE review_id = 5;
```

---

## 6. ANALYTICS & REPORTING

### Sales by product (Top 10)
```sql
SELECT 
  p.pony_id,
  p.name,
  pt.type_name,
  SUM(oi.quantity) as total_sold,
  SUM(oi.subtotal) as total_revenue,
  COUNT(DISTINCT o.order_id) as order_count,
  ROUND(SUM(oi.subtotal) / SUM(oi.quantity), 2) as avg_price_per_unit
FROM order_item oi
JOIN orders o ON oi.order_id = o.order_id AND o.status IN ('delivered', 'shipped')
JOIN pony p ON oi.pony_id = p.pony_id
LEFT JOIN pony_type pt ON p.type_id = pt.type_id
GROUP BY p.pony_id, p.name, pt.type_name
ORDER BY total_revenue DESC
LIMIT 10;
```

### Monthly revenue
```sql
SELECT 
  DATE_FORMAT(o.order_date, '%Y-%m') as month,
  COUNT(DISTINCT o.order_id) as orders,
  COUNT(DISTINCT o.customer_id) as customers,
  SUM(oi.quantity) as items_sold,
  SUM(oi.subtotal) as revenue,
  ROUND(SUM(oi.subtotal) / COUNT(DISTINCT o.order_id), 2) as avg_order_value
FROM orders o
JOIN order_item oi ON o.order_id = oi.order_id
WHERE o.status IN ('delivered', 'shipped')
GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
ORDER BY month DESC;
```

### Customer segmentation (RFM)
```sql
SELECT 
  CASE 
    WHEN DATEDIFF(NOW(), MAX(o.order_date)) <= 30 THEN 'Recent'
    WHEN DATEDIFF(NOW(), MAX(o.order_date)) <= 90 THEN 'At Risk'
    ELSE 'Dormant'
  END as recency,
  CASE 
    WHEN COUNT(o.order_id) >= 5 THEN 'High'
    WHEN COUNT(o.order_id) >= 2 THEN 'Medium'
    ELSE 'Low'
  END as frequency,
  COUNT(DISTINCT c.customer_id) as customer_count,
  ROUND(SUM(o.total), 2) as segment_revenue,
  ROUND(AVG(o.total), 2) as avg_spent
FROM customer c
LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.status IN ('delivered', 'shipped')
WHERE c.is_deleted = FALSE
GROUP BY recency, frequency
ORDER BY segment_revenue DESC;
```

### Conversion rate (Wishlist → Purchase)
```sql
SELECT 
  p.name,
  COUNT(DISTINCT wi.wishlist_id) as wishlist_count,
  COUNT(DISTINCT oi.order_id) as purchase_count,
  ROUND(100 * COUNT(DISTINCT oi.order_id) / COUNT(DISTINCT wi.wishlist_id), 2) as conversion_rate
FROM wishlist_item wi
LEFT JOIN pony p ON wi.pony_id = p.pony_id
LEFT JOIN order_item oi ON wi.pony_id = oi.pony_id
LEFT JOIN orders o ON oi.order_id = o.order_id AND o.status IN ('delivered', 'shipped')
GROUP BY p.name
ORDER BY conversion_rate DESC;
```

---

## 7. MAINTENANCE & TROUBLESHOOTING

### Verify data integrity
```sql
-- Check for orphaned order items
SELECT oi.item_id FROM order_item oi
LEFT JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_id IS NULL;

-- Check for invalid reviews
SELECT r.review_id FROM review r
LEFT JOIN pony p ON r.pony_id = p.pony_id
WHERE p.pony_id IS NULL;

-- Check for order total mismatches
SELECT o.order_id, o.total, SUM(oi.subtotal) as calculated_total
FROM orders o
LEFT JOIN order_item oi ON o.order_id = oi.order_id
GROUP BY o.order_id, o.total
HAVING o.total != COALESCE(SUM(oi.subtotal), 0);
```

### Check stock consistency
```sql
SELECT 
  p.pony_id,
  p.name,
  p.stock_quantity as current_stock,
  COALESCE(SUM(st.quantity_change), 0) as calculated_stock,
  CASE 
    WHEN p.stock_quantity = COALESCE(SUM(st.quantity_change), 0) THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM pony p
LEFT JOIN stock_transaction st ON p.pony_id = st.pony_id
GROUP BY p.pony_id, p.name, p.stock_quantity
ORDER BY status DESC;
```

### View audit log
```sql
SELECT * FROM audit_log
WHERE table_name = 'orders'
ORDER BY changed_at DESC
LIMIT 20;
```

### Database size
```sql
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.tables
WHERE table_schema = 'pony_shop'
ORDER BY (data_length + index_length) DESC;
```

---

## 8. PERFORMANCE ANALYSIS

### Query execution plan
```sql
EXPLAIN SELECT * FROM pony WHERE name LIKE '%Celestia%';
-- Look for "type: index" or "type: ref" (good)
-- Avoid "type: ALL" (full table scan)
```

### Slow queries log
```sql
-- Enable slow query log (5 seconds threshold)
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 5;

-- View slow queries
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;
```

### Index usage statistics
```sql
SELECT 
  object_schema,
  object_name,
  index_name,
  count_read,
  count_write
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'pony_shop'
ORDER BY count_read DESC;
```

---

## Quick Command Reference

| Operation | Use Query |
|-----------|-----------|
| Create order | `INSERT INTO orders` + `INSERT INTO order_item` |
| Check order status | `SELECT * FROM orders WHERE order_id = ?` |
| Get product details | Browse product by name query |
| Add to wishlist | `INSERT INTO wishlist_item` |
| Submit review | `INSERT INTO review` (if verified) |
| Process return | Cancel order + restore stock transaction |
| Get sales report | Monthly revenue query |
| Check customer value | Lifetime value query |
| Verify data | Verify data integrity queries |

---

**Last Updated:** 2026-03-22  
**Database:** PonyParadise (TiDB Cloud)
