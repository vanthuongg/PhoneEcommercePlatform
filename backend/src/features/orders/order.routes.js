const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, updatePaymentStatus, cancelOrder, addOrderMessage } = require('./order.controller');
const { protect, authorize } = require('../../middleware/auth');

router.post('/', protect, authorize('customer', 'admin', 'manager', 'staff'), createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('staff', 'manager', 'admin'), updateOrderStatus);
router.put('/:id/payment-status', protect, authorize('staff', 'manager', 'admin'), updatePaymentStatus);
router.put('/:id/cancel', protect, authorize('customer', 'admin', 'manager', 'staff'), cancelOrder);
router.post('/:id/messages', protect, addOrderMessage);

module.exports = router;
