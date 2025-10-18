const express = require("express");
const router = express.Router();
const rentalController = require("../Controllers/rentalsController");
const authMiddleware = require("../middlewares/authMiddleware");


// ลูกค้าสร้าง / ดูของตัวเอง
router
    .post("/rentals", authMiddleware, rentalController.createRental)
    .get("/rentals/me", authMiddleware, rentalController.getMyRentals)


// ร้านค้า/แอดมิน
router
    .get("/rentals", rentalController.getRentals)
    .delete("/rentals/:id", rentalController.deleteRental)
    .get("/rentals/product/:productId", rentalController.getBookingsByProduct);


router
    .put("/rentals/:id", rentalController.updateRental)
    .put("/rentals/:id/cancel", authMiddleware, rentalController.cancelRental)
    .put("/rentals/:id/confirm", rentalController.confirmRental)
    .put("/rentals/:id/return", rentalController.returnRental)
    .put("/rentals/confirm-batch", rentalController.confirmBatch);

module.exports = router;
