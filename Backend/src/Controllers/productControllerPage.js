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

// ✅ โชว์สินค้าในหน้า category พร้อมกรองด้วยหมวดหมู่, สัดส่วน, ชื่อสินค้า
exports.renderProductsPage = async (req, res) => {
    try {
      const { categoryId, search, chest, waist, hips } = req.query;
      const user = req.user;
  
      const categories = await prisma.category.findMany({
        orderBy: { category_name: "asc" },
      });
  
      // สร้างเงื่อนไข where หลัก
      const whereClause = {
        ...(categoryId ? { categoryId } : {}),
        ...(search ? { product_name: { contains: search } } : {}),
        ...(chest || waist || hips
          ? {
              size: {
                // 🔍 เทียบค่ากับสัดส่วนสินค้า (±5 cm)
                chest: chest ? { gte: parseFloat(chest) - 5, lte: parseFloat(chest) + 5 } : undefined,
                waist: waist ? { gte: parseFloat(waist) - 5, lte: parseFloat(waist) + 5 } : undefined,
                hips: hips ? { gte: parseFloat(hips) - 5, lte: parseFloat(hips) + 5 } : undefined,
              },
            }
          : {}),
      };
  
      const products = await prisma.product.findMany({
        where: whereClause,
        include: {
          images: true,
          prices: true,
          category: true,
          size: true,
        },
        orderBy: { product_id: "desc" },
      });
  
      res.render("category", {
        categories,
        products,
        selectedCategory: categoryId || "",
        selectedSize: "",  // ✅ เพิ่มบรรทัดนี้ ป้องกัน EJS error
        searchTerm: search || "",
        chest,
        waist,
        hips,
      });
    } catch (err) {
      console.error("❌ Error renderProductsPage:", err);
      res.status(500).send("โหลดสินค้าล้มเหลว");
    }
  };
  
  


