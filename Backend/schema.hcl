table "Bank" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "bank_id" {
    null = false
    type = varchar(9)
  }
  column "bank_name" {
    null = true
    type = varchar(45)
  }
  primary_key {
    columns = [column.bank_id]
  }
}
table "Calender" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "rental_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัาการเช่า"
  }
  column "fk_calender_customer" {
    null = true
    type = varchar(9)
  }
  column "fk_calender_product" {
    null = true
    type = varchar(9)
  }
  column "rental_date" {
    null    = true
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
    comment = "วันที่เช่า"
  }
  column "rental_end_date" {
    null    = true
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
    comment = "วันที่คืน"
  }
  column "rental_status" {
    null    = true
    type    = enum("รอชำระเงิน","กำลังเช่า","คืนแล้ว","ยกเลิก")
    comment = "สถานะการเช่า"
  }
  primary_key {
    columns = [column.rental_id]
  }
  foreign_key "fk_calender_customer" {
    columns     = [column.fk_calender_customer]
    ref_columns = [table.Customer.column.customer_id]
    on_update   = CASCADE
    on_delete   = RESTRICT
  }
  foreign_key "fk_calender_product" {
    columns     = [column.fk_calender_product]
    ref_columns = [table.Product.column.product_id]
    on_update   = CASCADE
    on_delete   = RESTRICT
  }
  index "FK_customer_id_idx" {
    columns = [column.fk_calender_customer]
  }
  index "FK_product_id" {
    columns = [column.fk_calender_product]
  }
}
table "Category" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "category_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัาหมวดหมู่"
  }
  column "category_name" {
    null    = false
    type    = varchar(45)
    comment = "ชื่อหมวดหมู่"
  }
  primary_key {
    columns = [column.category_id]
  }
}
table "Chat" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "chat_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัสการสนทนา"
  }
  column "fk_chat_customer" {
    null = true
    type = varchar(9)
  }
  column "fk_chat_store" {
    null = true
    type = varchar(9)
  }
  column "chat_detail" {
    null    = true
    type    = text
    comment = "รายระเอียดการสนทนา"
  }
  column "chat_datetime" {
    null    = true
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
  }
  primary_key {
    columns = [column.chat_id]
  }
  foreign_key "fk_chat_customer" {
    columns     = [column.fk_chat_customer]
    ref_columns = [table.Customer.column.customer_id]
    on_update   = CASCADE
    on_delete   = NO_ACTION
  }
  foreign_key "fk_chat_store" {
    columns     = [column.fk_chat_store]
    ref_columns = [table.Store.column.store_id]
    on_update   = CASCADE
    on_delete   = NO_ACTION
  }
  index "fk_chat_store_idx" {
    columns = [column.fk_chat_store]
  }
  index "FK_customer_id" {
    columns = [column.fk_chat_customer]
  }
}
table "County" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "county_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัสจังหวัด"
  }
  column "county_name" {
    null    = false
    type    = varchar(40)
    comment = "ชื่อจังหวัด"
  }
  primary_key {
    columns = [column.county_id]
  }
}
table "Customer" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "customer_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัสลูกค้า"
  }
  column "fk_customer_proportion" {
    null = true
    type = varchar(9)
  }
  column "name" {
    null    = false
    type    = varchar(45)
    comment = "ชื่อจริง"
  }
  column "last_name" {
    null    = false
    type    = varchar(45)
    comment = "นามสกุล"
  }
  column "customer_email" {
    null    = true
    type    = varchar(45)
    comment = "อีเมลลูกค้า"
  }
  column "customer_phone" {
    null    = true
    type    = varchar(10)
    comment = "เบอร์โทรลูกค้า"
  }
  column "address" {
    null    = true
    type    = varchar(255)
    comment = "ที่อยู่"
  }
  column "id_card_number" {
    null = true
    type = varchar(13)
  }
  column "card_image" {
    null    = true
    type    = blob
    comment = "รูปบัตร ปชช"
  }
  column "username" {
    null    = false
    type    = varchar(30)
    comment = "ชื่อผู้ใช้"
  }
  column "password" {
    null    = false
    type    = varchar(255)
    comment = "รหัสผ่าน"
  }
  column "customer_datetime" {
    null    = false
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
    comment = "วัน/เวลาที่สมัครสมาชิก"
  }
  primary_key {
    columns = [column.customer_id]
  }
  foreign_key "fk_customer_proportion" {
    columns     = [column.fk_customer_proportion]
    ref_columns = [table.Proportion.column.proportion_id]
    on_update   = CASCADE
    on_delete   = SET_NULL
  }
  index "_idx" {
    columns = [column.fk_customer_proportion]
  }
  index "customer_email_UNIQUE" {
    unique  = true
    columns = [column.customer_email]
  }
  index "customer_phone_UNIQUE" {
    unique  = true
    columns = [column.customer_phone]
  }
  index "id_card_number" {
    unique  = true
    columns = [column.id_card_number]
  }
  index "id_card_number_UNIQUE" {
    unique  = true
    columns = [column.id_card_number]
  }
  index "username_UNIQUE" {
    unique  = true
    columns = [column.username]
  }
}
table "Order" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "order_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัสคำสั่งซื้อ"
  }
  column "fk_order_customer" {
    null = true
    type = varchar(9)
  }
  column "total_price" {
    null     = false
    type     = decimal(10,2)
    unsigned = false
    comment  = "ราคารวม"
  }
  column "deposit_amount" {
    null     = true
    type     = decimal(10,2)
    unsigned = false
    comment  = "ยอดมัดจำ (ถ้ามี)"
  }
  primary_key {
    columns = [column.order_id]
  }
  foreign_key "fk_order_customer" {
    columns     = [column.fk_order_customer]
    ref_columns = [table.Customer.column.customer_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "fk_order_customer_idx" {
    columns = [column.fk_order_customer]
  }
}
table "Payment" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "payment_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัสการชำระเงิน"
  }
  column "fk_payment_order" {
    null = true
    type = varchar(9)
  }
  column "fk_payment_pmt" {
    null    = true
    type    = varchar(9)
    comment = "วิธีการชำระ"
  }
  column "fk_payment_bank" {
    null = true
    type = varchar(9)
  }
  column "payment_date" {
    null    = true
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
    comment = "วันที่ชำระ"
  }
  column "payment_amounf" {
    null     = false
    type     = decimal(10,2)
    unsigned = false
    comment  = "ยอดเงินที่ชำระ"
  }
  column "payment_proof" {
    null    = true
    type    = blob
    comment = "หลักฐานการชำระ"
  }
  primary_key {
    columns = [column.payment_id]
  }
  foreign_key "fk_payment_bank" {
    columns     = [column.fk_payment_bank]
    ref_columns = [table.Bank.column.bank_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "fk_payment_order" {
    columns     = [column.fk_payment_order]
    ref_columns = [table.Order.column.order_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "fk_payment_pmt" {
    columns     = [column.fk_payment_pmt]
    ref_columns = [table.Payment_method.column.payment_method_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "fk_payment_bank_idx" {
    columns = [column.fk_payment_bank]
  }
  index "fk_payment_order_idx" {
    columns = [column.fk_payment_order]
  }
  index "fk_payment_pmt_idx" {
    columns = [column.fk_payment_pmt]
  }
}
table "Payment_method" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "payment_method_id" {
    null = false
    type = varchar(9)
  }
  column "payment_method_name" {
    null = true
    type = varchar(45)
  }
  primary_key {
    columns = [column.payment_method_id]
  }
}
table "Product" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "product_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัสสินค้า"
  }
  column "fk_product_store" {
    null = true
    type = varchar(9)
  }
  column "fk_product_pp" {
    null = true
    type = varchar(9)
  }
  column "fk_product_category" {
    null = true
    type = varchar(9)
  }
  column "fk_product_county" {
    null = true
    type = varchar(9)
  }
  column "product_name" {
    null    = false
    type    = varchar(45)
    comment = "ชื่อสินค้า"
  }
  column "price" {
    null     = false
    type     = decimal(10,2)
    unsigned = false
    comment  = "ราคาสินค้า"
  }
  column "shipping_info" {
    null    = true
    type    = varchar(255)
    comment = "ขนาดของสินค้า , น้ำหนักสินค้า"
  }
  column "rental_period" {
    null    = false
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
    comment = "ระยะเวลาให้เช่า"
  }
  primary_key {
    columns = [column.product_id]
  }
  foreign_key "fk_product_category" {
    columns     = [column.fk_product_category]
    ref_columns = [table.Category.column.category_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "fk_product_county" {
    columns     = [column.fk_product_county]
    ref_columns = [table.County.column.county_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "fk_product_pp" {
    columns     = [column.fk_product_pp]
    ref_columns = [table.Proportion_product.column.proportion_product_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "fk_product_store" {
    columns     = [column.fk_product_store]
    ref_columns = [table.Store.column.store_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "category_id_idx" {
    columns = [column.fk_product_category]
  }
  index "county_id_idx" {
    columns = [column.fk_product_county]
  }
  index "fk_product_pp_idx" {
    columns = [column.fk_product_pp]
  }
  index "store_id_idx" {
    columns = [column.fk_product_store]
  }
}
table "Proportion" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "proportion_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัสสัดส่วน"
  }
  column "chest" {
    null     = true
    type     = decimal(5,1)
    unsigned = false
    comment  = "รอบอก"
  }
  column "waist" {
    null     = true
    type     = decimal(5,1)
    unsigned = false
    comment  = "รอบเอว"
  }
  column "hips" {
    null     = true
    type     = decimal(5,1)
    unsigned = false
    comment  = "รอบสะโพก"
  }
  primary_key {
    columns = [column.proportion_id]
  }
}
table "Proportion_product" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "proportion_product_id" {
    null = false
    type = varchar(9)
  }
  column "chest" {
    null     = true
    type     = decimal(5,1)
    unsigned = false
  }
  column "waist" {
    null     = true
    type     = decimal(5,1)
    unsigned = false
  }
  column "hips" {
    null     = true
    type     = decimal(5,1)
    unsigned = false
  }
  primary_key {
    columns = [column.proportion_product_id]
  }
}
table "Report" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "report_id" {
    null = false
    type = varchar(9)
  }
  column "fk_report_product" {
    null = true
    type = varchar(9)
  }
  column "fk_report_rental" {
    null = true
    type = varchar(9)
  }
  column "report_topics" {
    null    = false
    type    = text
    comment = "หัวข้อการรายงาน"
  }
  column "report_detail" {
    null    = true
    type    = text
    comment = "รายละเอียดการรายงาน"
  }
  column "report_file" {
    null    = true
    type    = blob
    comment = "รูป วีดิโอ"
  }
  column "report_fine" {
    null     = true
    type     = decimal(10,2)
    unsigned = false
    comment  = "ค่าปรับ"
  }
  column "report_datetime" {
    null    = true
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
  }
  primary_key {
    columns = [column.report_id]
  }
  foreign_key "fk_report_product" {
    columns     = [column.fk_report_product]
    ref_columns = [table.Product.column.product_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "fk_report_rental" {
    columns     = [column.fk_report_rental]
    ref_columns = [table.Calender.column.rental_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "fk_report_product_idx" {
    columns = [column.fk_report_product]
  }
  index "fk_report_rental_idx" {
    columns = [column.fk_report_rental]
  }
}
table "Review" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "review_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัสรีวิว"
  }
  column "fk_review_customer" {
    null = true
    type = varchar(9)
  }
  column "fk_review_product" {
    null = true
    type = varchar(9)
  }
  column "review_details" {
    null    = true
    type    = text
    comment = "รายระเอียดการรีวิว"
  }
  column "review_datetime" {
    null    = true
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
    comment = "วันเวลาที่รีวิว"
  }
  column "review_score" {
    null    = false
    type    = tinyint
    comment = "คะแนนการรีวิว"
  }
  column "review_file" {
    null    = true
    type    = blob
    comment = "รูป วีดิโอ"
  }
  primary_key {
    columns = [column.review_id]
  }
  foreign_key "fk_review_customer" {
    columns     = [column.fk_review_customer]
    ref_columns = [table.Customer.column.customer_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "fk_review_product" {
    columns     = [column.fk_review_product]
    ref_columns = [table.Product.column.product_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "fk_review_customer_idx" {
    columns = [column.fk_review_customer]
  }
  index "fk_review_product_idx" {
    columns = [column.fk_review_product]
  }
}
table "Shipping" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "shipping_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัสการจัดส่ง"
  }
  column "fk_shipping_order" {
    null = true
    type = varchar(9)
  }
  column "tracking" {
    null    = false
    type    = varchar(13)
    comment = "เลขพัสดุ"
  }
  column "shipping_date" {
    null    = true
    type    = datetime
    comment = "วันที่จัดส่ง"
  }
  column "shipping_status" {
    null    = true
    type    = enum("กำลังจัดส่ง","จัดส่งสำเร็จ")
    comment = "สถานะการจัดส่ง"
  }
  column "shipping_name" {
    null    = true
    type    = varchar(45)
    comment = "ชื่อขนส่ง"
  }
  column "shipping_end_date" {
    null    = true
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
    comment = "วันที่จัดส่งสำเร็จ"
  }
  primary_key {
    columns = [column.shipping_id]
  }
  foreign_key "fk_shipping_order" {
    columns     = [column.fk_shipping_order]
    ref_columns = [table.Order.column.order_id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "fk_shipping_order_idx" {
    columns = [column.fk_shipping_order]
  }
}
table "Store" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "store_id" {
    null    = false
    type    = varchar(9)
    comment = "รหัสร้านค้า"
  }
  column "store_name" {
    null    = false
    type    = varchar(45)
    comment = "ชื่อร้านค้า"
  }
  column "store_email" {
    null    = true
    type    = varchar(45)
    comment = "อีเมลร้านค้า"
  }
  column "store_phone" {
    null    = true
    type    = varchar(10)
    comment = "เบอร์โทรร้านค้า"
  }
  primary_key {
    columns = [column.store_id]
  }
}
table "_prisma_migrations" {
  schema  = schema.Lendly_db
  collate = "utf8mb4_unicode_ci"
  column "id" {
    null = false
    type = varchar(36)
  }
  column "checksum" {
    null = false
    type = varchar(64)
  }
  column "finished_at" {
    null = true
    type = datetime(3)
  }
  column "migration_name" {
    null = false
    type = varchar(255)
  }
  column "logs" {
    null = true
    type = text
  }
  column "rolled_back_at" {
    null = true
    type = datetime(3)
  }
  column "started_at" {
    null    = false
    type    = datetime(3)
    default = sql("CURRENT_TIMESTAMP(3)")
  }
  column "applied_steps_count" {
    null     = false
    type     = int
    default  = 0
    unsigned = true
  }
  primary_key {
    columns = [column.id]
  }
}
table "bank_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_bank" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_bank]
  }
}
table "calender_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_calender" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_calender]
  }
}
table "category_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_category" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_category]
  }
}
table "chat_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_chat" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_chat]
  }
}
table "county_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_county" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_county]
  }
}
table "customer_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_c" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_c]
  }
}
table "order_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_order" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_order]
  }
}
table "payment_method_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_pay_method" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_pay_method]
  }
}
table "payment_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_payment" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_payment]
  }
}
table "product_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_p" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_p]
  }
}
table "proportion_product_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_pp_product" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_pp_product]
  }
}
table "proportion_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_pp" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_pp]
  }
}
table "report_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_report" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_report]
  }
}
table "review_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_review" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_review]
  }
}
table "shipping_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_post" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_post]
  }
}
table "store_seq" {
  schema  = schema.Lendly_db
  charset = "utf8mb3"
  collate = "utf8mb3_general_ci"
  column "id_s" {
    null           = false
    type           = int
    auto_increment = true
  }
  primary_key {
    columns = [column.id_s]
  }
}
schema "Lendly_db" {
  charset = "utf8mb4"
  collate = "utf8mb4_0900_ai_ci"
}
