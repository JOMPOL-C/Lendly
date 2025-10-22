const { PrismaClient, Calender_rental_status } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ ดึงข้อมูลการเช่าทั้งหมด (Admin / ร้านค้า)
exports.getRentals = async (req, res) => {
  try {
    const rentals = await prisma.Rentals.findMany({
      include: {
        customer: true,
        product: true,
      },
      orderBy: { rental_id: "desc" },
    });
    res.status(200).json(rentals);
  } catch (err) {
    console.error("❌ getRentals error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ ดึงข้อมูลการเช่าของตัวเอง (Customer)
exports.getMyRentals = async (req, res) => {
  try {
    const rentals = await prisma.Rentals.findMany({
      where: { customerId: req.user.id },
      include: { product: true },
      orderBy: { rental_id: "desc" },
    });
    res.status(200).json(rentals);
  } catch (err) {
    console.error("❌ getMyRentals error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ ร้านค้า/แอดมินกดยืนยันการจอง
exports.confirmRental = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await prisma.Rentals.update({
      where: { rental_id: Number(id) },
      data: { rental_status: Calender_rental_status.WAITING_DELIVER }, // ✅ เหลืออันนี้อันเดียว
    });
    res.status(200).json({ message: "ยืนยันการเช่าสำเร็จ (รอจัดส่ง)", rental });
  } catch (err) {
    console.error("❌ confirmRental error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ ร้านค้ากดยืนยันการคืนสินค้า
exports.returnRental = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await prisma.Rentals.update({
      where: { rental_id: Number(id) },
      data: { rental_status: "RETURNED" },
    });
    res.status(200).json({ message: "บันทึกการคืนสินค้าเรียบร้อย", rental });
  } catch (err) {
    console.error("❌ returnRental error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ แอดมินอัปเดตวันคืน / สถานะอื่น ๆ (สำหรับระบบหลังบ้าน)
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

    const rental = await prisma.Rentals.update({
      where: { rental_id: Number(id) },
      data: updateData,
    });

    res.status(200).json({ message: "อัปเดตการเช่าสำเร็จ", rental });
  } catch (err) {
    console.error("❌ updateRental error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ แอดมินลบข้อมูล (soft delete จะดีกว่า แต่ใช้จริงก่อน)
exports.deleteRental = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.Rentals.delete({ where: { rental_id: Number(id) } });
    res.status(200).json({ message: "ลบการเช่าสำเร็จ" });
  } catch (err) {
    console.error("❌ deleteRental error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createFromOrder = async (order) => {
  try {
    console.log("🧾 createFromOrder triggered for order:", order.order_id);

    for (const item of order.OrderItem) {
      console.log("📦 สร้างการเช่าของสินค้า:", item.productId);

      // ✅ ดึงข้อมูลจาก CartItem เดิมก่อน (ใช้ productId + customerId)
      const cartItem = await prisma.CartItem.findFirst({
        where: {
          productId: item.productId,
          cart: { customerId: order.customerId },
        },
      });

      // ถ้าไม่เจอข้อมูลในตะกร้า ให้ข้าม
      if (!cartItem) {
        console.log("⚠️ ไม่พบ cartItem สำหรับสินค้า", item.productId);
        continue;
      }

      // ✅ ดึงราคาจาก productPrice ที่เชื่อมไว้
      const priceRecord = await prisma.ProductPrice.findUnique({
        where: { productPrice_id: item.price.productPrice_id },
      });

      await prisma.Rentals.create({
        data: {
          customerId: order.customerId,
          productId: item.productId,
          rental_date: cartItem.startDate, // 2025-10-11
          rental_end_date: cartItem.endDate, // 2025-10-12 (เทส) / 2025-10-13 (ไพร)
          mode: cartItem.mode === "pri" ? "PRI" : "TEST",
          rental_status: "WAITING_CONFIRM",
          total_price: Number(priceRecord?.price_pri || priceRecord?.price_test || 0),
        },
      });



      console.log(`✅ Rental created for product ${item.productId}`);
    }
  } catch (err) {
    console.error("❌ createFromOrder error:", err);
  }
};

exports.confirmBatch = async (req, res) => {
  try {
    console.log("🧩 [DEBUG] req.body =", req.body);

    const { rentalIds } = req.body;
    if (!Array.isArray(rentalIds) || rentalIds.length === 0) {
      return res.status(400).json({ message: "ไม่พบรายการที่ต้องการยืนยัน", body: req.body });
    }

    await prisma.Rentals.updateMany({
      where: { rental_id: { in: rentalIds.map(Number) } },
      data: { rental_status: Calender_rental_status.WAITING_DELIVER },
    });

    res.json({ message: `ยืนยันการจอง ${rentalIds.length} รายการสำเร็จ (รอจัดส่ง)` });
  } catch (err) {
    console.error("❌ confirmBatch error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ", error: err.message });
  }
};



function formatLocalDate(date) {
  const d = new Date(date);
  // หัก timezone ออกให้เป็นวันที่ตามเวลาท้องถิ่น
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
}

exports.getBookingsByProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const rentals = await prisma.Rentals.findMany({
      where: {
        productId,
        rental_status: { notIn: ["CANCELLED", "RETURNED"] },
      },
      select: {
        rental_date: true,
        rental_end_date: true,
        mode: true,
      },
    });

    const bookings = rentals.map(r => ({
      start: formatLocalDate(r.rental_date),
      end: formatLocalDate(r.rental_end_date),
      mode: r.mode,
    }));

    return res.json(bookings);
  } catch (err) {
    console.error("❌ getBookingsByProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.renderMy_rentals = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
    const userId = Number(req.user.id);

    // ✅ ดึงคำสั่งซื้อทั้งหมดของลูกค้าคนนี้
    const orders = await prisma.Orders.findMany({
      where: { customerId: userId },
      include: {
        Rentals: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
      orderBy: { order_id: "desc" },
    });

    // ✅ เตรียม array แยกตามสถานะ
    const waiting_confirm = [];
    const waiting_deliver = [];
    const renting = [];
    const returned = [];
    const cancelled = [];

    // ✅ วนทุกคำสั่งซื้อ
    orders.forEach(order => {
      const byStatus = {
        WAITING_CONFIRM: order.Rentals.filter(r => r.rental_status === "WAITING_CONFIRM"),
        WAITING_DELIVER: order.Rentals.filter(r => r.rental_status === "WAITING_DELIVER"),
        RENTED: order.Rentals.filter(r => r.rental_status === "RENTED"),
        RETURNED: order.Rentals.filter(r => r.rental_status === "RETURNED"),
        CANCELLED: order.Rentals.filter(r => r.rental_status === "CANCELLED"),
      };

      if (byStatus.WAITING_CONFIRM.length > 0)
        waiting_confirm.push({ ...order, Rentals: byStatus.WAITING_CONFIRM });
      if (byStatus.WAITING_DELIVER.length > 0)
        waiting_deliver.push({ ...order, Rentals: byStatus.WAITING_DELIVER });
      if (byStatus.RENTED.length > 0)
        renting.push({ ...order, Rentals: byStatus.RENTED });
      if (byStatus.RETURNED.length > 0)
        returned.push({ ...order, Rentals: byStatus.RETURNED });
      if (byStatus.CANCELLED.length > 0)
        cancelled.push({ ...order, Rentals: byStatus.CANCELLED });
    });

    res.render("my_rentals", {
      waiting_confirm,
      waiting_deliver,
      renting,
      returned,
      cancelled,
    });
  } catch (err) {
    console.error("❌ renderMy_rentals error:", err);
    res.status(500).send("Server Error");
  }
};



// ✅ ลูกค้าสร้างการเช่าใหม่ (เมื่อกดจอง)
exports.createRental = async (req, res) => {
  try {
    const { productId, rental_date, rental_end_date, total_price, mode } = req.body;
    const customerId = req.user?.id;

    if (!customerId || !productId || !rental_date || !rental_end_date) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
    }

    const startDate = new Date(rental_date);
    const endDate = new Date(rental_end_date);

    if (endDate < startDate) {
      return res.status(400).json({ error: "วันคืนต้องหลังวันเช่า" });
    }

    // 🔒 ตรวจสอบว่าสินค้าชนวันจองไหม
    const overlap = await prisma.Rentals.findFirst({
      where: {
        productId: Number(productId),
        rental_status: { notIn: ["CANCELLED", "RETURNED"] },
        rental_end_date: { gte: startDate },
        rental_date: { lte: endDate },
      },
    });

    if (overlap) {
      return res.status(400).json({
        error: `สินค้าชิ้นนี้ถูกจองในช่วง ${overlap.rental_date.toISOString().split("T")[0]} ถึง ${overlap.rental_end_date.toISOString().split("T")[0]}`
      });
    }

    // ✅ สร้างการเช่าใหม่ (สถานะเริ่มต้น: รอยืนยันจากร้าน)
    const rental = await prisma.Rentals.create({
      data: {
        customerId,
        productId: Number(productId),
        rental_date: startDate,
        rental_end_date: endDate,
        mode: mode || "TEST",
        total_price: Number(total_price) || 0,
        rental_status: "WAITING_CONFIRM",
      },
    });

    res.status(201).json({ message: "สร้างการจองสำเร็จ (รอยืนยันจากร้าน)", rental });
  } catch (err) {
    console.error("❌ createRental error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ ยกเลิกการเช่า
exports.cancelRental = async (req, res) => {
  try {
    const { id } = req.params;

    const rental = await prisma.Rentals.update({
      where: { rental_id: Number(id) },
      data: { rental_status: "CANCELLED" },
    });

    res.status(200).json({ message: "ยกเลิกการเช่าสำเร็จ", rental });
  } catch (err) {
    console.error("❌ cancelRental error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
