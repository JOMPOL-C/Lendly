const prisma = require('../../prisma/prisma');

// ✅ ดึงข้อมูลสินค้าทั้งหมด พร้อมภาพและราคาสินค้า
exports.getProducts = async (req, res) => {
    try {
        const products = await prisma.Product.findMany({
            include: {
                images: true,
                prices: true
            },
            orderBy: { product_id: "desc" }
        });

        res.render("home", { products });
    } catch (err) {
        console.error("Error getProducts:", err);
        res.status(500).send("โหลดสินค้าล้มเหลว");
    }
};

// GET /products/:id/edit → render หน้าแก้ไขสินค้า
exports.renderEditProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.Product.findUnique({
            where: { product_id: parseInt(id, 10) },
            include: {
                prices: true,
                size: true,
                category: true,
                images: true
              }
        });

        if (!product) return res.status(404).send("ไม่พบสินค้า");

        const categories = await prisma.Category.findMany();

        res.render("edit_pro", { product, categories });
    } catch (err) {
        console.error("Error renderEditProduct:", err);
        res.status(500).send("โหลดฟอร์มแก้ไขสินค้าไม่สำเร็จ");
    }
};

// GET โชว์สินค้าในหน้า category
exports.renderProductsPage = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { category_name: 'asc' }
        });

        const products = await prisma.product.findMany({
            include: { images: true, prices: true, category: true },
            orderBy: { product_id: 'desc' }
        });

        res.render("category", { categories, products }); // ✅ ส่งทั้งคู่
    } catch (err) {
        console.error("Error renderProductsPage:", err);
        res.status(500).send("โหลดสินค้าล้มเหลว");
    }
};

