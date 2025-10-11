const prisma = require('../../prisma/prisma');

// ✅ ดึงข้อมูลการเช่าทั้งหมด
exports.getRentals = async (req, res) => {
    try {
        const rentals = await prisma.calender.findMany({
            include: {
                customer: true,
                product: true,
            },
            orderBy: { rental_id: 'desc' },
        });
        res.status(200).json(rentals);
    } catch (err) {
        console.error("❌ getRentals error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ สร้างการเช่าใหม่
exports.createRental = async (req, res) => {
    try {
      const { customerId, productId, rental_date, rental_end_date } = req.body;
  
      if (!customerId || !productId || !rental_date || !rental_end_date) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
      }
  
      const startDate = new Date(rental_date);
      const endDate = new Date(rental_end_date);
  
      if (endDate < startDate) {
        return res.status(400).json({ error: "วันคืนต้องหลังวันเช่า" });
      }
  
      // เช็กวันชน
      const overlap = await prisma.calender.findFirst({
        where: {
          productId: Number(productId),
          rental_status: { notIn: ['CANCELLED', 'RETURNED'] },
          rental_end_date: { gte: startDate },
          rental_date: { lte: endDate },
        },
      });
  
      if (overlap) {
        return res.status(400).json({
          error: `สินค้าชิ้นนี้ถูกจองในช่วง ${overlap.rental_date.toISOString().split("T")[0]} ถึง ${overlap.rental_end_date.toISOString().split("T")[0]}`
        });
      }
  
      // ✅ สร้างการเช่าใหม่ (รอยืนยันจากร้าน)
      const rental = await prisma.calender.create({
        data: {
          customerId: Number(customerId),
          productId: Number(productId),
          rental_date: startDate,
          rental_end_date: endDate,
          rental_status: 'WAITING_CONFIRM'
        },
      });
  
      res.status(201).json({ message: "สร้างการจองสำเร็จ (รอยืนยันจากร้าน)", rental });
    } catch (err) {
      console.error("❌ createRental error:", err);
      res.status(500).json({ error: "Server error" });
    }
  };
  

// ✅ อัปเดตสถานะหรือวันคืน
exports.updateRental = async (req, res) => {
    try {
        const { id } = req.params;
        const { rental_end_date, rental_status } = req.body;

        if (!rental_end_date && !rental_status) {
            return res.status(400).json({ error: "กรุณาให้ข้อมูลที่ต้องการอัปเดต" });
        }

        const updateData = {};
        if (rental_end_date) updateData.rental_end_date = new Date(rental_end_date);
        if (rental_status) updateData.rental_status = rental_status;

        const rental = await prisma.calender.update({
            where: { rental_id: Number(id) },
            data: updateData,
        });

        res.status(200).json({ message: "อัปเดตการเช่าสำเร็จ", rental });
    } catch (err) {
        console.error("❌ updateRental error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ ลบการเช่า
exports.deleteRental = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.calender.delete({
            where: { rental_id: Number(id) },
        });

        res.status(200).json({ message: "ลบการเช่าสำเร็จ" });
    } catch (err) {
        console.error("❌ deleteRental error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
