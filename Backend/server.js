const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const pagerender = require('./src/utils/pagerender');


require('dotenv').config();


// middlewares
app.use(express.static(path.join(__dirname, "../Frontend/public")));
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../Frontend/views"));

// render page
app.get('/',pagerender.renderhomePage);
app.get('/favorites',pagerender.renderfav);
app.get('/cart',pagerender.rendercart);
app.get('/all_review',pagerender.renderall_review);
app.get('/category',pagerender.rendercategory);
app.get('/Detail_Pro',pagerender.renderDetail_Pro);
app.get('/my_rentals',pagerender.rendermy_rentals);
app.get('/login',pagerender.renderlogin);
app.get('/register',pagerender.renderregister);
app.get('/forgotpassword',pagerender.renderforgotpassword);
app.get('/resetpassword',pagerender.renderresetpassword);
app.get('/otpVerify',pagerender.renderotpVerify);

// route
fs.readdirSync(path.join(__dirname, "src/routers"))
  .filter(file => file.endsWith(".js"))
  .forEach((file) => {
    const route = require(path.join(__dirname, "src/routers", file));
    console.log("👉 Loaded file:", file);
    app.use("/api", route);
  });


app.listen(8000, () => {
    console.log('Server is running on port 8000');
});