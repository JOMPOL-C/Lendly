const prisma = require('../../prisma/prisma');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// memory storage (ไม่ต้องเขียนไฟล์ลง disk)
const storage = multer.memoryStorage();
exports.upload = multer({ storage }).array("product_images", 10); // อัปได้สูงสุด 10 รูป

// ฟังก์ชันแปลง buffer → data URI
const bufferToDataUri = (file) =>
    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

// POST /api/products → เพิ่มสินค้า
exports.createProduct = async (req, res) => {
    try {
        const {
            product_name,
            story_name,
            shipping_info,
            categoryId,
            chest,
            waist,
            hips,
            price_costume,
            price_wig,
            price_prop,
            price_shoe,
            price_pry_extra,
            price_shoe_extra,
            days_suit_test,
            days_suit_pri
        } = req.body;

        const files = req.files || [];

        console.log("📦 req.body:", req.body);

        // ✅ 1) อัปโหลดรูปทั้งหมดขึ้น Cloudinary (โฟลเดอร์ lendly_products)
        const uploadPromises = files.map(file =>
            cloudinary.uploader.upload(bufferToDataUri(file), {
                folder: "lendly_products",
            })
        );
        const uploadResults = await Promise.all(uploadPromises);

        // ✅ 2) สร้างสัดส่วน
        const proportion = await prisma.Proportion_product.create({
            data: {
                chest: chest ? parseFloat(chest) : null,
                waist: waist ? parseFloat(waist) : null,
                hips: hips ? parseFloat(hips) : null
            }
        });

        // ✅ 3) เตรียมราคาสินค้า
        const priceData = [];

        if (price_costume) {
            priceData.push({
                type: "suit",
                price_test: parseFloat(price_costume),
                price_pri: parseFloat(price_costume),
                days_test: days_suit_test ? parseInt(days_suit_test) : null,
                days_pri: days_suit_pri ? parseInt(days_suit_pri) : null
            });
        }

        if (price_wig) {
            priceData.push({
                type: "wig",
                price_test: parseFloat(price_wig),
                price_pri: parseFloat(price_wig)
            });
            if (price_costume) {
                priceData.push({
                    type: "suit_wig",
                    price_test: parseFloat(price_costume) + parseFloat(price_wig),
                    price_pri: parseFloat(price_costume) + parseFloat(price_wig)
                });
            }
        }

        if (price_prop) {
            priceData.push({
                type: "solo_prop",
                price_test: parseFloat(price_prop),
                price_pri: parseFloat(price_prop)
            });
        }

        if (price_shoe) {
            priceData.push({
                type: "solo_shoe",
                price_test: parseFloat(price_shoe),
                price_pri: parseFloat(price_shoe)
            });
        }

        if (price_pry_extra) {
            priceData.push({
                type: "addon_prop",
                price_test: parseFloat(price_pry_extra),
                price_pri: parseFloat(price_pry_extra)
            });
        }

        if (price_shoe_extra) {
            priceData.push({
                type: "addon_shoe",
                price_test: parseFloat(price_shoe_extra),
                price_pri: parseFloat(price_shoe_extra)
            });
        }

        // ✅ 4) สร้างสินค้า + ผูกกับสัดส่วน + เก็บรูปจาก Cloudinary
        await prisma.Product.create({
            data: {
                product_name,
                story_name,
                shipping_info,
                category: { connect: { category_id: categoryId } },
                // ✅ ใช้ relation แทนการอ้าง FK โดยตรง
                size: {
                    connect: { proportion_product_id: proportion.proportion_product_id }
                },
                prices: { create: priceData },
                images: {
                    create: uploadResults.map(r => ({
                        image_url: r.secure_url,
                        cloudinary_id: r.public_id
                    }))
                }
            }
        });


        res.redirect("/");
    } catch (err) {
        console.error("Error createProduct:", err);
        res.status(500).send("เพิ่มสินค้าไม่สำเร็จ");
    }
};

