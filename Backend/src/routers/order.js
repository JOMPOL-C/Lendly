const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");


router.post("/orders", authMiddleware, orderController.createOrder);
router.put("/orders/:id/confirm", orderController.confirmOrder);

module.exports = router;
