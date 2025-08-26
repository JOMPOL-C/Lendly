-- Trigger: Bank
CREATE TRIGGER Bank_BEFORE_INSERT
BEFORE INSERT ON Bank
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO bank_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.bank_id = CONCAT('BANK', LPAD(seq, 3, '0'));
END;

-- Trigger: Calender
CREATE TRIGGER Calender_BEFORE_INSERT
BEFORE INSERT ON Calender
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO calender_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.rental_id = CONCAT('RENTAL', LPAD(seq, 9, '0'));
END;

-- Trigger: Category
CREATE TRIGGER Category_BEFORE_INSERT
BEFORE INSERT ON Category
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO category_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.category_id = CONCAT('CATEGORY', LPAD(seq, 3, '0'));
END;

-- Trigger: Chat
CREATE TRIGGER Chat_BEFORE_INSERT
BEFORE INSERT ON Chat
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO chat_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.chat_id = CONCAT('CHAT', LPAD(seq, 9, '0'));
END;

-- Trigger: County
CREATE TRIGGER County_BEFORE_INSERT
BEFORE INSERT ON County
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO county_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.county_id = CONCAT('COUNTY', LPAD(seq, 3, '0'));
END;

-- Trigger: Customer
CREATE TRIGGER Customer_BEFORE_INSERT
BEFORE INSERT ON Customer
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO customer_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.customer_id = CONCAT('C', LPAD(seq, 6, '0'));
END;

-- Trigger: Order
CREATE TRIGGER Order_BEFORE_INSERT
BEFORE INSERT ON `Order`
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO order_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.order_id = CONCAT('ORDER', LPAD(seq, 9, '0'));
END;

-- Trigger: Payment
CREATE TRIGGER Payment_BEFORE_INSERT
BEFORE INSERT ON Payment
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO payment_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.payment_id = CONCAT('PAYMENT', LPAD(seq, 9, '0'));
END;

-- Trigger: Payment_method
CREATE TRIGGER Payment_method_BEFORE_INSERT
BEFORE INSERT ON Payment_method
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO payment_method_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.payment_method_id = CONCAT('PAY_METHOD', LPAD(seq, 3, '0'));
END;

-- Trigger: Product
CREATE TRIGGER Product_BEFORE_INSERT
BEFORE INSERT ON Product
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO product_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.product_id = CONCAT('Product', LPAD(seq, 6, '0'));
END;

-- Trigger: Proportion
CREATE TRIGGER Proportion_BEFORE_INSERT
BEFORE INSERT ON Proportion
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO proportion_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.proportion_id = CONCAT('PP', LPAD(seq, 6, '0'));
END;

-- Trigger: Proportion_product
CREATE TRIGGER Proportion_product_BEFORE_INSERT
BEFORE INSERT ON Proportion_product
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO proportion_product_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.proportion_product_id = CONCAT('PP_PRODUCT', LPAD(seq, 9, '0'));
END;

-- Trigger: Report
CREATE TRIGGER Report_BEFORE_INSERT
BEFORE INSERT ON Report
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO report_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.report_id = CONCAT('REPORT', LPAD(seq, 9, '0'));
END;

-- Trigger: Review
CREATE TRIGGER Review_BEFORE_INSERT
BEFORE INSERT ON Review
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO review_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.review_id = CONCAT('REVIEW', LPAD(seq, 9, '0'));
END;

-- Trigger: Shipping
CREATE TRIGGER Shipping_BEFORE_INSERT
BEFORE INSERT ON Shipping
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO shipping_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.shipping_id = CONCAT('POST', LPAD(seq, 9, '0'));
END;

-- Trigger: Store
CREATE TRIGGER Store_BEFORE_INSERT
BEFORE INSERT ON Store
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  INSERT INTO store_seq VALUES (NULL);
  SET seq = LAST_INSERT_ID();
  SET NEW.store_id = CONCAT('S', LPAD(seq, 6, '0'));
END;
