const express = require('express');
const router = express.Router();

router
    .route('/admin/users')   // get /api/admin/users
    .get(require('../Controllers/adminController').getUsers)

// ✅ อัปเดตสถานะเมื่อกดยืนยันการเช่า
router
    .put("/admin/confirm-rental/:rentalId", require("../Controllers/adminController").confirmRental);

module.exports = router;