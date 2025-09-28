const prisma = require('../../prisma/prisma');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

exports.upload = multer({ storage });

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
  
      const file = req.file;
  
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
          ...(file && {
            product_image: fs.readFileSync(file.path),
            image_mime: file.mimetype
          }),
          prices: {
            create: priceData
          }
        }
      });
  
      res.redirect("/");
    } catch (err) {
      console.error("Error createProduct:", err);
      res.status(500).send("เพิ่มสินค้าไม่สำเร็จ");
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


// GET / → ดึงสินค้าไปโชว์ใน home
exports.getProducts = async (req, res) => {
    try {
        const products = await prisma.Product.findMany({
            include: { prices: true }
        });
        res.render("home", { products });
    } catch (err) {
        console.error("Error getProducts:", err);
        res.status(500).render("home", { products: [] });
    }
};
