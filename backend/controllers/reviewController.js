const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's reviews
// @route   GET /api/reviews/my
// @access  Customer
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Customer
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;

    // Check if user bought this product
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: 'delivered',
    });

    let review = await Review.findOne({ product: productId, user: req.user._id });
    if (review) {
      review.rating = Number(rating);
      review.comment = comment;
      review.images = images || [];
      await review.save();
    } else {
      review = await Review.create({
        product: productId,
        user: req.user._id,
        rating: Number(rating),
        comment,
        images: images || [],
        isVerifiedPurchase: !!hasPurchased,
      });
    }

    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, message: 'Đánh giá thành công', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Customer (own), Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });

    if (req.user.role === 'customer' && review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa đánh giá này' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Xóa đánh giá thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProductReviews, getMyReviews, createReview, deleteReview };
