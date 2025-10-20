const prisma = require('../../prisma/prisma');

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

        res.status(200).json({
            message: "ยืนยันการเช่าสำเร็จ",
            updated,
        });
    } catch (err) {
        console.error("❌ confirmRental error:", err);
        res.status(500).json({ error: "ไม่สามารถยืนยันการเช่าได้" });
    }
};
