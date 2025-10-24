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

// ============================
// 📦 CONTROLLERS & MIDDLEWARES
// ============================
const PageRender = require("./src/utils/pagerender");
const authMiddleware = require("./src/middlewares/authMiddleware");
const setUser = require("./src/middlewares/setUser");
const authController = require("./src/Controllers/authController");
const productController = require("./src/Controllers/productController");
const productControllerPage = require("./src/Controllers/productControllerPage");
const cartController = require("./src/Controllers/cartController");
const rentalsController = require("./src/Controllers/rentalsController");
const orderController = require("./src/Controllers/orderController");

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

// ใช้ lib พื้นฐานก่อน (ยังไม่ parse body)
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "../Frontend/public")));

// ✅ โหลด upload-slip router ก่อน parse body ใด ๆ
const uploadSlipRouter = require("./src/routers/uploadSlipRouter");
app.use("/api", uploadSlipRouter);

// ✅ body-parser ใช้หลังจาก uploadSlipRouter เพื่อไม่ให้ชนกับ multer
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================
// 🔐 AUTH & USER CONTEXT
// ============================

// routes ด้านบนที่ไม่ต้อง login
app.use("/", require("./src/routers/checkDuplicate"));
app.get("/login", PageRender.renderLogin);
app.get("/register", PageRender.renderRegister);

// ✅ ตรวจ token ตั้งแต่ตรงนี้ลงไป
app.use((req, res, next) => {
  // ข้าม authMiddleware เฉพาะ upload-slip (กัน stream ถูกปิดก่อน multer)
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
// 🧭 PAGE RENDER ROUTES
// ============================
app.get("/", productControllerPage.getProducts);
app.get("/favorites", PageRender.renderFav);
app.get("/cart", cartController.getCart);
app.get("/all_review", PageRender.renderAll_review);
app.get("/category", (req, res) =>
  productControllerPage.renderProductsPage(req, res, "category")
);
app.get("/Detail_Pro", PageRender.renderDetail_Pro);
app.get("/my_rentals", rentalsController.renderMy_rentals);
app.get("/my_orders", orderController.getMyOrders);
app.get("/forgetpassword", PageRender.renderForgetpassword);
app.get("/resetpassword", PageRender.renderResetpassword);
app.get("/otpVerify", PageRender.renderOtpVerify);
app.get("/Detail_Ren", PageRender.renderDetail_Rnd);
app.get("/write_review", PageRender.renderWrite_review);
app.get("/return_order", PageRender.renderReturn_order);
app.get("/detail_product", PageRender.renderDetail_product);
app.get("/edit_product", PageRender.renderEdit_product);
app.get("/admin/rentals", PageRender.renderAdmin_rentals);
app.get("/admin/return", PageRender.renderAdmin_return);
app.get("/add_product", productController.renderAddProduct);
app.get("/admin/products", productController.renderAdminAllProducts);

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
        OrderItem: {
          include: {
            product: true,
            price: true,
          },
        },
      },
    });

    if (!order) return res.status(404).send("ไม่พบคำสั่งซื้อ");

    const total = parseFloat(order.total_price);
    const cartItems = order.OrderItem.map(i => ({
      product: i.product,
      numericPrice: parseFloat(i.price.price_pri || i.price.price_test),
    }));

    res.render("payment", { cartItems, total, orderId });
  } catch (err) {
    console.error("❌ payment page error:", err);
    res.status(500).send("Server Error");
  }
});


// ============================
// 🚀 API ROUTERS
// ============================

fs.readdirSync(path.join(__dirname, "src/routers"))
  .filter(
    (file) =>
      file.endsWith(".js") && file !== "uploadSlipRouter.js" // ✅ ข้ามไฟล์นี้
  )
  .forEach((file) => {
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
  .then((res) => console.log("✅ Cloudinary Connected:", res.status))
  .catch((err) => console.error("❌ Cloudinary error:", err));

// ============================
// 🧠 SERVER LISTEN
// ============================
app.listen(8000, () => {
  console.log("🚀 Server is running on http://localhost:8000");
});
