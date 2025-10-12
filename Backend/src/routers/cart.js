const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/prisma");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/cart/add", authMiddleware, async (req, res) => {
  try {
    const { productId, mode, component, start, end } = req.body;

    if (!productId || !mode || !component || !start || !end) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบ กรุณาเลือกให้ครบทุกช่อง" });
    }

    // ถ้ายังไม่ login
    if (!req.user) {
      return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อนเพิ่มตะกร้า" });
    }

    // เพิ่มข้อมูลลงตาราง CartItem
    await prisma.CartItem.create({
      data: {
        customerId: req.user.id,
        productId: parseInt(productId),
        mode,
        component,
        rental_start: new Date(start),
        rental_end: new Date(end),
      },
    });

    res.json({ message: "เพิ่มลงตะกร้าเรียบร้อย" });
  } catch (err) {
    console.error("Error add to cart:", err);
    res.status(500).json({ message: "ไม่สามารถเพิ่มลงตะกร้าได้" });
  }
});

module.exports = router;
