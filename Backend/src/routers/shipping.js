const express = require('express');
const router = express.Router();
const prisma = require("../../prisma/prisma");
const shippingController = require("../Controllers/shippingController");
const { validateAddBox } = require("../validators/shippingValidator");

router.get("/rentals/:id/shipping-id", async (req, res) => {
    const rental = await prisma.rentals.findUnique({
        where: { rental_id: parseInt(req.params.id) },
        include: { order: { include: { shippings: true } } }
    });
    const shippingId = rental?.order?.shippings?.[0]?.shipping_id;
    if (!shippingId) return res.status(404).json({ message: "ไม่พบ shippingId" });
    res.json({ shippingId });
});

console.log("💡 shippingController keys:", Object.keys(shippingController));
// ดึงสถานะจากไปรษณีย์ไทย
router
    .get('/tracking', shippingController.getTrackingStatus)
    .get("/tracking/order", shippingController.getOrderBoxes)
    .get("/tracking/timeline", shippingController.getTimelineStatus)
    .get("/admin/tracking", shippingController.getPendingShipments);

// เพิ่มกล่องจัดส่ง (แอดมิน)
router.post(
    "/shipping/addBox",
    validateAddBox,
    shippingController.upload.single("image_slip"),
    shippingController.addBox
);

module.exports = router;
