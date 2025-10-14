const prisma = require("../../prisma/prisma");

// เพิ่มสินค้าในตะกร้า
exports.addToCart = async (req, res) => {
    try {
        const { productId, productPriceId, mode, start, end } = req.body;
        const customerId = req.user?.id;

        if (!customerId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
        if (!start || !end) return res.status(400).json({ message: "ต้องมีวันที่เริ่มและวันคืน" });

        const startDate = new Date(start);
        const endDate = new Date(end);

        // ✅ หา cart ของลูกค้า
        let cart = await prisma.cart.findFirst({ where: { customerId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { customerId } });
        }

        // ✅ ตรวจว่าช่วงเวลานี้ทับกับสินค้าชิ้นเดิมไหม
        const overlap = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.cart_id,
                productId: Number(productId),
                OR: [
                    {
                        AND: [
                            { startDate: { lte: endDate } },
                            { endDate: { gte: startDate } },
                        ],
                    },
                ],
            },
        });

        if (overlap) {
            return res.status(400).json({
                message: `สินค้านี้ถูกจองในช่วง ${overlap.startDate.toISOString().split("T")[0]} ถึง ${overlap.endDate.toISOString().split("T")[0]} แล้ว`,
            });
        }

        // ✅ ถ้าไม่ชนกัน ให้เพิ่มได้
        await prisma.cartItem.create({
            data: {
                cartId: cart.cart_id,
                productId: Number(productId),
                productPriceId: Number(productPriceId),
                mode,
                startDate,
                endDate,
            },
        });

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
                    select: {
                        cartItem_id: true,
                        product: { include: { images: true } },
                        price: true,
                        startDate: true,
                        endDate: true,    
                        mode: true,
                    },
                },
            },
        });

        const itemsWithDisplay = cart?.items.map(item => {
            let priceLabel = "N/A";

            if (item.mode === "test" && item.price?.price_test !== undefined) {
                priceLabel = `${item.price.price_test}฿ (เทส)`;
            } else if (item.mode === "pri" && item.price?.price_pri !== undefined) {
                priceLabel = `${item.price.price_pri}฿ (ไพร)`;
            }

            return { ...item, displayPrice: priceLabel };
        }) || [];

        res.render("cart", { cart: { ...cart, items: itemsWithDisplay } });

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
