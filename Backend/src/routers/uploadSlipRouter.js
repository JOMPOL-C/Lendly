const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");

router.post("/orders/upload-slip", (req, res, next) => {
  console.log("📥 [UPLOAD-SLIP] Incoming form...");
  next();
}, orderController.uploadSlip); // ❌ เอา upload.single ออก


module.exports = router;
