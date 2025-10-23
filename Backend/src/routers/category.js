const express = require('express');
const router = express.Router();

const categoryController = require('../Controllers/categoryController');

router
    .route('/categories')   // post /api/categories
    .post(categoryController.createCategory)

router
    .route('/category')   // get /api/categories
    .get(categoryController.getCategories)

module.exports = router;