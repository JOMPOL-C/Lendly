const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');

// เรียกดูข้อมูล ผู้ใช้
router
    .route('/auth')
    .post(authController.login)

router
    .route('/auth/:id')


module.exports = router;