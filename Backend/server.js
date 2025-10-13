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

const pagerender = require('./src/utils/pagerender');
const authController = require('./src/Controllers/authControllers');
const productController = require('./src/Controllers/productControllers');
const productControllersPage = require('./src/Controllers/productControllersPage');
const cartController = require('./src/Controllers/cartController');



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

app.use(require("./src/middlewares/authMiddleware"));
app.use(require("./src/middlewares/setUser"));

app.use("/", require("./src/routers/checkDuplicate"));
app.use("/api", require("./src/routers/cart"));
app.use("/api", require("./src/routers/favorite"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../Frontend/views"));

// render page
app.get('/favorites', pagerender.renderfav);
app.get('/cart', cartController.getCart);
app.get('/all_review', pagerender.renderall_review);
app.get('/category', (req, res) => productControllersPage.renderProductsPage(req, res, 'category'));
app.get('/Detail_Pro', pagerender.renderDetail_Pro);
app.get('/my_rentals', pagerender.rendermy_rentals);
app.get('/login', pagerender.renderlogin);
app.get('/register', pagerender.renderregister);
app.get('/forgotpassword', pagerender.renderforgotpassword);
app.get('/resetpassword', pagerender.renderresetpassword);
app.get('/otpVerify', pagerender.renderotpVerify);
app.get('/Detail_Ren', pagerender.renderDetail_Rnd);
app.get('/write_review', pagerender.renderWrite_review);
app.get('/return_order', pagerender.renderReturn_order);
app.get('/detail_product', pagerender.renderdetail_product);
app.get('/edit_product', pagerender.renderedit_product);

fs.readdirSync(path.join(__dirname, "src/routers"))
  .filter(file => file.endsWith(".js"))
  .forEach((file) => {
    const route = require(path.join(__dirname, "src/routers", file));
    console.log("👉 Loaded file:", file);
    app.use("/api", route);
  });

app.get('/', productControllersPage.getProducts); // หน้า Home แสดงสินค้าทั้งหมด
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