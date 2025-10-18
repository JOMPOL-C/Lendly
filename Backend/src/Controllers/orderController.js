const prisma = require("../../prisma/prisma");
const rentalsController = require("./rentalsController");

exports.confirmOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    // ✅ อัปเดตสถานะออเดอร์
    const order = await prisma.Orders.update({
      where: { order_id: orderId },
      data: { order_status: "CONFIRMED" },
      include: { OrderItem: true },
    });

    // ✅ สร้าง Rentals ตามสินค้าในออเดอร์นี้
    await rentalsController.createFromOrder(order);


    res.json({ message: "ยืนยันคำสั่งเช่าสำเร็จ", order });
  } catch (err) {
    console.error("❌ confirmOrder error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { selectedItems } = req.body;

    if (!selectedItems?.length) {
      return res.status(400).json({ message: "กรุณาเลือกสินค้าอย่างน้อย 1 ชิ้น" });
    }

    const cartItems = await prisma.CartItem.findMany({
      where: {
        cartItem_id: { in: selectedItems.map(Number) },
        cart: { customerId }, // ✅ ใช้ relation “cart” แทนการใส่ customerId ตรง ๆ
      },
      include: { product: true, price: true },
    });

    if (!cartItems.length) return res.status(404).json({ message: "ไม่พบสินค้าที่เลือก" });

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price?.price || 0), 0);

    const order = await prisma.Orders.create({
      data: {
        customerId,
        total_price: totalPrice,
        OrderItem: {
          create: cartItems.map(item => ({
            product: { connect: { product_id: item.productId } },
            price: { connect: { productPrice_id: item.productPriceId } }
          })),
        },
      },
      include: {
        OrderItem: {
          include: { product: true, price: true }, // ✅ เพิ่มตรงนี้
        },
      },
    });

    const rentalsController = require("./rentalsController");
    await rentalsController.createFromOrder(order);

    await prisma.CartItem.deleteMany({
      where: { cartItem_id: { in: selectedItems.map(Number) } },
    });

    res.json({ message: "สร้างคำสั่งเช่าสำเร็จ", order });
  } catch (err) {
    console.error("❌ createOrder error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createFromOrder = async (order) => {
  try {
    for (const item of order.OrderItem) {
      const cartItem = await prisma.CartItem.findFirst({
        where: {
          productId: item.productId,
          cart: { customerId: order.customerId },
        },
      });

      await prisma.Rentals.create({
        data: {
          customerId: order.customerId,
          productId: item.productId,
          rental_date: cartItem?.startDate || new Date(),
          rental_end_date: cartItem?.endDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          rental_status: "WAITING_CONFIRM",
          mode: cartItem?.mode === "pri" ? "PRI" : "TEST",
        },
      });
    }
  } catch (err) {
    console.error("❌ createFromOrder error:", err);
  }
};