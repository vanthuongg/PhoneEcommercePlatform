const express = require('express');
const router = express.Router();
const { getProductReviews, getMyReviews, createReview, deleteReview } = require('./review.controller');
const { protect, authorize } = require('../../middleware/auth');

router.get('/my', protect, getMyReviews);
router.get('/:productId', getProductReviews);
router.post('/', protect, authorize('customer', 'admin', 'manager', 'staff'), createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
