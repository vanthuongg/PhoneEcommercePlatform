const express = require('express');
const router = express.Router();
const { getBanners, getAllBannersAdmin, createBanner, updateBanner, deleteBanner } = require('./banner.controller');
const { protect, authorize } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

router.get('/', getBanners);
router.get('/admin', protect, authorize('admin', 'manager'), getAllBannersAdmin);
router.post('/', protect, authorize('admin', 'manager'), upload.single('image'), createBanner);
router.put('/:id', protect, authorize('admin', 'manager'), upload.single('image'), updateBanner);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteBanner);

module.exports = router;
