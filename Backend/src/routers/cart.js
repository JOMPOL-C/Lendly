const express = require("express");
const router = express.Router();
const cartController = require("../Controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/cart/add", authMiddleware, cartController.addToCart);
router.get("/cart", authMiddleware, cartController.getCart);
router.delete("/cart/:id", authMiddleware, cartController.removeFromCart);

module.exports = router;
