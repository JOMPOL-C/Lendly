const prisma = require('../../prisma/prisma');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// memory storage (ไม่ต้องเขียนไฟล์ลง disk)
const storage = multer.memoryStorage();
exports.upload = multer({ storage }).array("product_images", 10); // อัปได้สูงสุด 10 รูป

// ฟังก์ชันแปลง buffer → data URI
const bufferToDataUri = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

const parseMeasurement = (value, unit = "cm") => {
  if (value === undefined || value === null || value === "") return null;

  const numericValue = parseFloat(value);
  if (Number.isNaN(numericValue)) return null;

  const valueInCm = unit === "in" ? numericValue * 2.54 : numericValue;
  return Number(valueInCm.toFixed(1));
};

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
      size_unit,
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
      deposit,
      status
    } = req.body;

    const files = req.files || [];
    console.log("📦 req.body:", req.body);

    // ✅ helper แปลงค่าให้เป็นตัวเลข ป้องกัน NaN
    const toNum = v => (v && !isNaN(parseFloat(v)) ? parseFloat(v) : 0);

    const depositValue = toNum(deposit);
    const normalizedSizeUnit = size_unit === "in" ? "in" : "cm";

    // ✅ 1) อัปโหลดรูปทั้งหมดขึ้น Cloudinary
    const uploadPromises = files.map(file =>
      cloudinary.uploader.upload(bufferToDataUri(file), { folder: "lendly_products" })
    );
    const uploadResults = await Promise.all(uploadPromises);

    // ✅ 2) สร้างสัดส่วนสินค้า
    const proportion = await prisma.Proportion_product.create({
      data: {
        chest: parseMeasurement(chest, normalizedSizeUnit),
        waist: parseMeasurement(waist, normalizedSizeUnit),
        hips: parseMeasurement(hips, normalizedSizeUnit)
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
        price_pry_extra: pryExtra,
        days_test: testDays,
        days_pri: priDays,
        Deposit: depositValue
      });
    }

    // 💇 วิก
    if (wig > 0) {
      priceData.push({
        type: "wig",
        price_test: wig,
        price_pri: wig + pryExtra,
        price_pry_extra: pryExtra,
        days_test: testDays,
        days_pri: priDays,
        Deposit: depositValue
      });
    }

    // 🎭 พร็อพเดี่ยว
    if (prop > 0) {
      priceData.push({
        type: "solo_prop",
        price_test: prop,
        price_pri: prop + pryExtra,
        price_pry_extra: pryExtra,
        days_test: testDays,
        days_pri: priDays,
        Deposit: depositValue
      });
    }

    // 👟 รองเท้าเดี่ยว
    if (shoe > 0) {
      priceData.push({
        type: "solo_shoe",
        price_test: shoe,
        price_pri: shoe + pryExtra,
        price_pry_extra: pryExtra,
        days_test: testDays,
        days_pri: priDays,
        Deposit: depositValue
      });
    }

    // 💡 พร็อพเสริม
    if (addonProp > 0) {
      priceData.push({
        type: "addon_prop",
        price_test: addonProp,
        price_pri: addonProp + pryExtra,
        price_pry_extra: pryExtra,
        days_test: testDays,
        days_pri: priDays,
        Deposit: depositValue
      });
    }

    // 💡 รองเท้าเสริม
    if (addonShoe > 0) {
      priceData.push({
        type: "addon_shoe",
        price_test: addonShoe,
        price_pri: addonShoe + pryExtra,
        price_pry_extra: pryExtra,
        days_test: testDays,
        days_pri: priDays,
        Deposit: depositValue
      });
    }

    // 👗💇 ชุด + วิก (ราคาพิเศษ)
    if (suitWig > 0) {
      priceData.push({
        type: "suit_wig",
        price_test: suitWig,
        price_pri: suitWig + pryExtra,
        price_pry_extra: pryExtra,
        days_test: testDays,
        days_pri: priDays,
        Deposit: depositValue
      });

      // ✅ เฉพาะกรณีที่มี suit_wig ด้วย
      if (addonProp > 0) {
        priceData.push({
          type: "suit_wig_prop",
          price_test: suitWig + addonProp,
          price_pri: suitWig + addonProp + pryExtra,
          price_pry_extra: pryExtra,
          days_test: testDays,
          days_pri: priDays,
          Deposit: depositValue
        });
      }

      if (addonShoe > 0) {
        priceData.push({
          type: "suit_wig_shoe",
          price_test: suitWig + addonShoe,
          price_pri: suitWig + addonShoe + pryExtra,
          price_pry_extra: pryExtra,
          days_test: testDays,
          days_pri: priDays,
          Deposit: depositValue
        });
      }

      if (addonProp > 0 && addonShoe > 0) {
        priceData.push({
          type: "suit_wig_prop_shoe",
          price_test: suitWig + addonProp + addonShoe,
          price_pri: suitWig + addonProp + addonShoe + pryExtra,
          price_pry_extra: pryExtra,
          days_test: testDays,
          days_pri: priDays,
          Deposit: depositValue
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
        product_status: status !== "inactive",
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
    if (err.code === "P2000" && err.meta?.column_name === "shipping_info") {
      return res.status(400).send("รายละเอียดสินค้ายาวเกินไปสำหรับฐานข้อมูลปัจจุบัน");
    }
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
      size_unit,
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
      removeImages,
      deposit,
      status
    } = req.body;

    const files = req.files || [];
    const toNum = v => (v && !isNaN(parseFloat(v)) ? parseFloat(v) : 0);
    const depositValue = toNum(deposit);
    const normalizedSizeUnit = size_unit === "in" ? "in" : "cm";

    // ✅ โหลดข้อมูลสินค้าเดิม
    const product = await prisma.Product.findUnique({
      where: { product_id: parseInt(id) },
      include: { images: true, size: true, prices: true },
    });
    if (!product) return res.status(404).send("ไม่พบสินค้า");

    // ✅ ลบรูปเก่าตามที่เลือก
    if (removeImages) {
      const ids = Array.isArray(removeImages) ? removeImages : [removeImages];
      for (const imgId of ids) {
        const img = await prisma.ProductImage.findUnique({
          where: { image_id: parseInt(imgId) },
        });
        if (img?.cloudinary_id) await cloudinary.uploader.destroy(img.cloudinary_id);
        await prisma.ProductImage.delete({ where: { image_id: parseInt(imgId) } });
      }
    }

    // ✅ เพิ่มรูปใหม่ถ้ามี
    if (files.length > 0) {
      const uploadResults = await Promise.all(
        files.map(file =>
          cloudinary.uploader.upload(bufferToDataUri(file), { folder: "lendly_products" })
        )
      );
      await prisma.ProductImage.createMany({
        data: uploadResults.map(r => ({
          productId: parseInt(id),
          image_url: r.secure_url,
          cloudinary_id: r.public_id,
        })),
      });
    }

    // ✅ อัปเดตสัดส่วน
    if (product.ppId) {
      await prisma.Proportion_product.update({
        where: { proportion_product_id: product.ppId },
        data: {
          chest: parseMeasurement(chest, normalizedSizeUnit),
          waist: parseMeasurement(waist, normalizedSizeUnit),
          hips: parseMeasurement(hips, normalizedSizeUnit),
        },
      });
    }

    // ✅ เตรียมราคาที่แก้ไข
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

    const priceData = [
      { type: "suit", val: suit },
      { type: "wig", val: wig },
      { type: "suit_wig", val: suitWig },
      { type: "solo_prop", val: prop },
      { type: "solo_shoe", val: shoe },
      { type: "addon_prop", val: addonProp },
      { type: "addon_shoe", val: addonShoe },
    ].filter(p => p.val > 0);

    // ✅ อัปเดตราคา (แบบ upsert)
    for (const price of priceData) {
      const existing = product.prices.find(p => p.type === price.type);

      if (existing) {
        // มีอยู่แล้ว → update
        await prisma.ProductPrice.update({
          where: { productPrice_id: existing.productPrice_id },
          data: {
            price_test: price.val,
            price_pri: price.val + pryExtra,
            price_pry_extra: pryExtra,
            days_test: testDays,
            days_pri: priDays,
            Deposit: depositValue,
          },
        });
      } else {
        // ยังไม่มี → create ใหม่
        await prisma.ProductPrice.create({
          data: {
            productId: parseInt(id),
            type: price.type,
            price_test: price.val,
            price_pri: price.val + pryExtra,
            price_pry_extra: pryExtra,
            days_test: testDays,
            days_pri: priDays,
            Deposit: depositValue,
          },
        });
      }
    }

    // ✅ อัปเดตข้อมูลสินค้าอื่น ๆ
    await prisma.Product.update({
      where: { product_id: parseInt(id) },
      data: {
        product_name,
        story_name,
        shipping_info,
        product_status: status !== "inactive",
        category: { connect: { category_id: categoryId } },
      },
    });

    res.redirect("/admin/products");
  } catch (err) {
    console.error("❌ Error updateProduct:", err);
    if (err.code === "P2000" && err.meta?.column_name === "shipping_info") {
      return res.status(400).send("รายละเอียดสินค้ายาวเกินไปสำหรับฐานข้อมูลปัจจุบัน");
    }
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
