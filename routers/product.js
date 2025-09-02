const express = require('express');
const router = express.Router();

router.get('/products', (req, res) => {
    res.send('List of products GET');
});

router.get('/products/:productId', (req, res) => {
    const { productId } = req.params;
    console.log(productId);
    res.send(`Get product with ID: ${productId}`);
});

router.post('/products',(req, res) => {
    res.send('Create a new product POST');
});

router.put('/products/:productId',(req, res) => {
    const { productId } = req.params;
    console.log(productId);
    res.send('Update a product PUT');
});

router.delete('/products/:productId',(req, res) => {
    const { productId } = req.params;
    console.log(productId);
    res.send('Delete a product DELETE');
});

module.exports = router;