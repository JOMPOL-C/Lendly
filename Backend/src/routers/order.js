const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");
const { validateProfileBeforeRent } = require("../validators/profileValidator");

// ✅ ป้องกันไม่ให้ router นี้กิน route /orders/upload-slip
router.use((req, res, next) => {
  if (req.originalUrl.includes("/upload-slip")) {
    console.log("🟡 skip order.js router for upload-slip");
    return next("router");
  }
  next();
});

// ✅ ลูกค้าสร้างออเดอร์ (เช็กข้อมูลโปรไฟล์ก่อน)
router.post(
  "/orders",
  authMiddleware,
  validateProfileBeforeRent,   // ✅ ตรวจสอบข้อมูลโปรไฟล์ก่อนสร้างออเดอร์
  orderController.createOrder
);

// ✅ แอดมินยืนยันคำสั่งเช่า
router.put("/orders/:id/confirm", orderController.confirmOrder);

module.exports = router;
