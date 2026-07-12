const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist } = require('./wishlist.controller');
const { protect } = require('../../middleware/auth');

router.use(protect);
router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

module.exports = router;
