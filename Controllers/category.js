const prisma = require('../prisma/prisma');

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
        return res.status(500).json({ message: 'สร้างหมวดหมู่ล้มเหลว' });
    };
};

//แสดงหมวดหมู่ 
/*
exports.listCategory = async (req, res) => {
    const listCategory = await prisma.category.findMany();

    res.send(listCategory);
};
*/