// ============================
// 🌈 LENDLY SERVER CONFIG
// ============================

require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
const isDev = process.env.NODE_ENV !== "production";
const liveReloadBootId = Date.now().toString();

// ============================
// 📦 CONTROLLERS & MIDDLEWARES
// ============================
const PageRender = require("./src/utils/pagerender");
const authMiddleware = require("./src/middlewares/authMiddleware");
const setUser = require("./src/middlewares/setUser");
const { requireUser, requireAdmin } = require("./src/middlewares/roleMiddleware");

const authController = require("./src/Controllers/authController");
const productController = require("./src/Controllers/productController");
const productControllerPage = require("./src/Controllers/productControllerPage");
const cartController = require("./src/Controllers/cartController");
const rentalsController = require("./src/Controllers/rentalsController");
const reviewController = require("./src/Controllers/reviewController");
const adminController = require("./src/Controllers/adminController");
const shippingController = require("./src/Controllers/shippingController");
const delayController = require("./src/Controllers/delayController");
const homeBannerController = require("./src/Controllers/homeBannerController");

const { autoCancelExpiredPayments } = require("./src/Controllers/rentalsController");

// ============================
// ☁️ CLOUDINARY CONFIG
// ============================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ============================
// 🧩 MIDDLEWARE SETUP
// ============================
app.use(cookieParser());
app.use(cors());
app.use(
  morgan("dev", {
    skip: (req) => isDev && req.path === "/__live_reload",
  })
);
app.use(express.static(path.join(__dirname, "../Frontend/public")));

if (isDev) {
  app.get("/__live_reload", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ bootId: liveReloadBootId });
  });

  app.use((req, res, next) => {
    const originalRender = res.render.bind(res);

    res.render = (view, locals, callback) => {
      let renderLocals = locals;
      let renderCallback = callback;

      if (typeof renderLocals === "function") {
        renderCallback = renderLocals;
        renderLocals = undefined;
      }

      const liveReloadScript = `
<script>
(() => {
  const currentBootId = "${liveReloadBootId}";
  const checkForChanges = async () => {
    try {
      const response = await fetch("/__live_reload", { cache: "no-store" });
      const payload = await response.json();
      if (payload.bootId && payload.bootId !== currentBootId) {
        window.location.reload();
      }
    } catch (error) {
      // Ignore transient restart errors while the dev server is booting again.
    }
  };

  window.setInterval(checkForChanges, 1000);
})();
</script>`;

      return originalRender(view, renderLocals, (err, html) => {
        if (err) {
          if (renderCallback) return renderCallback(err);
          return next(err);
        }

        const injectedHtml = html.includes("</body>")
          ? html.replace("</body>", `${liveReloadScript}</body>`)
          : `${html}${liveReloadScript}`;

        if (renderCallback) return renderCallback(null, injectedHtml);
        return res.send(injectedHtml);
      });
    };

    next();
  });
}

// ✅ โหลด upload-slip router ก่อน parse body ใด ๆ
const uploadSlipRouter = require("./src/routers/uploadSlipRouter");
app.use("/api", uploadSlipRouter);

// ✅ body-parser หลัง multer
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================
// 🔐 AUTH & USER CONTEXT
// ============================
app.use("/", require("./src/routers/checkDuplicate"));
app.get("/login", PageRender.renderLogin);
app.get("/register", PageRender.renderRegister);
app.get("/forgetpassword", PageRender.renderForgetpassword);
app.get("/resetpassword", PageRender.renderResetpassword);
app.get("/otpVerify", PageRender.renderOtpVerify);

// ✅ ใช้ auth middleware สำหรับหน้าอื่นทั้งหมด
app.use((req, res, next) => {
  if (req.originalUrl.includes("/upload-slip")) {
    console.log("🟡 [SKIP AUTH] -> upload-slip route");
    return next();
  }
  authMiddleware(req, res, next);
});

app.use(setUser);

// ============================
// 🎨 VIEW ENGINE
// ============================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../Frontend/views"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================
// 🔒 GLOBAL ROLE GUARD
// ============================

