const prisma = require('../../prisma/prisma');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

exports.upload = multer({ storage }).array("product_images", 10);
// 10 = จำกัดอัปโหลดได้สูงสุด 10 รูป


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

        // 1) สร้างสัดส่วนก่อน
        const proportion = await prisma.Proportion_product.create({
            data: {
                chest: chest ? parseFloat(chest) : null,
                waist: waist ? parseFloat(waist) : null,
                hips: hips ? parseFloat(hips) : null
            }
        });

        // 2) เตรียมราคาสินค้า
        const priceData = [];

        // ราคาชุด
        if (price_costume) {
            priceData.push({
                type: "suit",
                price_test: parseFloat(price_costume),
                price_pri: parseFloat(price_costume),
                days_test: days_suit_test ? parseInt(days_suit_test) : null,
                days_pri: days_suit_pri ? parseInt(days_suit_pri) : null
            });
        }

        // ราคาวิก
        if (price_wig) {
            priceData.push({
                type: "wig",
                price_test: parseFloat(price_wig),
                price_pri: parseFloat(price_wig)
            });

            // ✅ ถ้ามีทั้งชุด + วิก ให้เพิ่มราคาพิเศษ suit_wig
            if (price_costume) {
                priceData.push({
                    type: "suit_wig",
                    price_test: parseFloat(price_costume) + parseFloat(price_wig),
                    price_pri: parseFloat(price_costume) + parseFloat(price_wig)
                });
            }
        }

        // ราคาพร็อพเดี่ยว
        if (price_prop) {
            priceData.push({
                type: "solo_prop",
                price_test: parseFloat(price_prop),
                price_pri: parseFloat(price_prop)
            });
        }

        // ราคารองเท้าเดี่ยว
        if (price_shoe) {
            priceData.push({
                type: "solo_shoe",
                price_test: parseFloat(price_shoe),
                price_pri: parseFloat(price_shoe)
            });
        }

        // ✅ ราคา addon พิเศษ (พร็อพ)
        if (price_pry_extra) {
            priceData.push({
                type: "addon_prop",
                price_test: parseFloat(price_pry_extra),
                price_pri: parseFloat(price_pry_extra)
            });
        }

        // ✅ ราคา addon พิเศษ (รองเท้า)
        if (price_shoe_extra) {
            priceData.push({
                type: "addon_shoe",
                price_test: parseFloat(price_shoe_extra),
                price_pri: parseFloat(price_shoe_extra)
            });
        }

        // 3) สร้างสินค้า + ผูกกับสัดส่วน
        await prisma.Product.create({
            data: {
                product_name,
                story_name,
                shipping_info,
                categoryId,
                ppId: proportion.proportion_product_id,
                prices: { create: priceData },
                images: {
                    create: files.map(f => ({
                        image_data: fs.readFileSync(f.path),
                        image_mime: f.mimetype
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

        // 1) อัปเดตสัดส่วน
        const product = await prisma.Product.findUnique({
            where: { product_id: id }
        });

        if (!product) return res.status(404).send("ไม่พบสินค้า");

        await prisma.Proportion_product.update({
            where: { proportion_product_id: product.ppId },
            data: {
                chest: chest ? parseFloat(chest) : null,
                waist: waist ? parseFloat(waist) : null,
                hips: hips ? parseFloat(hips) : null
            }
        });

        // 2) เตรียมราคาสินค้าใหม่ (เหมือน create)
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

        // 3) ลบ price เก่า + ใส่ใหม่ (วิธีง่ายสุด)
        await prisma.ProductImage.deleteMany({ where: { productId: parseInt(id, 10) } });

        // 4) อัปเดต Product
        await prisma.Product.update({
            where: { product_id: parseInt(id, 10) },
            data: {
                product_name,
                story_name,
                shipping_info,
                categoryId,
                prices: {
                    create: priceData
                },
                images: {
                    create: files.map(f => ({
                        image_data: fs.readFileSync(f.path),
                        image_mime: f.mimetype
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
  