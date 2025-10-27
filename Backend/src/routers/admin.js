const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');

// ✅ ผู้ใช้ทั้งหมด
router.get('/admin/users', adminController.getUsers);

// ✅ ยืนยันการเช่า
router.put('/admin/confirm-rental/:rentalId', adminController.confirmRental);

// ✅ แดชบอร์ด
router.get('/admin/dashboard', adminController.renderAdminDashboard);
router.get('/admin/top-stats', require('../Controllers/adminController').getTopStats);

module.exports = router;
