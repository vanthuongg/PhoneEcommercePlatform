const express = require('express');
const router = express.Router();
const { getDashboardStats, getRevenueChart } = require('./stats.controller');
const { protect, authorize } = require('../../middleware/auth');

router.get('/dashboard', protect, authorize('manager', 'admin'), getDashboardStats);
router.get('/revenue', protect, authorize('manager', 'admin'), getRevenueChart);

module.exports = router;
