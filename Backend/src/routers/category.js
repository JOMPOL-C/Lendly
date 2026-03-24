const express = require('express');
const router = express.Router();

const categoryController = require('../Controllers/categoryController');
const { requireAdmin } = require('../middlewares/roleMiddleware');

router
    .route('/categories')   // post /api/categories
    .post(requireAdmin, categoryController.createCategory)

router
    .route('/category')   // get /api/categories
    .get(categoryController.getCategories)

module.exports = router;
