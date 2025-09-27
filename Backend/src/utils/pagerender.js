function redderPage(view, title) {
    return (req, res,) => res.render(view, { title });
}

module.exports = {
    renderhomePage: redderPage('home', 'Home Page'),
    renderfav: redderPage('favorites', 'Favorites Page'),
    rendercart: redderPage('cart', 'Cart Page'),
    renderall_review: redderPage('all_review', 'All Review Page'),
    rendercategory: redderPage('category', 'Category Page'),
    renderDetail_Pro: redderPage('Detail_Pro', 'Detail Product Page'),
    rendermy_rentals: redderPage('my_rentals', 'My Rentals Page'),
    renderlogin: redderPage('login', 'Login Page'),
    renderregister: redderPage('register', 'Register Page'),
    renderforgotpassword: redderPage('forgotpassword','forgetpassword Page'),
    renderresetpassword: redderPage('resetpassword', 'Reset Password Page'),
    renderotpVerify: redderPage('otpVerify', 'OTP Verify Page'),
};