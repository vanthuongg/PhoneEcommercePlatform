const express = require('express');
const router = express.Router();
const { getBrands, getAllBrandsAdmin, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getBrands);
router.get('/admin', protect, authorize('admin', 'manager'), getAllBrandsAdmin);
router.post('/', protect, authorize('admin', 'manager'), createBrand);
router.put('/:id', protect, authorize('admin', 'manager'), updateBrand);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteBrand);

module.exports = router;
