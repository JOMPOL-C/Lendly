const prisma = require('../../prisma/prisma');
const { notifyUserEmail, notifyAdminEmail } = require("../utils/emailNotify");

// ✅ ดึงข้อมูลผู้ใช้ทั้งหมด
exports.getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { user_id: 'desc' },
        });
        res.status(200).json(users);
    } catch (err) {
        console.error("❌ getUsers error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ ยอมรับการเช่าสินค้า (เปลี่ยนสถานะเป็นรอส่ง)
exports.confirmRental = async (req, res) => {
    try {
      const { rentalId } = req.params;
  
      const updated = await prisma.rentals.update({
        where: { rental_id: parseInt(rentalId) },
        data: { rental_status: "WAITING_DELIVER" },
        include: { customer: true, product: true },
      });
  
      console.log(`✅ ยืนยันการเช่าสำเร็จ rental_id: ${rentalId}`);
  
      // ✉️ ส่งอีเมลแจ้งลูกค้า
      if (updated.customer?.customer_email) {
        await notifyUserEmail(
          updated.customer.customer_email,
          `
          ✅ ร้านได้ยืนยันคำสั่งเช่าของคุณแล้ว!  
          สินค้า: ${updated.product.product_name}  
          ขณะนี้ร้านกำลังเตรียมจัดส่งสินค้าให้คุณ 💜
          `,
          "📦 Lendly | ร้านได้ยืนยันคำสั่งเช่าของคุณแล้ว"
        );
      }
  
      // ✉️ แจ้งแอดมิน (optional)
      await notifyAdminEmail(`
        📦 แอดมินได้ยืนยันคำสั่งเช่า  
        สินค้า: ${updated.product.product_name}  
        ลูกค้า: ${updated.customer.name} ${updated.customer.last_name}
      `);
  
      res.status(200).json({
        message: "ยืนยันการเช่าสำเร็จ (รอจัดส่ง)",
        updated,
      });
    } catch (err) {
      console.error("❌ confirmRental error:", err);
      res.status(500).json({ error: "ไม่สามารถยืนยันการเช่าได้" });
    }
  };