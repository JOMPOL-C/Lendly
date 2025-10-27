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
      price_suit_wig,
      price_prop,
      price_shoe,
      price_pry_extra,
      price_prop_addon,
      price_shoe_addon,
      days_suit_test,
      days_suit_pri,
      removeImages // 👈 มาจาก hidden input ด้านหน้าเว็บ
    } = req.body;

    const files = req.files || [];
    const toNum = v => (v && !isNaN(parseFloat(v)) ? parseFloat(v) : 0);

    // โหลดข้อมูลเก่า
    const product = await prisma.Product.findUnique({
      where: { product_id: parseInt(id) },
      include: { images: true, size: true },
    });
    if (!product) return res.status(404).send("ไม่พบสินค้า");

    // ✅ ถ้ามีการลบรูปบางรูป (มาจากหน้าเว็บ)
    if (removeImages) {
      const ids = Array.isArray(removeImages) ? removeImages : [removeImages];
      for (const imgId of ids) {
        const img = await prisma.ProductImage.findUnique({
          where: { image_id: parseInt(imgId) },
        });
        if (img?.cloudinary_id) {
          await cloudinary.uploader.destroy(img.cloudinary_id);
        }
        await prisma.ProductImage.delete({
          where: { image_id: parseInt(imgId) },
        });
      }
    }

    // ✅ ถ้ามีรูปใหม่ให้เพิ่ม
    if (files.length > 0) {
      const uploadPromises = files.map(file =>
        cloudinary.uploader.upload(bufferToDataUri(file), {
          folder: "lendly_products",
        })
      );
      const uploadResults = await Promise.all(uploadPromises);

      // เพิ่มรูปใหม่ในฐานข้อมูล (ไม่ลบของเก่า)
      await prisma.ProductImage.createMany({
        data: uploadResults.map(r => ({
          productId: parseInt(id),
          image_url: r.secure_url,
          cloudinary_id: r.public_id,
        })),
      });
    }

    // ✅ อัปเดตสัดส่วน (size)
    if (product.ppId) {
      await prisma.Proportion_product.update({
        where: { proportion_product_id: product.ppId },
        data: {
          chest: toNum(chest),
          waist: toNum(waist),
          hips: toNum(hips),
        },
      });
    }

    // ✅ เตรียมข้อมูลราคาใหม่
    const suit = toNum(price_costume);
    const wig = toNum(price_wig);
    const suitWig = toNum(price_suit_wig);
    const prop = toNum(price_prop);
    const shoe = toNum(price_shoe);
    const addonProp = toNum(price_prop_addon);
    const addonShoe = toNum(price_shoe_addon);
    const pryExtra = toNum(price_pry_extra);

    const testDays = days_suit_test ? parseInt(days_suit_test) : null;
    const priDays = days_suit_pri ? parseInt(days_suit_pri) : null;

    const priceData = [];

    if (suit > 0) {
      priceData.push({
        type: "suit",
        price_test: suit,
        price_pri: suit + pryExtra,
        days_test: testDays,
        days_pri: priDays,
      });
    }
    if (wig > 0) {
      priceData.push({
        type: "wig",
        price_test: wig,
        price_pri: wig + pryExtra,
        days_test: testDays,
        days_pri: priDays,
      });
    }
    if (suitWig > 0) {
      priceData.push({
        type: "suit_wig",
        price_test: suitWig,
        price_pri: suitWig + pryExtra,
        days_test: testDays,
        days_pri: priDays,
      });
    }
    if (prop > 0) {
      priceData.push({
        type: "solo_prop",
        price_test: prop,
        price_pri: prop + pryExtra,
        days_test: testDays,
        days_pri: priDays,
      });
    }
    if (shoe > 0) {
      priceData.push({
        type: "solo_shoe",
        price_test: shoe,
        price_pri: shoe + pryExtra,
        days_test: testDays,
        days_pri: priDays,
      });
    }
    if (addonProp > 0) {
      priceData.push({
        type: "addon_prop",
        price_test: addonProp,
        price_pri: addonProp + pryExtra,
      });
    }
    if (addonShoe > 0) {
      priceData.push({
        type: "addon_shoe",
        price_test: addonShoe,
        price_pri: addonShoe + pryExtra,
      });
    }

    // ✅ ลบข้อมูลราคาเก่าแล้วใส่ใหม่
    await prisma.ProductPrice.deleteMany({ where: { productId: parseInt(id) } });

    await prisma.Product.update({
      where: { product_id: parseInt(id) },
      data: {
        product_name,
        story_name,
        shipping_info,
        category: { connect: { category_id: categoryId } },
        prices: { create: priceData },
      },
    });

    res.redirect("/admin/products");
  } catch (err) {
    console.error("❌ Error updateProduct:", err);
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
        category: true,
        size: true
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

// แสดงสินค้าทั้งหมดสำหรับ Admin
exports.renderAdminAllProducts = async (req, res) => {
  try {
    const products = await prisma.Product.findMany({
      include: {
        images: { select: { image_url: true } },
        prices: true,
        category: true
      },
      orderBy: { product_id: "desc" }
    });

    res.render("all_product", { products });
  } catch (err) {
    console.error("❌ Error renderAdminAllProducts:", err);
    res.status(500).send("โหลดรายการสินค้าไม่สำเร็จ");
  }
};

// DELETE /api/products/:id → ลบสินค้า
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    const product = await prisma.Product.findUnique({
      where: { product_id: productId },
      include: { images: true },
    });

    if (!product) {
      console.warn(`⚠️ Product ${productId} not found`);
      return res.status(404).send("ไม่พบสินค้า");
    }

    // 🔹 ลบรูปใน Cloudinary
    for (const img of product.images) {
      if (img.cloudinary_id) {
        await cloudinary.uploader.destroy(img.cloudinary_id);
      }
    }

    // 🔹 ลบข้อมูลลูกทั้งหมด
    await prisma.ProductImage.deleteMany({ where: { productId } });
    await prisma.ProductPrice.deleteMany({ where: { productId } });
    await prisma.Rentals.deleteMany({ where: { productId } });
    await prisma.Review.deleteMany({ where: { productId } });
    await prisma.Report.deleteMany({ where: { productId } });
    await prisma.CartItem.deleteMany({ where: { productId } });
    await prisma.OrderItem.deleteMany({ where: { productId } });

    // 🔹 ลบตัวสินค้า (ใช้ deleteMany ปลอดภัยกว่า)
    await prisma.Product.deleteMany({ where: { product_id: productId } });

    console.log(`✅ ลบสินค้า #${productId} และข้อมูลที่เกี่ยวข้องทั้งหมดเรียบร้อย`);
    res.json({ message: "ลบสินค้าสำเร็จ" });

  } catch (err) {
    console.error("❌ Error deleteProduct:", err);
    res.status(500).send("ลบสินค้าไม่สำเร็จ");
  }
};
