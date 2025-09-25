const express = require('express');
const router = express.Router();

const categoryControllers = require('../Controllers/categoryControllers');

router
    .route('/categories')
    .post(categoryControllers.createCategory)

/* router.get('/categories/:categoryId',readCategory);
router.put('/categories/:categoryId',updateCategory);
router.delete('/categories/:categoryId',removeCategory); */

module.exports = router;