const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productControllers');

// render ฟอร์มเพิ่มสินค้า
router.get("/add-product", productController.renderAddProduct);

// เพิ่มสินค้า
router.post(
  "/products",
  productController.upload.single("product_image"),
  productController.createProduct
);

// แสดงสินค้าทั้งหมด
router.get("/", productController.getProducts);

module.exports = router;
