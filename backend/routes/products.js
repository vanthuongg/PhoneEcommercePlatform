const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, updateStock } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('admin', 'manager'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('admin', 'manager'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.patch('/:id/stock', protect, authorize('admin', 'manager'), updateStock);

module.exports = router;
