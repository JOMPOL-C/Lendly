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
      const { categoryId, sizeId, search } = req.query;
      const user = req.user; // จาก middleware auth ถ้ามี
  
      // 📂 ดึงหมวดหมู่ทั้งหมด
      const categories = await prisma.category.findMany({
        orderBy: { category_name: "asc" },
      });
  
      // 📏 ดึงสัดส่วนทั้งหมด
      const proportions = await prisma.proportion_product.findMany({
        orderBy: { proportion_product_id: "asc" },
      });
  
      // 🧍 ถ้ามีผู้ใช้ล็อกอิน ให้ใช้สัดส่วนของเขาเป็นค่าเริ่มต้น
      let defaultSize = "";
      if (user) {
        const customer = await prisma.customer.findUnique({
          where: { customer_id: user.customer_id },
          include: { proportion: true },
        });
        defaultSize = customer?.proportion?.proportion_product_id || "";
      }
  
      // 🔍 เงื่อนไขการกรองสินค้า
      const whereClause = {
        ...(categoryId ? { categoryId } : {}),
        ...(sizeId
          ? { ppId: parseInt(sizeId) }
          : defaultSize
          ? { ppId: parseInt(defaultSize) }
          : {}),
        ...(search ? { product_name: { contains: search } } : {}), // ✅ ลบ mode ออก
      };
  
      // 📦 ดึงสินค้าพร้อมข้อมูลที่เกี่ยวข้อง
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
  
      // 🖼️ ส่งข้อมูลไปหน้า category
      res.render("category", {
        categories,
        proportions,
        products,
        selectedCategory: categoryId || "",
        selectedSize: sizeId || defaultSize || "",
        searchTerm: search || "",
      });
    } catch (err) {
      console.error("❌ Error renderProductsPage:", err);
      res.status(500).send("โหลดสินค้าล้มเหลว");
    }
  };
  


