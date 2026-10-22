const prisma = require('../../prisma/prisma');

const getCategoryPageData = async (req) => {
  const { categoryId, search, chest, waist, hips, minPrice, maxPrice } = req.query;
  const parsedMinPrice = minPrice ? parseFloat(minPrice) : null;
  const parsedMaxPrice = maxPrice ? parseFloat(maxPrice) : null;
  const hasPriceFilter = Number.isFinite(parsedMinPrice) || Number.isFinite(parsedMaxPrice);

  const categories = await prisma.Category.findMany({
    orderBy: { category_name: "asc" },
  });

  const whereClause = {
    ...(categoryId ? { categoryId } : {}),
    ...(search ? { product_name: { contains: search } } : {}),
    ...(chest || waist || hips
      ? {
        size: {
          chest: chest ? { gte: parseFloat(chest) - 5, lte: parseFloat(chest) + 5 } : undefined,
          waist: waist ? { gte: parseFloat(waist) - 5, lte: parseFloat(waist) + 5 } : undefined,
          hips: hips ? { gte: parseFloat(hips) - 5, lte: parseFloat(hips) + 5 } : undefined,
        },
      }
      : {}),
    ...(hasPriceFilter
      ? {
        prices: {
          some: {
            type: "suit_wig",
            price_test: {
              ...(Number.isFinite(parsedMinPrice) ? { gte: parsedMinPrice } : {}),
              ...(Number.isFinite(parsedMaxPrice) ? { lte: parsedMaxPrice } : {}),
            },
          },
        },
      }
      : {}),
  };

  const products = await prisma.Product.findMany({
    where: whereClause,
    include: {
      images: true,
      category: true,
      prices: {
        where: { type: "suit_wig" },
        take: 1
      },
    },
    orderBy: { product_id: "desc" },
  });

  let likedIds = [];
  if (req.user) {
    const favorites = await prisma.Favorite.findMany({
      where: { customerId: req.user.id },
      select: { productId: true },
    });
    likedIds = favorites.map(f => f.productId);
  }

  return {
    categories,
    products,
    likedIds,
    selectedCategory: categoryId || "",
    selectedSize: "",
    searchTerm: search || "",
    chest,
    waist,
    hips,
    minPrice,
    maxPrice,
  };
};

// ✅ ดึงข้อมูลสินค้าทั้งหมด พร้อมภาพและราคาสินค้า
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.Product.findMany({
      include: {
        images: true,
        category: true,
        prices: {
          where: { type: "suit_wig" },
          take: 1
        }
      },
      orderBy: { product_id: "desc" }
    });

    const homeBanners = await prisma.HomeBanner.findMany({
      where: { is_active: true },
      orderBy: [
        { display_order: "asc" },
        { homeBanner_id: "desc" },
      ],
      take: 6,
    });
    const homeBanner = homeBanners[0] || null;

    let likedIds = [];
    if (req.user) {
      const favorites = await prisma.Favorite.findMany({
        where: { customerId: req.user.id },
        select: { productId: true },
      });
      likedIds = favorites.map(f => f.productId);
    }

    res.render("home", { products, likedIds, homeBanner, homeBanners });
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
    const pageData = await getCategoryPageData(req);
    res.render("category", pageData);
  } catch (err) {
    console.error("❌ Error renderProductsPage:", err);
    res.status(500).send("โหลดสินค้าล้มเหลว");
  }
};

exports.renderCategoryProductsPartial = async (req, res) => {
  try {
    const pageData = await getCategoryPageData(req);

    req.app.render("includes/categoryProductResults", pageData, (err, html) => {
      if (err) {
        console.error("❌ Error renderCategoryProductsPartial:", err);
        return res.status(500).json({ message: "โหลดสินค้าล้มเหลว" });
      }

      res.json({
        html,
        count: pageData.products.length,
        hasFilters: Boolean(
          pageData.minPrice ||
          pageData.maxPrice ||
          pageData.chest ||
          pageData.waist ||
          pageData.hips
        ),
      });
    });
  } catch (err) {
    console.error("❌ Error renderCategoryProductsPartial:", err);
    res.status(500).json({ message: "โหลดสินค้าล้มเหลว" });
  }
};

exports.renderFavoritesPage = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const favorites = await prisma.Favorite.findMany({
      where: { customerId: req.user.id },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            prices: {
              where: { type: "suit_wig" },
              take: 1
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const likedIds = favorites.map(f => f.productId);
    res.render("favorites", { favorites, likedIds });
  } catch (err) {
    console.error("❌ renderFavoritesPage error:", err);
    res.status(500).send("โหลดหน้าที่ถูกใจไม่สำเร็จ");
  }
};
