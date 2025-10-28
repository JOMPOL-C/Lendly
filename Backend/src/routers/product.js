const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController');
const productControllerPage = require('../Controllers/productControllerPage');
const { requireAdmin } = require('../middlewares/roleMiddleware');

// render ฟอร์มเพิ่มสินค้า
router.get("/add-product",requireAdmin, productController.renderAddProduct);


// เพิ่มสินค้า
router.post(
  "/products",
  requireAdmin,
  productController.upload,
  productController.createProduct
);

// อัปเดตสินค้า
router.post(
  "/products/:id/update",
  requireAdmin,
  productController.upload,
  productController.updateProduct
);

// ลบสินค้า
router
  .delete("/products/:id/delete", requireAdmin, productController.deleteProduct);


router.get("/products/:id/edit", productControllerPage.renderEditProduct);

// แสดงรายละเอียดสินค้า (ทีละตัว)
router.get("/products/:id", productController.getProductById);

// แสดงสินค้าทั้งหมดที่หน้า home
router.get('/home', (req, res) => productControllerPage.renderProductsPage(req, res, 'home'));
router.get('/category', (req, res) => productControllerPage.renderProductsPage(req, res, 'category'));


module.exports = router;
