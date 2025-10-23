function redderPage(view, title) {
    return (req, res,) => res.render(view, { title });
}

module.exports = {
    renderHome: redderPage('home', 'Home Page'),
    renderFav: redderPage('favorites', 'Favorites Page'),
    renderCart: redderPage('cart', 'Cart Page'),
    renderAll_review: redderPage('all_review', 'All Review Page'),
    renderCategory: redderPage('category', 'Category Page'),
    renderDetail_Pro: redderPage('Detail_Pro', 'Detail Product Page'),
    renderMy_rentals: redderPage('my_rentals', 'My Rentals Page'),
    renderLogin: redderPage('login', 'Login Page'),
    renderRegister: redderPage('register', 'Register Page'),
    renderForgetpassword: redderPage('forgetpassword', 'forgetpassword Page'),
    renderResetpassword: redderPage('resetpassword', 'Reset Password Page'),
    renderOtpVerify: redderPage('otpVerify', 'OTP Verify Page'),
    renderProfile: redderPage('Profile', 'Profile Page'),
    renderAdd_product: redderPage('add_pro', 'Add Product Page'),
    renderDetail_product: redderPage('Detail_Pro', 'Detail Product Page'),
    renderEdit_product: redderPage('edit_pro', 'Edit Product Page'),
    renderDetail_Rnd: redderPage('Detail_Ren', 'Detail Rental Page'),
    renderWrite_review: redderPage('write_review', 'Write Review Page'),
    renderReturn_order: redderPage('return_order', 'Return Order Page'),
    renderAdmin_rentals: redderPage('admin_rentals', 'Admin Rentals'),
    renderAdmin_tracking: redderPage('admin_tracking', 'Admin Tracking Page'),
    renderAdmin_return: redderPage('admin_return', 'Admin Return Page'),
};