const prisma = require('../../prisma/prisma');

//สร้างหมวดหมู่
exports.createCategory = async (req, res) => {
    try {
        const { category_name, category_id } = req.body
        const newCategory = await prisma.category.create({
            data: {
                category_id: category_id,
                category_name: category_name,
            },
        });

        res.json(newCategory);
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

