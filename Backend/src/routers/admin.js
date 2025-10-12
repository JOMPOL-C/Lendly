const express = require('express');
const router = express.Router();

router
    .route('/admin/users')   // get /api/admin/users
    .get(require('../Controllers/adminController').getUsers)

module.exports = router;