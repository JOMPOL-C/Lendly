const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productControllers');

// render ฟอร์มเพิ่มสินค้า
router.get("/add-product", productController.renderAddProduct);

// เพิ่มสินค้า
router.post(
  "/products",
  productController.upload,
  productController.createProduct
);

// อัปเดตสินค้า
router.post(
  "/products/:id/update",
  productController.upload,
  productController.updateProduct
);

router.get("/products/:id/edit", productController.renderEditProduct);


// แสดงรายละเอียดสินค้า (ทีละตัว)
router.get("/products/:id", productController.getProductById);

// แสดงสินค้าทั้งหมดที่หน้า home
router.get("/", productController.getProducts);


module.exports = router;
