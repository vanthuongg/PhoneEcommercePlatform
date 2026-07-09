const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('./cart.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);
router.use(authorize('customer', 'admin', 'manager', 'staff'));

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
