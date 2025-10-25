const { PrismaClient, Prisma, Shipping_shipping_status } = require("@prisma/client");
const prisma = new PrismaClient();
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { notifyAdminEmail, notifyUserEmail } = require("../utils/emailNotify");

// 🪄 ฟังก์ชันสร้างรหัสคำสั่งซื้อ
function generateOrderCode() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `POPI${y}${m}${d}${rand}`;
}

// ตั้งค่า Cloudinary สำหรับเก็บสลิป
const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "Lendly_Slips" },
});
const upload = multer({ storage });

// 🧩 helper — ทำให้ multer ส่ง error แบบ JSON ได้
function handleMulterError(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        console.error("❌ Multer error:", err);
      }
      next();
    });
  };
}


// ✅ ยืนยันคำสั่งเช่า (ใช้โดยแอดมิน)
exports.confirmOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    const order = await prisma.Orders.update({
      where: { order_id: orderId },
      include: { OrderItem: true },
      data: {},
    });

    await prisma.Rentals.updateMany({
      where: { orderId },
      data: { rental_status: "WAITING_DELIVER" },
    });

    res.json({ message: "ยืนยันคำสั่งเช่าสำเร็จ", order });
  } catch (err) {
    console.error("❌ confirmOrder error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ อัปโหลดสลิปการชำระเงิน (เฉพาะที่ยัง WAITING_PAYMENT)
exports.uploadSlip = [
  handleMulterError(upload.single("slip")),
  async (req, res) => {
    try {
      console.log("📥 [UPLOAD-SLIP] req.file =", req.file);
      console.log("📩 req.body =", req.body);

      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ message: "ต้องระบุ orderId" });

      const order = await prisma.Orders.findUnique({
        where: { order_id: parseInt(orderId) },
        include: { Rentals: { include: { customer: true, product: true } } },
      });

      if (!order) return res.status(404).json({ message: "ไม่พบคำสั่งซื้อนี้" });

      const imageUrl = req.file?.path;
      const cloudinaryId = req.file?.filename;
      if (!imageUrl)
        return res.status(400).json({ message: "ไม่พบไฟล์สลิป" });

      // ✅ ตรวจเฉพาะ rental ที่ยังรอชำระเงินเท่านั้น
      const targetRentals = order.Rentals.filter(r => r.rental_status === "WAITING_PAYMENT");

      if (targetRentals.length === 0)
        return res.status(400).json({ message: "รายการนี้ชำระเงินไปแล้วหรือหมดเวลาแล้ว" });

      // ✅ ผูกสลิปกับทุก rental ที่ยังรอชำระ
      for (const rental of targetRentals) {
        await prisma.PaymentSlip.create({
          data: {
            rentalId: rental.rental_id,
            image_url: imageUrl,
            cloudinary_id: cloudinaryId,
          },
        });
      }

      // ✅ เปลี่ยนสถานะจาก WAITING_PAYMENT → WAITING_CONFIRM
      await prisma.Rentals.updateMany({
        where: {
          orderId: order.order_id,
          rental_status: "WAITING_PAYMENT",
        },
        data: { rental_status: "WAITING_CONFIRM" },
      });

      console.log(`✅ แนบสลิปเรียบร้อย เปลี่ยนสถานะเป็น WAITING_CONFIRM ของ order ${order.order_id}`);

      // ==========================================
      // ✉️ เพิ่มส่วน "ส่งอีเมลแจ้งเตือน" หลังอัปโหลดสลิป
      // ==========================================
      try {
        // 🔔 แจ้งแอดมิน
        await notifyAdminEmail(`
          🧾 มีการอัปโหลดสลิปใหม่จากลูกค้า #${order.customerId}  
          คำสั่งซื้อหมายเลข: ${order.order_code}  
          โปรดตรวจสอบและยืนยันการชำระเงินในหน้า Admin Panel
        `);

        // 🔔 แจ้งลูกค้า (อีเมลสวยงามจากระบบใหม่)
        for (const r of targetRentals) {
          if (r.customer?.customer_email) {
            await notifyUserEmail(
              r.customer.customer_email,
              `📨 ระบบได้รับสลิปการชำระเงินของคุณเรียบร้อยแล้ว (${r.product.product_name})  
              กรุณารอการตรวจสอบจากร้านค้า ขอบคุณที่ใช้บริการ Lendly 💜`
            );
          }
        }

        console.log("✅ ส่งอีเมลแจ้งเตือนหลังอัปโหลดสลิปเรียบร้อย");
      } catch (mailErr) {
        console.error("⚠️ ส่งอีเมลหลังอัปโหลดสลิปล้มเหลว:", mailErr.message);
      }

      // ✅ ตอบกลับฝั่ง client
      res.json({ message: "อัปโหลดสลิปสำเร็จและอัปเดตสถานะเป็นรอยืนยันจากร้าน" });

    } catch (err) {
      console.error("❌ uploadSlip error:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
  },
];

// ✅ สร้างคำสั่งซื้อใหม่
exports.createOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { selectedItems } = req.body;

    if (!selectedItems?.length) {
      return res.status(400).json({ message: "กรุณาเลือกสินค้าอย่างน้อย 1 ชิ้น" });
    }

    // ✅ ดึงข้อมูลสินค้าจาก Cart
    const cartItems = await prisma.CartItem.findMany({
      where: {
        cartItem_id: { in: selectedItems.map(Number) },
        cart: { customerId },
      },
      include: {
        product: { include: { category: true } },
        price: true,
      },
    });

    if (!cartItems.length) {
      return res.status(404).json({ message: "ไม่พบสินค้าที่เลือก" });
    }

    // 🧩 helper ฟังก์ชันคำนวณราคาตามโหมด
    const getRentalPrice = (item) =>
      item.mode === "pri"
        ? parseFloat(item.price?.price_pri || 0)
        : parseFloat(item.price?.price_test || 0);

    // ✅ แสดง log รายการสินค้า
    console.log("🛒 สินค้าในตะกร้าที่เลือก:");
    cartItems.forEach((i) => {
      console.log(
        `  • ${i.product?.product_name} (${i.mode === "pri" ? "โหมดไพร" : "โหมดเทส"}) | ${getRentalPrice(i)}฿`
      );
    });

    // ✅ คำนวณราคารวม
    const totalPrice = cartItems.reduce((sum, item) => sum + getRentalPrice(item), 0);
    console.log("💰 ราคารวมทั้งหมด:", totalPrice);

    // ✅ สร้างคำสั่งซื้อพร้อมรหัส order_code
    const order = await prisma.Orders.create({
      data: {
        customerId,
        total_price: new Prisma.Decimal(totalPrice.toFixed(2)),
        order_code: generateOrderCode(),
        OrderItem: {
          create: cartItems.map((item) => ({
            product: { connect: { product_id: item.productId } },
            price: { connect: { productPrice_id: item.productPriceId } },
          })),
        },
      },
      include: {
        OrderItem: { include: { product: true, price: true } },
      },
    });

    console.log(`🧾 สร้างออเดอร์สำเร็จ: ${order.order_code} (ID: ${order.order_id})`);

    // 🆕 ✅ สร้าง Shipping record ทันที (สำคัญมาก)
    const shipping = await prisma.Shipping.create({
      data: {
        orderId: order.order_id,
        shipping_status: Shipping_shipping_status.IN_PROGRESS, // หรือ WAITING_DELIVER ถ้า enum ใช้ค่านี้
      },
    });
    console.log(`🚚 สร้าง Shipping สำหรับ order_id: ${order.order_id}, shipping_id: ${shipping.shipping_id}`);

    // ✅ สร้าง Rentals ตามสินค้าในออเดอร์
    for (const item of cartItems) {
      const startDate = item.startDate || new Date();
      const endDate = item.endDate || new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      const rentalPrice = getRentalPrice(item);

      await prisma.Rentals.create({
        data: {
          customerId,
          productId: item.productId,
          orderId: order.order_id,
          rental_date: startDate,
          rental_end_date: endDate,
          rental_status: "WAITING_PAYMENT",
          mode: item.mode === "pri" ? "PRI" : "TEST",
          total_price: new Prisma.Decimal(rentalPrice.toFixed(2)),
        },
      });

      console.log(`📦 เพิ่ม Rentals: ${item.product?.product_name} (${item.mode}) | ราคา: ${rentalPrice}฿`);
    }

    // ✅ ลบสินค้าที่เช่าออกจากตะกร้า
    await prisma.CartItem.deleteMany({
      where: { cartItem_id: { in: selectedItems.map(Number) } },
    });
    console.log("🧹 ลบสินค้าที่เช่าออกจากตะกร้าแล้ว");

    try {
      // 🔔 แจ้งแอดมิน
      await notifyAdminEmail(`
        🛍️ มีคำสั่งเช่าใหม่จากลูกค้า #${customerId}  
        รหัสคำสั่งซื้อ: ${order.order_code}  
        จำนวนสินค้า: ${cartItems.length} รายการ  
        💰 รวมยอด: ${totalPrice.toFixed(2)} บาท  
        โปรดตรวจสอบในหน้า Admin Panel ของ Lendly
      `);
    
      // 🔔 แจ้งลูกค้า
      const customer = await prisma.Customer.findUnique({
        where: { customer_id: customerId },
      });
    
      if (customer?.customer_email) {
        await notifyUserEmail(
          customer.customer_email,
          `📦 ระบบได้รับคำสั่งเช่าของคุณเรียบร้อยแล้ว 🎉  
          หมายเลขคำสั่งซื้อ: ${order.order_code}  
          กรุณาชำระเงินภายใน 30 นาที เพื่อยืนยันคำสั่งซื้อของคุณ`
        );
      }
    
      console.log("✅ ส่งอีเมลแจ้งเตือนเมื่อสร้างคำสั่งซื้อใหม่เรียบร้อย");
    } catch (mailErr) {
      console.error("⚠️ ส่งอีเมลหลังสร้างคำสั่งซื้อล้มเหลว:", mailErr.message);
    }

    console.log(`✅ สรุปคำสั่งซื้อของลูกค้า ID ${customerId}: ${cartItems.length} รายการ, รวม ${totalPrice}฿`);
    res.json({ message: "สร้างคำสั่งเช่าสำเร็จ", order, shipping });
  } catch (err) {
    console.error("❌ createOrder error:", err);
    res.status(500).json({ message: "Server error", details: err.message });
  }
};