// PUT /api/products/:id/update → แก้ไขสินค้า
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            product_name,
            story_name,
            shipping_info,
            categoryId,
            chest,
            waist,
            hips,
            price_costume,
            price_wig,
            price_prop,
            price_shoe,
            price_pry_extra,
            price_shoe_extra,
            days_suit_test,
            days_suit_pri
        } = req.body;

        const files = req.files || [];

        const product = await prisma.Product.findUnique({
            where: { product_id: parseInt(id) },
            include: { images: true }
        });

        if (!product) return res.status(404).send("ไม่พบสินค้า");

        // ✅ ลบรูปเก่าออกจาก Cloudinary
        for (const img of product.images) {
            await cloudinary.uploader.destroy(img.cloudinary_id);
        }

        // ✅ อัปโหลดรูปใหม่ขึ้น Cloudinary
        const uploadPromises = files.map(file =>
            cloudinary.uploader.upload(bufferToDataUri(file), {
                folder: "lendly_products",
            })
        );
        const uploadResults = await Promise.all(uploadPromises);

        // ✅ อัปเดตสัดส่วน
        await prisma.Proportion_product.update({
            where: { proportion_product_id: product.ppId },
            data: {
                chest: chest ? parseFloat(chest) : null,
                waist: waist ? parseFloat(waist) : null,
                hips: hips ? parseFloat(hips) : null
            }
        });

        // ✅ สร้างชุดข้อมูลราคาใหม่
        const priceData = [];
        if (price_costume) {
            priceData.push({
                type: "suit",
                price_test: parseFloat(price_costume),
                price_pri: parseFloat(price_costume),
                days_test: days_suit_test ? parseInt(days_suit_test) : null,
                days_pri: days_suit_pri ? parseInt(days_suit_pri) : null
            });
        }
        if (price_wig) {
            priceData.push({
                type: "wig",
                price_test: parseFloat(price_wig),
                price_pri: parseFloat(price_wig)
            });
            if (price_costume) {
                priceData.push({
                    type: "suit_wig",
                    price_test: parseFloat(price_costume) + parseFloat(price_wig),
                    price_pri: parseFloat(price_costume) + parseFloat(price_wig)
                });
            }
        }
        if (price_prop) {
            priceData.push({
                type: "solo_prop",
                price_test: parseFloat(price_prop),
                price_pri: parseFloat(price_prop)
            });
        }
        if (price_shoe) {
            priceData.push({
                type: "solo_shoe",
                price_test: parseFloat(price_shoe),
                price_pri: parseFloat(price_shoe)
            });
        }
        if (price_pry_extra) {
            priceData.push({
                type: "addon_prop",
                price_test: parseFloat(price_pry_extra),
                price_pri: parseFloat(price_pry_extra)
            });
        }
        if (price_shoe_extra) {
            priceData.push({
                type: "addon_shoe",
                price_test: parseFloat(price_shoe_extra),
                price_pri: parseFloat(price_shoe_extra)
            });
        }

        // ✅ ลบข้อมูลราคาเก่า + รูปเก่าใน DB
        await prisma.Price.deleteMany({ where: { productId: parseInt(id) } });
        await prisma.ProductImage.deleteMany({ where: { productId: parseInt(id) } });

        // ✅ อัปเดตข้อมูลสินค้า
        await prisma.Product.update({
            where: { product_id: parseInt(id) },
            data: {
                product_name,
                story_name,
                shipping_info,
                categoryId: parseInt(categoryId),
                prices: { create: priceData },
                images: {
                    create: uploadResults.map(r => ({
                        image_url: r.secure_url,
                        cloudinary_id: r.public_id
                    }))
                }
            }
        });

        res.redirect("/");
    } catch (err) {
        console.error("Error updateProduct:", err);
        res.status(500).send("อัปเดตสินค้าไม่สำเร็จ");
    }
};


// GET /products/add → โหลดฟอร์มเพิ่มสินค้า
exports.renderAddProduct = async (req, res) => {
    try {
        const categories = await prisma.Category.findMany();
        res.render("add_pro", { categories });
    } catch (err) {
        console.error("Error renderAddProduct:", err);
        res.status(500).send("โหลดฟอร์มเพิ่มสินค้าไม่สำเร็จ");
    }
};


// GET /products/:id → รายละเอียดสินค้า
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.Product.findUnique({
            where: { product_id: parseInt(id) },
            include: {
                images: true,
                prices: true,
                category: true
            }
        });

        if (!product) {
            return res.status(404).send("ไม่พบสินค้า");
        }

        res.render("Detail_Pro", { product });
    } catch (err) {
        console.error("Error getProductById:", err);
        res.status(500).send("โหลดรายละเอียดสินค้าไม่สำเร็จ");
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
                proportion: true   // 👈 ดึงสัดส่วนที่สัมพันธ์กับสินค้า
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

// GET / → หน้า home พร้อมสินค้า
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

// GET ทุกหน้าที่มีสินค้า
exports.renderProductsPage = async (req, res, page) => {
    try {
        const products = await prisma.Product.findMany({
            include: {
                images: true,
                prices: true
            },
            orderBy: { product_id: "desc" }
        });

        res.render(page, { products });
    } catch (err) {
        console.error(`Error render${page}:`, err);
        res.status(500).send("โหลดสินค้าล้มเหลว");
    }
};
