const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/write_review', authMiddleware, reviewController.renderWriteReview);

router.post(
    '/orders/review',
    authMiddleware,
    reviewController.upload.array('reviewImages'),
    reviewController.createReview
  );
  
router.get('/all_review', reviewController.getAllReviews);

module.exports = router;
