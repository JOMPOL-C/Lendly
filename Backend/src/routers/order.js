const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ ป้องกันไม่ให้ router นี้กิน route /orders/upload-slip
router.use((req, res, next) => {
    if (req.originalUrl.includes("/upload-slip")) {
      console.log("🟡 skip order.js router for upload-slip");
      return next("router"); // <-- บอก Express ให้ข้าม router นี้ไปเลย
    }
    next();
  });
  
// ✅ ลูกค้าสร้างออเดอร์
router.post("/orders", authMiddleware, orderController.createOrder);

// ✅ แอดมินยืนยันคำสั่งเช่า
router.put("/orders/:id/confirm", orderController.confirmOrder);

module.exports = router;
