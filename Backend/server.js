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
const { requireUser, requireAdmin } = require("./src/middlewares/roleMiddleware");

const depositController = require("./src/Controllers/depositController");
const authController = require("./src/Controllers/authController");
const productController = require("./src/Controllers/productController");
const productControllerPage = require("./src/Controllers/productControllerPage");
const cartController = require("./src/Controllers/cartController");
const rentalsController = require("./src/Controllers/rentalsController");
const reviewController = require("./src/Controllers/reviewController");
const adminController = require("./src/Controllers/adminController");
const shippingController = require("./src/Controllers/shippingController");
const delayController = require("./src/Controllers/delayController");
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
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "../Frontend/public")));

const uploadSlipRouter = require("./src/routers/uploadSlipRouter");
app.use("/api", uploadSlipRouter);

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

// ✅ ใช้ auth middleware สำหรับทุกหน้า (ยกเว้น upload-slip)
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
// 💬 CHAT PAGES
// ============================
app.get("/chat", requireUser, (req, res) => {
  res.render("chat_customer");
});
app.get("/admin/chat", requireAdmin, (req, res) => {
  res.render("admin_chat");
});

// ============================
// 🔒 GLOBAL ROLE GUARD
// ============================
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
app.get("/admin/Deposit_refund", adminController.renderDepositRefundPage);
app.get("/admin/top-stats", adminController.getTopStats);

// ============================
// 💜 PUBLIC PAGES
// ============================
app.get("/", productControllerPage.getProducts);
app.get("/all_review", reviewController.getAllReviews);
app.get("/category", (req, res) =>
  productControllerPage.renderProductsPage(req, res, "category")
);
app.get("/my_rentals", rentalsController.renderMy_rentals);
app.get("/Detail_Pro", PageRender.renderDetail_Pro);
app.get("/detail_product", PageRender.renderDetail_product);
app.get("/favorites", requireUser, productControllerPage.renderFavoritesPage);
app.get("/cart", requireUser, cartController.getCart);
app.get("/my_rentals", requireUser, rentalsController.renderMy_rentals);
app.get("/write_review", authMiddleware, reviewController.renderWriteReview);
app.get("/Detail_Ren", requireUser, PageRender.renderDetail_Rnd);
app.get("/deposit_user", requireUser, depositController.renderUserDepositPage);

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
      include: { OrderItem: { include: { product: true, price: true } } },
    });

    if (!order) return res.status(404).send("ไม่พบคำสั่งซื้อ");

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

app.get("/profile", authController.getProfile);

// ============================
// ☁️ CLOUDINARY CONNECTION CHECK
// ============================
cloudinary.api
  .ping()
  .then(res => console.log("✅ Cloudinary Connected:", res.status))
  .catch(err => console.error("❌ Cloudinary error:", err));

// ============================
// ⚡ SOCKET.IO SETUP
// ============================
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ให้ controller เข้าถึง io ได้
app.set("io", io);

// ============================
// ⚡ SOCKET EVENTS
// ============================
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // 📦 เข้าห้องตาม chatId
  socket.on("joinRoom", (chatId) => {
    const roomName = `chat_${chatId}`;
    socket.join(roomName);
    console.log(`🟣 ${socket.id} joined room: ${roomName}`);
  });

  // 💬 รับข้อความที่ client ส่งขึ้น (optional fallback)
  socket.on("sendMessage", (msgData) => {
    const roomName = `chat_${msgData.chatId}`;
    const fullMsg = { ...msgData, roomId: roomName };
    io.to(roomName).emit("receiveMessage", fullMsg);
    console.log(`📨 [Socket Relay] ${msgData.senderRole} → ${roomName}: ${msgData.message}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

module.exports = { server, io };

// ============================
// 🚀 START SERVER
// ============================
const PORT = 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running with Socket.IO on http://localhost:${PORT}`);
});
