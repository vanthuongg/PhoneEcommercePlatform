const express = require('express');
const router = express.Router();
const { getInventoryLogs, createStockTransaction, getInventoryStats } = require('./inventory.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'manager', 'staff'));

router.get('/stats', getInventoryStats);
router.get('/logs', getInventoryLogs);
router.post('/transaction', authorize('admin', 'manager'), createStockTransaction);

module.exports = router;
