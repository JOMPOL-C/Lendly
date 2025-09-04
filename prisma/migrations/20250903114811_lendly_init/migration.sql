-- CreateTable
CREATE TABLE `Bank` (
    `bank_id` VARCHAR(9) NOT NULL,
    `bank_name` VARCHAR(45) NULL,

    PRIMARY KEY (`bank_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Calender` (
    `rental_id` VARCHAR(9) NOT NULL,
    `fk_calender_customer` VARCHAR(9) NULL,
    `fk_calender_product` VARCHAR(9) NULL,
    `rental_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `rental_end_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `rental_status` ENUM('รอชำระเงิน', 'กำลังเช่า', 'คืนแล้ว', 'ยกเลิก') NULL,

    INDEX `FK_customer_id_idx`(`fk_calender_customer`),
    INDEX `FK_product_id`(`fk_calender_product`),
    PRIMARY KEY (`rental_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `category_id` VARCHAR(9) NOT NULL,
    `category_name` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `chat_id` VARCHAR(9) NOT NULL,
    `fk_chat_customer` VARCHAR(9) NULL,
    `fk_chat_store` VARCHAR(9) NULL,
    `chat_detail` TEXT NULL,
    `chat_datetime` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `FK_customer_id`(`fk_chat_customer`),
    INDEX `fk_chat_store_idx`(`fk_chat_store`),
    PRIMARY KEY (`chat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `County` (
    `county_id` VARCHAR(9) NOT NULL,
    `county_name` VARCHAR(40) NOT NULL,

    PRIMARY KEY (`county_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `customer_id` VARCHAR(9) NOT NULL,
    `fk_customer_proportion` VARCHAR(9) NULL,
    `name` VARCHAR(45) NOT NULL,
    `last_name` VARCHAR(45) NOT NULL,
    `customer_email` VARCHAR(45) NULL,
    `customer_phone` VARCHAR(10) NULL,
    `address` VARCHAR(255) NULL,
    `id_card_number` INTEGER UNSIGNED NULL,
    `card_image` BLOB NULL,
    `username` VARCHAR(30) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `customer_datetime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `customer_update` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customer_email_UNIQUE`(`customer_email`),
    UNIQUE INDEX `customer_phone_UNIQUE`(`customer_phone`),
    UNIQUE INDEX `id_card_number_UNIQUE`(`id_card_number`),
    UNIQUE INDEX `username_UNIQUE`(`username`),
    INDEX `_idx`(`fk_customer_proportion`),
    PRIMARY KEY (`customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `order_id` VARCHAR(9) NOT NULL,
    `fk_order_customer` VARCHAR(9) NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `deposit_amount` DECIMAL(10, 2) NULL,

    INDEX `fk_order_customer_idx`(`fk_order_customer`),
    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `payment_id` VARCHAR(9) NOT NULL,
    `fk_payment_order` VARCHAR(9) NULL,
    `fk_payment_pmt` VARCHAR(9) NULL,
    `fk_payment_bank` VARCHAR(9) NULL,
    `payment_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `payment_amounf` DECIMAL(10, 2) NOT NULL,
    `payment_proof` BLOB NULL,

    INDEX `fk_payment_bank_idx`(`fk_payment_bank`),
    INDEX `fk_payment_order_idx`(`fk_payment_order`),
    INDEX `fk_payment_pmt_idx`(`fk_payment_pmt`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment_method` (
    `payment_method_id` VARCHAR(9) NOT NULL,
    `payment_method_name` VARCHAR(45) NULL,

    PRIMARY KEY (`payment_method_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `product_id` VARCHAR(9) NOT NULL,
    `fk_product_store` VARCHAR(9) NULL,
    `fk_product_pp` VARCHAR(9) NULL,
    `fk_product_category` VARCHAR(9) NULL,
    `fk_product_county` VARCHAR(9) NULL,
    `product_name` VARCHAR(45) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `shipping_info` VARCHAR(255) NULL,
    `rental_period` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `product_update` DATETIME(3) NOT NULL,

    INDEX `category_id_idx`(`fk_product_category`),
    INDEX `county_id_idx`(`fk_product_county`),
    INDEX `fk_product_pp_idx`(`fk_product_pp`),
    INDEX `store_id_idx`(`fk_product_store`),
    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proportion` (
    `proportion_id` VARCHAR(9) NOT NULL,
    `chest` DECIMAL(5, 1) NULL,
    `waist` DECIMAL(5, 1) NULL,
    `hips` DECIMAL(5, 1) NULL,
    `proportion_update` DATETIME(3) NOT NULL,

    PRIMARY KEY (`proportion_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proportion_product` (
    `proportion_product_id` VARCHAR(9) NOT NULL,
    `chest` DECIMAL(5, 1) NULL,
    `waist` DECIMAL(5, 1) NULL,
    `hips` DECIMAL(5, 1) NULL,

    PRIMARY KEY (`proportion_product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `report_id` VARCHAR(9) NOT NULL,
    `fk_report_product` VARCHAR(9) NULL,
    `fk_report_rental` VARCHAR(9) NULL,
    `report_topics` TEXT NOT NULL,
    `report_detail` TEXT NULL,
    `report_file` BLOB NULL,
    `report_fine` DECIMAL(10, 2) NULL,
    `report_datetime` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_report_product_idx`(`fk_report_product`),
    INDEX `fk_report_rental_idx`(`fk_report_rental`),
    PRIMARY KEY (`report_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `review_id` VARCHAR(9) NOT NULL,
    `fk_review_customer` VARCHAR(9) NULL,
    `fk_review_product` VARCHAR(9) NULL,
    `review_details` TEXT NULL,
    `review_datetime` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `review_score` TINYINT NOT NULL,
    `review_file` BLOB NULL,

    INDEX `fk_review_customer_idx`(`fk_review_customer`),
    INDEX `fk_review_product_idx`(`fk_review_product`),
    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shipping` (
    `shipping_id` VARCHAR(9) NOT NULL,
    `fk_shipping_order` VARCHAR(9) NULL,
    `tracking` VARCHAR(13) NOT NULL,
    `shipping_date` DATETIME(0) NULL,
    `shipping_status` ENUM('กำลังจัดส่ง', 'จัดส่งสำเร็จ') NULL,
    `shipping_name` VARCHAR(45) NULL,
    `shipping_end_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_shipping_order_idx`(`fk_shipping_order`),
    PRIMARY KEY (`shipping_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Store` (
    `store_id` VARCHAR(9) NOT NULL,
    `store_name` VARCHAR(45) NOT NULL,
    `store_email` VARCHAR(45) NULL,
    `store_phone` VARCHAR(10) NULL,

    PRIMARY KEY (`store_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_seq` (
    `id_bank` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_bank`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calender_seq` (
    `id_calender` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_calender`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_seq` (
    `id_category` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_category`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_seq` (
    `id_chat` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_chat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `county_seq` (
    `id_county` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_county`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_seq` (
    `id_c` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_c`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_seq` (
    `id_order` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_order`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_method_seq` (
    `id_pay_method` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_pay_method`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_seq` (
    `id_payment` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_payment`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_seq` (
    `id_p` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_p`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proportion_product_seq` (
    `id_pp_product` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_pp_product`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proportion_seq` (
    `id_pp` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_pp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_seq` (
    `id_report` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_report`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_seq` (
    `id_review` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_review`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_seq` (
    `id_post` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_post`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_seq` (
    `id_s` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_s`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
