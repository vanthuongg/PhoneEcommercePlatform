const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, createNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.post('/', protect, authorize('admin', 'manager'), createNotification);

module.exports = router;
