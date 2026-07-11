const express = require('express');
const router = express.Router();
const { getSettings, getPublicSettings, updateSettings } = require('./setting.controller');
const { protect, authorize } = require('../../middleware/auth');

router.get('/public', getPublicSettings);
router.get('/', protect, authorize('admin', 'manager'), getSettings);
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;
