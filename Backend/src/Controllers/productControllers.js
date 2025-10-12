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
        price_suit_wig,
        price_prop,
        price_shoe,
        price_pry_extra,
        price_prop_addon,
        price_shoe_addon,
        days_suit_test,
        days_suit_pri
      } = req.body;
  
      const files = req.files || [];
      console.log("📦 req.body:", req.body);
  
      // ✅ helper แปลงค่าให้เป็นตัวเลข ป้องกัน NaN
      const toNum = v => (v && !isNaN(parseFloat(v)) ? parseFloat(v) : 0);
  
      // ✅ 1) อัปโหลดรูปทั้งหมดขึ้น Cloudinary
      const uploadPromises = files.map(file =>
        cloudinary.uploader.upload(bufferToDataUri(file), { folder: "lendly_products" })
      );
      const uploadResults = await Promise.all(uploadPromises);
  
      // ✅ 2) สร้างสัดส่วนสินค้า
      const proportion = await prisma.Proportion_product.create({
        data: {
          chest: toNum(chest),
          waist: toNum(waist),
          hips: toNum(hips)
        }
      });
  
      // ✅ 3) เตรียมราคาสินค้า
      const suit = toNum(price_costume);
      const wig = toNum(price_wig);
      const suitWig = toNum(price_suit_wig); // ราคาพิเศษของชุด+วิก
      const prop = toNum(price_prop);
      const shoe = toNum(price_shoe);
      const addonProp = toNum(price_prop_addon);
      const addonShoe = toNum(price_shoe_addon);
      const pryExtra = toNum(price_pry_extra);
  
      const testDays = days_suit_test ? parseInt(days_suit_test) : null;
      const priDays = days_suit_pri ? parseInt(days_suit_pri) : null;
  
      const priceData = [];
  
      // 🧥 ชุด
      if (suit > 0) {
        priceData.push({
          type: "suit",
          price_test: suit,
          price_pri: suit + pryExtra,
          days_test: testDays,
          days_pri: priDays
        });
      }
  
      // 💇 วิก
      if (wig > 0) {
        priceData.push({
          type: "wig",
          price_test: wig,
          price_pri: wig + pryExtra,
          days_test: testDays,
          days_pri: priDays
        });
      }
  
      // 🎭 พร็อพเดี่ยว
      if (prop > 0) {
        priceData.push({
          type: "solo_prop",
          price_test: prop,
          price_pri: prop + pryExtra,
          days_test: testDays,
          days_pri: priDays
        });
      }
  
      // 👟 รองเท้าเดี่ยว
      if (shoe > 0) {
        priceData.push({
          type: "solo_shoe",
          price_test: shoe,
          price_pri: shoe + pryExtra,
          days_test: testDays,
          days_pri: priDays
        });
      }
  
      // 💡 พร็อพเสริม
      if (addonProp > 0) {
        priceData.push({
          type: "addon_prop",
          price_test: addonProp,
          price_pri: addonProp + pryExtra,
          days_test: testDays,
          days_pri: priDays
        });
      }
  
      // 💡 รองเท้าเสริม
      if (addonShoe > 0) {
        priceData.push({
          type: "addon_shoe",
          price_test: addonShoe,
          price_pri: addonShoe + pryExtra,
          days_test: testDays,
          days_pri: priDays
        });
      }
  
      // 👗💇 ชุด + วิก (ราคาพิเศษ)
      if (suitWig > 0) {
        priceData.push({
          type: "suit_wig",
          price_test: suitWig,
          price_pri: suitWig + pryExtra,
          days_test: testDays,
          days_pri: priDays
        });
  
        // ✅ เฉพาะกรณีที่มี suit_wig ด้วย
        if (addonProp > 0) {
          priceData.push({
            type: "suit_wig_prop",
            price_test: suitWig + addonProp,
            price_pri: suitWig + addonProp + pryExtra,
            days_test: testDays,
            days_pri: priDays
          });
        }
  
        if (addonShoe > 0) {
          priceData.push({
            type: "suit_wig_shoe",
            price_test: suitWig + addonShoe,
            price_pri: suitWig + addonShoe + pryExtra,
            days_test: testDays,
            days_pri: priDays
          });
        }
  
        if (addonProp > 0 && addonShoe > 0) {
          priceData.push({
            type: "suit_wig_prop_shoe",
            price_test: suitWig + addonProp + addonShoe,
            price_pri: suitWig + addonProp + addonShoe + pryExtra,
            days_test: testDays,
            days_pri: priDays
          });
        }
      }
  
      // ❗ กันพลาด — ไม่มีราคาสักรายการ
      if (priceData.length === 0) {
        return res.status(400).send("กรุณากรอกราคาอย่างน้อยหนึ่งรายการ");
      }
  
      // ✅ 4) บันทึกสินค้าและรูปทั้งหมด
      await prisma.Product.create({
        data: {
          product_name,
          story_name,
          shipping_info,
          category: { connect: { category_id: categoryId } },
          size: { connect: { proportion_product_id: proportion.proportion_product_id } },
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
      console.error("❌ Error createProduct:", err);
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
            if (price_costume) {
                priceData.push({
                    type: "suit_wig",
                    price_test: parseFloat(price_costume) + parseFloat(price_wig),
                    price_pri: parseFloat(price_costume) + parseFloat(price_wig)
                });
            }
        }

        // ราคาพร็อพ
        if (price_prop) {
            priceData.push({
                type: "solo_prop",
                price_test: parseFloat(price_prop),
                price_pri: parseFloat(price_prop)
            });
        }

        // ราคารองเท้า
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