// ✅ แสดงคำสั่งซื้อของลูกค้าคนปัจจุบัน
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.Orders.findMany({
      where: { customerId: req.user.id },
      include: {
        OrderItem: {
          include: {
            product: { include: { images: true } },
            price: true,
          },
        },
        Rentals: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
      orderBy: { order_id: "desc" },
    });

    res.render("Detail_Ren", { title: "คำสั่งซื้อของฉัน", orders });
  } catch (err) {
    console.error("❌ getMyOrders error:", err);
    res.status(500).send("Server error");
  }
};

exports.getMyRentals = async (req, res) => {
  try {
    const customerId = req.user.id;

    // ดึงคำสั่งซื้อทั้งหมดของลูกค้า
    const orders = await prisma.Orders.findMany({
      where: { customerId },
      include: {
        Rentals: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // แยกออเดอร์ตามสถานะของ Rentals
    const waiting_confirm = [];
    const waiting_deliver = [];
    const renting = [];
    const returned = [];
    const cancelled = [];

    orders.forEach(order => {
      // กรองสินค้าภายในตามสถานะ
      const byStatus = {
        WAITING_CONFIRM: order.Rentals.filter(r => r.rental_status === "WAITING_CONFIRM"),
        WAITING_DELIVER: order.Rentals.filter(r => r.rental_status === "WAITING_DELIVER"),
        RENTED: order.Rentals.filter(r => r.rental_status === "RENTED"),
        RETURNED: order.Rentals.filter(r => r.rental_status === "RETURNED"),
        CANCELLED: order.Rentals.filter(r => r.rental_status === "CANCELLED"),
      };

      // ถ้ามีสินค้าสถานะไหนอยู่ → push การ์ด order พร้อมสินค้านั้นๆ
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
    console.error("❌ getMyRentals error:", err);
    res.status(500).send("Server error");
  }
};
