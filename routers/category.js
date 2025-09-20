const express = require('express');
const router = express.Router();

const {
    createCategory, 
    //listCategory, 
    /*readCategory, 
    updateCategory, 
    removeCategory */
} = require('../Controllers/category');

//router.get('/categories',listCategory);
router.post('/categories',createCategory);
/* router.get('/categories/:categoryId',readCategory);
router.put('/categories/:categoryId',updateCategory);
router.delete('/categories/:categoryId',removeCategory); */

module.exports = router;