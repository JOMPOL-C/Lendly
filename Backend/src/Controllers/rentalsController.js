const { PrismaClient, Calender_rental_status } = require("@prisma/client");
const { notifyUserEmail, notifyAdminEmail } = require("../utils/emailNotify");
const prisma = new PrismaClient();

// ============================
// ⏰ ยกเลิกอัตโนมัติเมื่อรอชำระเกิน 30 นาที
// ============================
exports.autoCancelExpiredPayments = async () => {
  const now = new Date();
  const limit = new Date(now.getTime() - 30 * 60 * 1000); // 30 นาทีที่แล้ว

  const expired = await prisma.Rentals.findMany({
    where: {
      rental_status: "WAITING_PAYMENT",
      rental_datetime: { lte: limit },
    },
    include: { customer: true },
  });

  if (expired.length) {
    const ids = expired.map(r => r.rental_id);
    await prisma.Rentals.updateMany({
      where: { rental_id: { in: ids } },
      data: { rental_status: "CANCELLED" },
    });

    console.log(`⏰ ยกเลิกอัตโนมัติ ${ids.length} รายการที่รอชำระเกิน 30 นาที`);
  }
};

// ✅ ดึงข้อมูลการเช่าทั้งหมด (Admin / ร้านค้า)
exports.getRentals = async (req, res) => {
  try {
    const rentals = await prisma.rentals.findMany({
      include: {
        customer: true,
        product: true,
        PaymentSlip: true,
      },
      orderBy: { rental_id: 'desc' },
    });

    res.json(rentals);
  } catch (err) {
    console.error("❌ getRentals error:", err);
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลการเช่าได้" });
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
      data: { rental_status: Calender_rental_status.WAITING_DELIVER },
      include: { customer: true, product: true },
    });

    // 🔔 แจ้งลูกค้า
    if (rental.customer?.customer_email) {
      await notifyUserEmail(
        rental.customer.customer_email,
        `✅ ร้านได้ยืนยันคำสั่งเช่าของคุณแล้ว (${rental.product.product_name}) กำลังเตรียมจัดส่งค่ะ`
      );
    }

    // 🔔 แจ้งแอดมิน
    await notifyAdminEmail(`📦 ยืนยันการจองสินค้า "${rental.product.product_name}" สำเร็จแล้ว`);

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
      include: { customer: true, product: true },
    });

    // 🔔 แจ้งลูกค้า
    if (rental.customer?.customer_email) {
      await notifyUserEmail(
        rental.customer.customer_email,
        `🎉 การคืนสินค้าของคุณ (${rental.product.product_name}) เสร็จสมบูรณ์แล้ว ขอบคุณที่ใช้บริการ Lendly!`
      );
    }

    // 🔔 แจ้งแอดมิน
    await notifyAdminEmail(`📬 มีการคืนสินค้าเรียบร้อย: ${rental.product.product_name}`);

    res.status(200).json({ message: "บันทึกการคืนสินค้าเรียบร้อย", rental });
  } catch (err) {
    console.error("❌ returnRental error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ แอดมินอัปเดตวันคืน / สถานะอื่น ๆ
exports.updateRental = async (req, res) => {
  try {
    const { id } = req.params;
    const { rental_end_date, rental_status } = req.body;

    const updateData = {};
    if (rental_end_date) updateData.rental_end_date = new Date(rental_end_date);
    if (rental_status) updateData.rental_status = rental_status;

    const rental = await prisma.Rentals.update({
      where: { rental_id: Number(id) },
      data: updateData,
      include: { customer: true, product: true },
    });

    // 🔔 แจ้งลูกค้าเมื่อสถานะเปลี่ยน
    if (rental_status && rental.customer?.customer_email) {
      const textMap = {
        WAITING_PAYMENT: "💸 กรุณาชำระเงินภายใน 30 นาทีหลังสั่งซื้อ",
        WAITING_CONFIRM: "🕒 รอยืนยันจากร้าน",
        WAITING_DELIVER: "📦 ร้านกำลังเตรียมจัดส่งสินค้า",
        WAITING_RECEIVE: "🚚 สินค้ากำลังจัดส่ง",
        RENTED: "🪞 ได้รับสินค้าแล้ว",
        RETURNING: "📬 กำลังส่งคืนสินค้า",
        RETURNED: "🎉 การคืนสินค้าสำเร็จแล้ว",
        CANCELLED: "❌ คำสั่งเช่าถูกยกเลิก",
      };

      const msg = textMap[rental_status] || rental_status;
      await notifyUserEmail(
        rental.customer.customer_email,
        `📢 สถานะคำสั่งเช่าของคุณ (${rental.product.product_name}) เปลี่ยนเป็น: ${msg}`
      );

      await notifyAdminEmail(
        `🔔 สถานะของสินค้า "${rental.product.product_name}" ถูกเปลี่ยนเป็น "${rental_status}"`
      );
    }

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

// ✅ สร้างการเช่าจากคำสั่งซื้อใหม่
exports.createFromOrder = async (order) => {
  try {
    console.log("🧾 createFromOrder triggered for order:", order.order_id);

    for (const item of order.OrderItem) {
      const cartItem = await prisma.CartItem.findFirst({
        where: {
          productId: item.productId,
          cart: { customerId: order.customerId },
        },
      });

      if (!cartItem) continue;

      const priceRecord = await prisma.ProductPrice.findUnique({
        where: { productPrice_id: item.price.productPrice_id },
      });

      const rental = await prisma.Rentals.create({
        data: {
          customerId: order.customerId,
          productId: item.productId,
          rental_date: cartItem.startDate,
          rental_end_date: cartItem.endDate,
          mode: cartItem.mode === "pri" ? "PRI" : "TEST",
          rental_status: "WAITING_PAYMENT",
          total_price: Number(priceRecord?.price_pri || priceRecord?.price_test || 0),
        },
        include: { customer: true, product: true },
      });

      // 🔔 แจ้งลูกค้า
      if (rental.customer?.customer_email) {
        await notifyUserEmail(
          rental.customer.customer_email,
          `💸 คำสั่งเช่า "${rental.product.product_name}" ถูกสร้างแล้ว กรุณาชำระเงินภายใน 30 นาที`
        );
      }
    }

    await notifyAdminEmail(
      `🛍️ ลูกค้า #${order.customerId} สั่งเช่าสินค้าใหม่จำนวน ${order.OrderItem.length} รายการ  
      โปรดเข้าไปยืนยันสินค้าในหน้า Admin`
    );
  } catch (err) {
    console.error("❌ createFromOrder error:", err);
  }
};

exports.confirmBatch = async (req, res) => {
  try {
    const { rentalIds } = req.body;
    if (!Array.isArray(rentalIds) || rentalIds.length === 0) {
      return res.status(400).json({ message: "ไม่พบรายการที่ต้องการยืนยัน" });
    }

    // ✅ เปลี่ยนสถานะทั้งหมดเป็น WAITING_DELIVER
    await prisma.Rentals.updateMany({
      where: { rental_id: { in: rentalIds.map(Number) } },
      data: { rental_status: Calender_rental_status.WAITING_DELIVER },
    });

    // ✅ ดึงข้อมูลที่เพิ่งอัปเดตมา (พร้อม customer)
    const updatedRentals = await prisma.Rentals.findMany({
      where: { rental_id: { in: rentalIds.map(Number) } },
      include: { customer: true, product: true },
    });

    // 🔔 แจ้งลูกค้าทุกคน
    for (const r of updatedRentals) {
      if (r.customer?.customer_email) {
        await notifyUserEmail(
          r.customer.customer_email,
          `✅ ร้านได้ยืนยันคำสั่งเช่าของคุณแล้ว (${r.product.product_name}) กำลังเตรียมจัดส่งค่ะ`
        );
      }
    }

    // 🔔 แจ้งแอดมินเองด้วย (สรุปผล)
    await notifyAdminEmail(`📦 แอดมินได้ยืนยันคำสั่งเช่า ${updatedRentals.length} รายการ สำเร็จแล้ว`);

    res.json({ message: `ยืนยันการจอง ${rentalIds.length} รายการสำเร็จ (รอจัดส่ง)` });
  } catch (err) {
    console.error("❌ confirmBatch error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ", error: err.message });
  }
};

// ✅ แอดมินปฏิเสธคำสั่งซื้อ
exports.rejectRentals = async (req, res) => {
  try {
    const { rentalIds, reason, detail } = req.body;

    if (!Array.isArray(rentalIds) || rentalIds.length === 0)
      return res.status(400).json({ message: "ไม่พบรายการที่จะปฏิเสธ" });

    await prisma.Rentals.updateMany({
      where: { rental_id: { in: rentalIds.map(Number) } },
      data: { rental_status: "CANCELLED" },
    });

    const cancelled = await prisma.Rentals.findMany({
      where: { rental_id: { in: rentalIds.map(Number) } },
      include: { customer: true, product: true },
    });

    for (const r of cancelled) {
      if (!r.customer?.customer_email) continue;

      let subject = "📢 คำสั่งเช่าของคุณถูกปฏิเสธ";
      let message = "";

      switch (reason) {
        case "สินค้าไม่พร้อมใช้งาน":
          message = `ขออภัยค่ะ สินค้า "${r.product.product_name}" ยังไม่พร้อมใช้งานในขณะนี้`;
          break;
        case "ข้อมูลหรือที่อยู่ลูกค้าไม่ถูกต้อง":
          message = `ไม่สามารถจัดส่ง "${r.product.product_name}" ได้เนื่องจากข้อมูลหรือที่อยู่ไม่ถูกต้อง กรุณาตรวจสอบโปรไฟล์ของคุณอีกครั้งค่ะ`;
          break;
        case "ลูกค้าไม่มีความน่าเชื่อถือ":
          message = `ระบบตรวจพบปัญหาเกี่ยวกับความน่าเชื่อถือของบัญชี กรุณาติดต่อฝ่ายบริการลูกค้าเพื่อชี้แจงเพิ่มเติม`;
          break;
        case "อื่นๆ":
          message = `ร้านค้าปฏิเสธคำสั่งซื้อ "${r.product.product_name}" ด้วยเหตุผลเพิ่มเติม: ${detail}`;
          break;
        default:
          message = `คำสั่งซื้อ "${r.product.product_name}" ถูกปฏิเสธจากร้านค้า`;
      }

      await notifyUserEmail(
        r.customer.customer_email,
        `${message}<br><br>ขออภัยในความไม่สะดวก ทีมงาน Lendly 💜`,
        subject
      );
    }

    await notifyAdminEmail(`❌ ปฏิเสธคำสั่งซื้อ ${rentalIds.length} รายการ เหตุผล: ${reason}`);

    res.json({ message: `ปฏิเสธคำสั่งซื้อ ${rentalIds.length} รายการสำเร็จ` });
  } catch (err) {
    console.error("❌ rejectRentals error:", err);
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
    const waiting_payment = [];
    const waiting_confirm = [];
    const waiting_deliver = [];
    const waiting_receive = [];
    const renting = [];
    const returning = [];
    const returned = [];
    const cancelled = [];

    // ✅ วนทุกคำสั่งซื้อ แยกสถานะ
    orders.forEach(order => {
      const byStatus = {
        WAITING_PAYMENT: order.Rentals.filter(r => r.rental_status === "WAITING_PAYMENT"),
        WAITING_CONFIRM: order.Rentals.filter(r => r.rental_status === "WAITING_CONFIRM"),
        WAITING_DELIVER: order.Rentals.filter(r => r.rental_status === "WAITING_DELIVER"),
        WAITING_RECEIVE: order.Rentals.filter(r => r.rental_status === "WAITING_RECEIVE"),
        RENTED: order.Rentals.filter(r => r.rental_status === "RENTED"),
        RETURNING: order.Rentals.filter(r => r.rental_status === "RETURNING"),
        RETURNED: order.Rentals.filter(r => r.rental_status === "RETURNED"),
        CANCELLED: order.Rentals.filter(r => r.rental_status === "CANCELLED"),
      };

      if (byStatus.WAITING_PAYMENT.length > 0)
        waiting_payment.push({ ...order, Rentals: byStatus.WAITING_PAYMENT });
      if (byStatus.WAITING_CONFIRM.length > 0)
        waiting_confirm.push({ ...order, Rentals: byStatus.WAITING_CONFIRM });
      if (byStatus.WAITING_DELIVER.length > 0)
        waiting_deliver.push({ ...order, Rentals: byStatus.WAITING_DELIVER });
      if (byStatus.WAITING_RECEIVE.length > 0)
        waiting_receive.push({ ...order, Rentals: byStatus.WAITING_RECEIVE });
      if (byStatus.RENTED.length > 0)
        renting.push({ ...order, Rentals: byStatus.RENTED });
      if (byStatus.RETURNING.length > 0)
        returning.push({ ...order, Rentals: byStatus.RETURNING });
      if (byStatus.RETURNED.length > 0)
        returned.push({ ...order, Rentals: byStatus.RETURNED });
      if (byStatus.CANCELLED.length > 0)
        cancelled.push({ ...order, Rentals: byStatus.CANCELLED });
    });

    // ✅ ส่งข้อมูลไป render
    res.render("my_rentals", {
      pageTitle: "รายการเช่าของฉัน - Lendly",
      currentPath: "/my_rentals",
      waiting_payment,
      waiting_confirm,
      waiting_deliver,
      waiting_receive,
      renting,
      returning,
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

exports.getRentalDetailPage = async (req, res) => {
  try {
    const orderId = parseInt(req.query.order_id);
    if (!orderId) return res.status(400).send("ต้องระบุ order_id");

    console.log("🟪 [DEBUG] โหลดข้อมูล Order ID:", orderId);

    // 🧩 1. ดึงข้อมูล Shipping + Boxes + Items + Product
    const shippings = await prisma.shipping.findMany({
      where: { orderId },
      include: {
        boxes: {
          include: {
            items: {
              include: {
                orderItem: {
                  include: { product: true },
                },
              },
            },
          },
        },
      },
    });

    // 🧩 2. ดึงข้อมูลคำสั่งซื้อหลัก + Rentals
    const order = await prisma.orders.findFirst({
      where: { order_id: orderId },
      include: {
        Rentals: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });

    if (!order) return res.status(404).send("ไม่พบคำสั่งซื้อ");

    // 🧩 3. ผูก Shipping เข้ากับ Order
    order.shippings = shippings;

    // 🧩 4. หา orderItemId ของสินค้าทุก rental
    const allItems = shippings.flatMap(s =>
      s.boxes.flatMap(b =>
        b.items.map(it => ({
          orderItemId: it.orderItemId,
          productId: it.orderItem?.product?.product_id,
        }))
      )
    );

    for (const r of order.Rentals) {
      const found = allItems.find(i => i.productId === r.productId);
      r.orderItemId = found?.orderItemId || null;
    }

    // 🧩 5. Debug
    console.log(`📦 พบ shipping ${shippings.length} รายการ`);
    order.Rentals.forEach(r => {
      const boxes = order.shippings.flatMap(s => s.boxes)
        .filter(b => b.items.some(it => it.orderItem?.product?.product_id === r.product.product_id));
      console.log(`🧩 ${r.product.product_name} → Tracking:`, boxes.map(b => b.tracking_code));
    });

    res.render("Detail_Ren", { order });
  } catch (err) {
    console.error("❌ renderDetail_Ren error:", err);
    res.status(500).send("เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์");
  }
};
