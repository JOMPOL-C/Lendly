const prisma = require("../../prisma/prisma");
const { Prisma } = require("@prisma/client");


// 🪄 ฟังก์ชันสร้างรหัสคำสั่งซื้อ
function generateOrderCode() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `POPI${y}${m}${d}${rand}`;
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
        product: {
          include: { category: true }, // เพื่อให้รู้ว่าชุด/วิก
        },
        price: true,
      },
    });

    if (!cartItems.length) {
      return res.status(404).json({ message: "ไม่พบสินค้าที่เลือก" });
    }

    // 🧩 helper ฟังก์ชันคำนวณราคาตามโหมด
    const getRentalPrice = (item) => {
      if (item.mode === "pri") {
        return parseFloat(item.price?.price_pri || 0);
      } else {
        return parseFloat(item.price?.price_test || 0);
      }
    };

    // ✅ แสดง log รายการสินค้า
    console.log("🛒 สินค้าในตะกร้าที่เลือก:");
    cartItems.forEach((i) => {
      const priceValue = getRentalPrice(i);
      console.log(
        `  • ${i.product?.product_name} (${i.mode === "pri" ? "โหมดไพร" : "โหมดเทส"}) | ${priceValue}฿ }`
      );
    });

    // ✅ คำนวณราคารวม
    const totalPrice = cartItems.reduce((sum, item) => {
      const priceValue = getRentalPrice(item);
      if (isNaN(priceValue)) {
        console.warn(`⚠️ ราคาผิดพลาดในสินค้า ${item.product?.product_name}`);
      }
      return sum + (isNaN(priceValue) ? 0 : priceValue);
    }, 0);

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

    // ✅ สร้าง Rentals ตามสินค้าในออเดอร์
    for (const item of cartItems) {
      const startDate = item.startDate || new Date();
      const endDate =
        item.endDate ||
        new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      const rentalPrice = getRentalPrice(item);

      await prisma.Rentals.create({
        data: {
          customerId,
          productId: item.productId,
          orderId: order.order_id,
          rental_date: startDate,
          rental_end_date: endDate,
          rental_status: "WAITING_CONFIRM",
          mode: item.mode === "pri" ? "PRI" : "TEST",
          total_price: new Prisma.Decimal(rentalPrice.toFixed(2)),
        },
      });

      console.log(
        `📦 เพิ่ม Rentals: ${item.product?.product_name} (${item.mode}) | ราคา: ${rentalPrice}฿ }`
      );
    }

    // ✅ ลบสินค้าที่เช่าออกจากตะกร้า
    await prisma.CartItem.deleteMany({
      where: { cartItem_id: { in: selectedItems.map(Number) } },
    });
    console.log("🧹 ลบสินค้าที่เช่าออกจากตะกร้าแล้ว");

    console.log(`✅ สรุปคำสั่งซื้อของลูกค้า ID ${customerId}: ${cartItems.length} รายการ, รวม ${totalPrice}฿`);

    res.json({ message: "สร้างคำสั่งเช่าสำเร็จ", order });
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
