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
app.use(authMiddleware);
app.use(express.static(path.join(__dirname, "../Frontend/public")));
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(setUser); // 👈 ใช้ setUser หลัง authMiddleware
app.use("/", require("./src/routers/checkDuplicate"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../Frontend/views"));

// render page
app.get('/', productController.getProducts);
app.get('/favorites', pagerender.renderfav);
app.get('/cart', pagerender.rendercart);
app.get('/all_review', pagerender.renderall_review);
app.get('/category', (req, res) => productController.renderProductsPage(req, res, 'category'));
app.get('/Detail_Pro', pagerender.renderDetail_Pro);
app.get('/my_rentals', pagerender.rendermy_rentals);
app.get('/login', pagerender.renderlogin);
app.get('/register', pagerender.renderregister);
app.get('/forgotpassword', pagerender.renderforgotpassword);
app.get('/resetpassword', pagerender.renderresetpassword);
app.get('/otpVerify', pagerender.renderotpVerify);
app.get('/Detail_Ren', pagerender.renderDetail_Rnd);

app.get('/profile', authController.getProfile);

app.get('/detail_product', pagerender.renderdetail_product);


// app.get('/add_product',pagerender.renderadd_product);
app.get('/add_product', productController.renderAddProduct);



// route
fs.readdirSync(path.join(__dirname, "src/routers"))
  .filter(file => file.endsWith(".js"))
  .forEach((file) => {
    const route = require(path.join(__dirname, "src/routers", file));
    console.log("👉 Loaded file:", file);
    app.use("/api", route);
  });

cloudinary.api.ping()
  .then(res => console.log("✅ Cloudinary OK:", res))
  .catch(err => console.error("❌ Cloudinary error:", err));

app.listen(8000, () => {
  console.log('Server is running on http://localhost:8000');
});