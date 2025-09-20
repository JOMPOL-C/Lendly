const express = require('express');
const router = express.Router();

const { 
    createProduct, 
    listProduct, 
    readProduct, 
    updateProduct, 
    removeProduct 
} = require('../Controllers/product');

router.get('/products',listProduct);
router.post('/products',createProduct);
router.get('/products/:productId',readProduct);
router.put('/products/:productId',updateProduct);
router.delete('/products/:productId',removeProduct);

module.exports = router;