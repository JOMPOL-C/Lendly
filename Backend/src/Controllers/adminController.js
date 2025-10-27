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

exports.renderAdminDashboard = async (req, res) => {
    try {
        const rentals = await prisma.rentals.findMany({
            include: {
                order: {
                    include: { payments: true },
                },
            },
        });

        const totalRentals = rentals.length;
        const waitingRentals = rentals.filter(r => r.rental_status === 'WAITING_CONFIRM').length;
        const activeRentals = rentals.filter(r => r.rental_status === 'RENTED').length;
        const cancelledRentals = rentals.filter(r => r.rental_status === 'CANCELLED').length;

        const totalRevenue = rentals.reduce((sum, r) => {
            const payment = r.order?.payments?.[0];
            return sum + (payment ? Number(payment.payment_amount) : 0);
        }, 0);

        const monthlyRevenue = Array(12).fill(0);
        const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

        rentals.forEach(r => {
            const m = new Date(r.rental_date || new Date()).getMonth();
            const payment = r.order?.payments?.[0];
            if (payment) monthlyRevenue[m] += Number(payment.payment_amount);
        });

        const statusCounts = [
            waitingRentals,
            activeRentals,
            rentals.filter(r => r.rental_status === 'RETURNED').length,
            cancelledRentals,
        ];

        res.render('adminDashboard', {
            totalRentals,
            waitingRentals,
            activeRentals,
            cancelledRentals,
            totalRevenue,
            monthLabels,
            monthlyRevenue,
            statusCounts,
        });
    } catch (err) {
        console.error("❌ renderAdminDashboard error:", err);
        res.status(500).send("Server Error");
    }
};

exports.getTopStats = async (req, res) => {
    try {
      // ✅ Top 5 สินค้าถูกเช่ามากที่สุด
      const topProducts = await prisma.$queryRaw`
        SELECT p.product_name, COUNT(r.rental_id) AS count
        FROM Rentals r
        JOIN Product p ON r.product_id = p.product_id
        GROUP BY p.product_name
        ORDER BY count DESC
        LIMIT 5;
      `;
  
      // ✅ Top 5 หมวดหมู่ยอดนิยม
      const topCategories = await prisma.$queryRaw`
        SELECT c.category_name, COUNT(r.rental_id) AS count
        FROM Rentals r
        JOIN Product p ON r.product_id = p.product_id
        JOIN Category c ON p.categoryId = c.category_id
        GROUP BY c.category_name
        ORDER BY count DESC
        LIMIT 5;
      `;
  
      res.json({ topProducts, topCategories });
    } catch (err) {
      console.error("❌ getTopStats error:", err);
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลยอดนิยมได้" });
    }
  };
  

module.exports = exports;