const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authControllers');

// เรียกดูข้อมูล ผู้ใช้
router
    .route('/auth/login')
    .post(authController.login)

router
    .route('/auth/:id')


module.exports = router;