const express = require('express');
const router = express.Router();
const rentalControllers = require('../Controllers/rentalsControllers');

router
    .route('/rentals')   // get /api/rentals
    .get(rentalControllers.getRentals)
    .post(rentalControllers.createRental);

module.exports = router;