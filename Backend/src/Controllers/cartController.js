const prisma = require("../../prisma/prisma");

// เพิ่มสินค้าในตะกร้า
exports.addToCart = async (req, res) => {
    try {
        const { productId, productPriceId, quantity } = req.body;
        const customerId = req.user?.id;

        if (!customerId) {
            return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
        }

        // หรือตะกร้าที่มีอยู่แล้ว
        let cart = await prisma.cart.findFirst({ where: { customerId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { customerId } });
        }

        // ตรวจว่าสินค้านี้มีอยู่ในตะกร้าแล้วหรือยัง
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.cart_id,
                productId: parseInt(productId)   // ✅ แปลงให้เป็น int
            },
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { cartItem_id: existingItem.cartItem_id },
                data: { quantity: existingItem.quantity + (quantity || 1) },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.cart_id,
                    productId: parseInt(productId),   // ✅ ตรงนี้ด้วย
                    productPriceId: productPriceId ? parseInt(productPriceId) : null,
                    quantity: quantity || 1,
                },
            });
        }

        res.json({ message: "เพิ่มลงตะกร้าเรียบร้อย" });
    } catch (err) {
        console.error("❌ Error addToCart:", err);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มลงตะกร้า" });
    }
};

// ดึงสินค้าทั้งหมดในตะกร้า
exports.getCart = async (req, res) => {
    try {
        const customerId = req.user?.id;
        if (!customerId) {
            return res.redirect("/login");
        }

        const cart = await prisma.cart.findFirst({
            where: { customerId },
            include: {
                items: {
                    include: {
                        product: { include: { images: true } },
                        price: true,
                    },
                },
            },
        });

        res.render("cart", { cart });
    } catch (err) {
        console.error("❌ Error getCart:", err);
        res.status(500).send("โหลดตะกร้าล้มเหลว");
    }
};

// ลบสินค้าออกจากตะกร้า
exports.removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.cartItem.delete({ where: { cartItem_id: parseInt(id) } });
        res.json({ message: "ลบสินค้าออกจากตะกร้าแล้ว" });
    } catch (err) {
        console.error("❌ Error removeFromCart:", err);
        res.status(500).json({ message: "ลบสินค้าไม่สำเร็จ" });
    }
};
