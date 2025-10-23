const express = require("express");
const router = express.Router();
const rentalController = require("../Controllers/rentalsController");
const authMiddleware = require("../middlewares/authMiddleware");


// ลูกค้าสร้าง / ดูของตัวเอง
router
    .post("/rentals", authMiddleware, rentalController.createRental)
    .get("/rentals/me", authMiddleware, rentalController.getMyRentals)
    .get("/Detail_Ren", rentalController.getRentalDetailPage);

// ร้านค้า/แอดมิน
router
    .get("/rentals", rentalController.getRentals)
    .delete("/rentals/:id", rentalController.deleteRental)
    .get("/rentals/product/:productId", rentalController.getBookingsByProduct);


router
    // ✅ ต้องอยู่ก่อน route ที่มี :id
    .put("/rentals/confirm-batch", rentalController.confirmBatch)
    .put("/rentals/:id", rentalController.updateRental)
    .put("/rentals/:id/cancel", authMiddleware, rentalController.cancelRental)
    .put("/rentals/:id/confirm", rentalController.confirmRental)
    .put("/rentals/:id/return", rentalController.returnRental);

module.exports = router;
