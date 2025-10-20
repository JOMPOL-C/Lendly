const express = require('express');
const router = express.Router();
const shippingController = require("../Controllers/shippingController");
const { validateAddBox } = require("../validators/shippingValidator");

// ดึงสถานะจากไปรษณีย์ไทย
router
    .get('/tracking', shippingController.getTrackingStatus)
    .get("/admin/tracking", shippingController.getPendingShipments);

// เพิ่มกล่องจัดส่ง (แอดมิน)
router.post(
    "/shipping/addBox",
    validateAddBox,
    shippingController.upload.single("image_slip"),
    shippingController.addBox
);

module.exports = router;
