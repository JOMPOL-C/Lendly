const express = require("express");
const router = express.Router();
const promptpayController = require("../Controllers/promptpayController");

// ✅ สร้าง QR PromptPay
router.post("/payment/generate-qr", promptpayController.generatePromptPayQR);

module.exports = router;