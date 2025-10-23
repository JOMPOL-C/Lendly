const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./src/middlewares/authMiddleware');
const setUser = require('./src/middlewares/setUser');
const cloudinary = require('cloudinary').v2;

const PageRender = require('./src/utils/pagerender');
const authController = require('./src/Controllers/authController');
const productController = require('./src/Controllers/productController');
const productControllerPage = require('./src/Controllers/productControllerPage');
const cartController = require('./src/Controllers/cartController');
const rentalsController = require('./src/Controllers/rentalsController');
const orderController = require('./src/Controllers/orderController')



require('dotenv').config();


// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


// middlewares
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../Frontend/public")));
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 🔹 ไม่ต้องตรวจ token
app.use("/", require("./src/routers/checkDuplicate"));
app.get('/login', PageRender.renderLogin);
app.get('/register', PageRender.renderRegister);

// 🔹 เริ่มตรวจ token จากตรงนี้ลงไป
app.use(require("./src/middlewares/authMiddleware"));
app.use(require("./src/middlewares/setUser"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../Frontend/views"));

// render page
app.get('/favorites', PageRender.renderFav);
app.get('/cart', cartController.getCart);
app.get('/all_review', PageRender.renderAll_review);
app.get('/category', (req, res) => productControllerPage.renderProductsPage(req, res, 'category'));
app.get('/Detail_Pro', PageRender.renderDetail_Pro);
app.get('/my_rentals', rentalsController.renderMy_rentals);
app.get('/my_orders', orderController.getMyOrders);
app.get('/forgetpassword', PageRender.renderForgetpassword);
app.get('/resetpassword', PageRender.renderResetpassword);
app.get('/otpVerify', PageRender.renderOtpVerify);
app.get('/Detail_Ren', PageRender.renderDetail_Rnd);
app.get('/write_review', PageRender.renderWrite_review);
app.get('/return_order', PageRender.renderReturn_order);
app.get('/detail_product', PageRender.renderDetail_product);
app.get('/edit_product', PageRender.renderEdit_product);
app.get('/admin/rentals', PageRender.renderAdmin_rentals);
app.get('/admin/return', PageRender.renderAdmin_return);
// http://localhost:8000/api/admin/tracking

fs.readdirSync(path.join(__dirname, "src/routers"))
  .filter(file => file.endsWith(".js"))
  .forEach((file) => {
    const route = require(path.join(__dirname, "src/routers", file));
    console.log("👉 Loaded file:", file);
    app.use("/api", route);
  });

app.get('/', productControllerPage.getProducts); // หน้า Home แสดงสินค้าทั้งหมด
app.get('/profile', authController.getProfile); // profile ต้อง login ก่อน
app.get('/add_product', productController.renderAddProduct);
app.get('/admin/products', productController.renderAdminAllProducts);

app.use(authMiddleware); // ตรวจสอบ JWT และตั้งค่า res.locals.user
app.use(setUser); // ตั้งค่า req.user สำหรับ controllers

cloudinary.api.ping()
  .then(res => console.log("✅ Cloudinary OK:", res))
  .catch(err => console.error("❌ Cloudinary error:", err));

app.listen(8000, () => {
  console.log('Server is running on http://localhost:8000');
});