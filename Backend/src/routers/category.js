const express = require('express');
const router = express.Router();

const categoryControllers = require('../Controllers/categoryControllers');

router
    .route('/categories')   // post /api/categories
    .post(categoryControllers.createCategory)

router
    .route('/category')   // get /api/categories
    .get(categoryControllers.getCategories)

module.exports = router;