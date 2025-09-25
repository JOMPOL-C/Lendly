const express = require('express');
const router = express.Router();

const productControllers = require('../Controllers/productControllers');

router
    .route('/products')
    .get(productControllers.listProduct)
    .post(productControllers.createProduct)
    
router
    .route('/products/:productId')
    .get(productControllers.readProduct)
    .put(productControllers.updateProduct)
    .delete(productControllers.removeProduct)

module.exports = router;