// ✅ ทุกหน้าใน /admin ต้องเป็น ADMIN
app.use("/admin", requireAdmin);
app.get("/admin/products", productController.renderAdminAllProducts);
app.get("/admin/rentals", PageRender.renderAdmin_rentals);
app.get("/admin/tracking", shippingController.getPendingShipments);
app.get("/admin/return", PageRender.renderAdmin_return);
app.get("/admin/add_product", productController.renderAddProduct);
app.get("/admin/edit_product", PageRender.renderEdit_product);
app.get("/admin/chat", PageRender.renderAdmin_chat);
app.get("/admin/dashboard", adminController.renderAdminDashboard);
app.get("/admin/customers", adminController.getAllCustomers);
app.get("/admin/delay_setting", delayController.renderDelaySetting);
app.get("/admin/home-banner", homeBannerController.renderAdminHomeBanner);
app.post("/admin/home-banner", homeBannerController.upload, homeBannerController.createHomeBanner);
app.post("/admin/home-banner/reorder", homeBannerController.reorderHomeBanners);
app.post("/admin/home-banner/:id/toggle", homeBannerController.updateHomeBannerStatus);
app.post("/admin/home-banner/:id/delete", homeBannerController.deleteHomeBanner);
 

// ============================
// 💜 PUBLIC PAGES (ใครก็เข้าได้)
// ============================
app.get("/", productControllerPage.getProducts);
app.get("/all_review", reviewController.getAllReviews);
app.get("/products/partial", (req, res) =>
  productControllerPage.renderCategoryProductsPartial(req, res)
);
app.get("/products", (req, res) =>
  productControllerPage.renderProductsPage(req, res, "category")
);
app.get("/category", (req, res) => {
  const queryString = new URLSearchParams(req.query).toString();
  res.redirect(301, queryString ? `/products?${queryString}` : "/products");
});
app.get("/my_rentals", rentalsController.renderMy_rentals);
app.get("/Detail_Pro", PageRender.renderDetail_Pro);
app.get("/detail_product", PageRender.renderDetail_product);
app.get("/forgetpassword", PageRender.renderForgetpassword);
app.get("/resetpassword", PageRender.renderResetpassword);
app.get("/otpVerify", PageRender.renderOtpVerify);
app.get("/login", PageRender.renderLogin);
app.get("/register", PageRender.renderRegister);

// ============================
// 👤 CUSTOMER PAGES (ล็อกอินเท่านั้น)
// ============================
app.get("/favorites", requireUser, productControllerPage.renderFavoritesPage);
app.get("/cart", requireUser, cartController.getCart);
app.get("/my_rentals", requireUser, rentalsController.renderMy_rentals);
app.get("/write_review", authMiddleware, reviewController.renderWriteReview);
app.get("/Detail_Ren", requireUser, PageRender.renderDetail_Rnd);



// ============================
// 💳 PAYMENT PAGE
// ============================
app.get("/payment", async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.redirect("/cart");

    const prisma = require("./prisma/prisma");

    const order = await prisma.Orders.findUnique({
      where: { order_id: parseInt(orderId) },
      include: {
        OrderItem: { include: { product: true, price: true } },
      },
    });

    if (!order) return res.status(404).send("ไม่พบคำสั่งซื้อ");

    // ✅ รวมค่าเช่าและมัดจำ
    const cartItems = order.OrderItem.map(i => ({
      product: i.product,
      numericPrice: parseFloat(i.price.price_pri || i.price.price_test),
      deposit: parseFloat(i.price.Deposit || 0),
    }));

    const totalRent = cartItems.reduce((sum, item) => sum + item.numericPrice, 0);
    const totalDeposit = cartItems.reduce((sum, item) => sum + item.deposit, 0);
    const total = totalRent + totalDeposit;

    res.render("payment", { cartItems, totalRent, totalDeposit, total, orderId });
  } catch (err) {
    console.error("❌ payment page error:", err);
    res.status(500).send("Server Error");
  }
});



setInterval(autoCancelExpiredPayments, 60 * 1000);

// ============================
// 🚀 API ROUTERS
// ============================
fs.readdirSync(path.join(__dirname, "src/routers"))
  .filter(file => file.endsWith(".js") && file !== "uploadSlipRouter.js")
  .forEach(file => {
    const route = require(path.join(__dirname, "src/routers", file));
    app.use("/api", route);
    console.log("👉 Loaded route file:", file);
  });

// ============================
// 👤 USER PROFILE ROUTE
// ============================
app.get("/profile", authController.getProfile);

// ============================
// ☁️ CLOUDINARY CONNECTION CHECK
// ============================
cloudinary.api
  .ping()
  .then(res => console.log("✅ Cloudinary Connected:", res.status))
  .catch(err => console.error("❌ Cloudinary error:", err));

// ============================
// 🧠 SERVER LISTEN
// ============================
app.listen(8000, () => {
  console.log("🚀 Server is running on http://localhost:8000");
});
