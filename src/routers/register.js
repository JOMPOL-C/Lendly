const express = require('express');
const router = express.Router();
const registerControllers = require('../Controllers/registerController');

router
    .route('/register')
    .post(registerControllers.register)

module.exports = router;