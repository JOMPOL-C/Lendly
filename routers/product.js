const express = require('express');
const router = express.Router();

const { create, list, read, update, remove } = require('../Controllers/product');

router.get('/products',list);
router.post('/products',create);
router.get('/products/:productId',read);
router.put('/products/:productId',update);
router.delete('/products/:productId',remove);

module.exports = router;