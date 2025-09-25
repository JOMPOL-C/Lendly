const express = require('express');
const router = express.Router();
const { login } = require('../Controllers/authControllers');

// เรียกดูข้อมูล ผู้ใช้
router.post('/login', login);

module.exports = router;