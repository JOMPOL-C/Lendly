const prisma = require("../../prisma/prisma");

// ✅ เพิ่มสินค้าลง Favorite
exports.addFavorite = async (req, res) => {
    try {
      if (!req.user)
        return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
  
      const customerId = req.user.id;
      const productId = Number(req.body.productId);
  
      console.log("⭐ Favorite Request:", { userId: customerId, productId, body: req.body });
  
      if (!productId || isNaN(productId))
        return res.status(400).json({ message: "❌ productId ไม่ถูกต้อง" });
  
      // ✅ 1. ตรวจว่ามีใน favorites แล้วหรือยัง
      const existing = await prisma.Favorite.findFirst({
        where: { customerId, productId },
      });
  
      // ✅ 2. ถ้ามีอยู่แล้ว → ลบออก
      if (existing) {
        await prisma.Favorite.delete({
          where: { favorite_id: existing.favorite_id },
        });
        return res.json({
          message: "ลบออกจากรายการที่ถูกใจแล้ว",
          liked: false,
        });
      }
  
      // ✅ 3. ถ้ายังไม่มี → เพิ่มใหม่
      await prisma.Favorite.create({
        data: { customerId, productId },
      });
  
      return res.json({
        message: "เพิ่มในรายการที่ถูกใจแล้ว",
        liked: true,
      });
  
    } catch (err) {
      console.error("❌ Error addFavorite:", err);
  
      // ป้องกัน error ซ้ำจาก unique constraint (กรณี user double-click)
      if (err.code === "P2002") {
        return res.json({
          message: "เพิ่มในรายการที่ถูกใจแล้ว (record เดิมมีอยู่แล้ว)",
          liked: true,
        });
      }
  
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  };

// ดึงสินค้าทั้งหมดที่ถูกใจ
exports.getFavorites = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });

        const favorites = await prisma.Favorite.findMany({
            where: { customerId: req.user.id },
            include: {
                product: {
                    include: {
                        images: true,
                        prices: true
                    }
                }
            },
            orderBy: { created_at: "desc" }

        });

        res.json(favorites);
    } catch (err) {
        console.error("❌ Error getFavorites:", err);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });

        const favoriteId = Number(req.params.id);
        if (!favoriteId || isNaN(favoriteId)) {
            return res.status(400).json({ message: "❌ favoriteId ไม่ถูกต้อง" });
        }

        const favorite = await prisma.Favorite.findUnique({ where: { favorite_id: favoriteId } });
        if (!favorite || favorite.customerId !== req.user.id) {
            return res.status(404).json({ message: "❌ ไม่พบรายการที่ถูกใจนี้" });
        }

        await prisma.Favorite.delete({ where: { favorite_id: favoriteId } });
        res.json({ message: "ลบออกจากรายการที่ถูกใจแล้ว" });
    } catch (err) {
        console.error("❌ Error removeFavorite:", err);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
}