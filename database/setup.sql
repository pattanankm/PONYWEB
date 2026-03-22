CREATE TABLE pony_type (
  type_id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(50),
  special_ability VARCHAR(100)
);

CREATE TABLE pony (
  pony_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL(10,2),
  rarity VARCHAR(10),
  type_id INT,
  FOREIGN KEY (type_id) REFERENCES pony_type(type_id)
);

CREATE TABLE customer (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  password VARCHAR(100),
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  order_date DATETIME,
  status VARCHAR(20),
  customer_id INT,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE order_item (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  pony_id INT,
  quantity INT,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (pony_id) REFERENCES pony(pony_id)
);

CREATE TABLE review (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  pony_id INT,
  rating INT,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  FOREIGN KEY (pony_id) REFERENCES pony(pony_id)
);

CREATE TABLE wishlist_item (
  wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  pony_id INT,
  added_date DATETIME
);

INSERT INTO pony_type(type_name,special_ability)
VALUES
('Unicorn','Magic'),
('Pegasus','Flying'),
('Earth Pony','Strength');

INSERT INTO pony(name,price,rarity,type_id)
VALUES
('Princess Celestia',5999,'A',1),
('Princess Luna',5999,'A',1),
('Applejack',1499,'B',3),
('Fluttershy',1499,'B',2),
('Rainbow Dash',1499,'B',2),
('Pinkie Pie',1499,'B',3);
