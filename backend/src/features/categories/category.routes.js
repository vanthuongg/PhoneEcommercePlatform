const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('./category.controller');
const { protect, authorize } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

router.get('/', getCategories);
router.post('/', protect, authorize('admin', 'manager'), upload.single('image'), createCategory);
router.put('/:id', protect, authorize('admin', 'manager'), upload.single('image'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
