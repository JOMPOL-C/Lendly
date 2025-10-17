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