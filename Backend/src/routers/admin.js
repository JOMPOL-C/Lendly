const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const { requireAdmin } = require("../middlewares/roleMiddleware");
const { uploadRefund } = require("../utils/multerConfig");

// ✅ ผู้ใช้ทั้งหมด
router
    .get('/admin/customers', requireAdmin, adminController.getAllCustomers);


// ✅ ยืนยันการเช่า
router
    .put('/admin/confirm-rental/:rentalId', adminController.confirmRental);

// ✅ แดชบอร์ด
router
    .get('/dashboard', requireAdmin, adminController.renderAdminDashboard)
    .get('/top-stats', requireAdmin, adminController.getTopStats)
    .get('/Deposit_refund', requireAdmin, adminController.renderDepositRefundPage);

router.post(
    '/refund/:rental_id',
    requireAdmin,
    uploadRefund.single('refund_slip'),
    adminController.refundDeposit
);

module.exports = router;
