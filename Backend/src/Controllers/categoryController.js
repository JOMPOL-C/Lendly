const crypto = require("crypto");
const prisma = require("../../prisma/prisma");

async function generateCategoryId() {
    let categoryId = "";
    let exists = true;

    while (exists) {
        categoryId = `CAT${crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase()}`;
        exists = await prisma.category.findUnique({
            where: { category_id: categoryId },
        });
    }

    return categoryId;
}

//สร้างหมวดหมู่
exports.createCategory = async (req, res) => {
    try {
        const category_name = req.body.category_name?.trim();

        if (!category_name) {
            return res.status(400).json({ message: "กรุณาระบุชื่อหมวดหมู่" });
        }

        const existingCategory = await prisma.category.findFirst({
            where: { category_name },
        });

        if (existingCategory) {
            return res.status(409).json({
                message: "มีหมวดหมู่นี้อยู่แล้ว",
                category: existingCategory,
            });
        }

        const category_id = await generateCategoryId();
        const newCategory = await prisma.category.create({
            data: {
                category_id,
                category_name,
            },
        });

        res.status(201).json({
            message: "สร้างหมวดหมู่สำเร็จ",
            category: newCategory,
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: 'สร้างหมวดหมู่ล้มเหลว' });
    };
};

//แสดงหมวดหมู่ 
exports.getCategories = async (req, res) => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { category_name: 'asc' },
      });
      res.render('category', { categories });
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).send('Server Error');
    }
  };

//แสดงหมวดหมู่ กับ สินค้าตามหมวดหมู่
exports.getCategoryWithProducts = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const categories = await prisma.category.findMany({
            orderBy: { category_name: 'asc' }
        });
        const products = await prisma.product.findMany({
            where: { categoryId },
            include: { images: true, prices: true },
            orderBy: { product_id: 'desc' }
        });
        res.render('category', { categories, products });
    } catch (err) {
        console.error('Error fetching category and products:', err);
        res.status(500).send('Server Error');
    }
};
