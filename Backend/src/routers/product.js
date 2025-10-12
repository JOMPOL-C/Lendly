const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productControllers');
const productControllersPage = require('../Controllers/productControllersPage');

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

// ลบสินค้า
router.delete("/products/:id/delete", productController.deleteProduct);


router.get("/products/:id/edit", productControllersPage.renderEditProduct);

// แสดงรายละเอียดสินค้า (ทีละตัว)
router.get("/products/:id", productController.getProductById);

// แสดงสินค้าทั้งหมดที่หน้า home
router.get('/home', (req, res) => productControllersPage.renderProductsPage(req, res, 'home'));
router.get('/category', (req, res) => productControllersPage.renderProductsPage(req, res, 'category'));


module.exports = router;
