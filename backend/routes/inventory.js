const express = require('express');
const router = express.Router();
const { getInventoryLogs, createStockTransaction, getInventoryStats } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

// Tất cả các thao tác kho đều yêu cầu đăng nhập với vai trò admin, manager hoặc staff
router.use(protect);
router.use(authorize('admin', 'manager', 'staff'));

router.get('/stats', getInventoryStats);
router.get('/logs', getInventoryLogs);
router.post('/transaction', authorize('admin', 'manager'), createStockTransaction);

module.exports = router;
