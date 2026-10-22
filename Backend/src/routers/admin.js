const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const { requireAdmin } = require("../middlewares/roleMiddleware");

router.use('/admin', requireAdmin);

// ✅ ผู้ใช้ทั้งหมด
router
    .get('/admin/customers', adminController.getAllCustomers);


// ✅ ยืนยันการเช่า
router
    .put('/admin/confirm-rental/:rentalId', adminController.confirmRental);

// ✅ แดชบอร์ด
router
    .get('/admin/dashboard', adminController.renderAdminDashboard)
    .get('/admin/top-stats', adminController.getTopStats);

module.exports = router;
