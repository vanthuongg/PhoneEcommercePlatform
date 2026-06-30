const express = require('express');
const router = express.Router();
const {
  getVouchers,
  getAvailableVouchers,
  getAllVouchersAdmin,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  validateVoucher,
  resetDailyVouchers,
  notifyVoucher
} = require('../controllers/voucherController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getVouchers);
router.get('/available', getAvailableVouchers);
router.post('/validate', validateVoucher);
router.get('/admin', protect, authorize('admin', 'manager'), getAllVouchersAdmin);
router.post('/reset', protect, authorize('admin', 'manager'), resetDailyVouchers);
router.post('/:id/notify', protect, authorize('admin', 'manager'), notifyVoucher);
router.post('/', protect, authorize('admin', 'manager'), createVoucher);
router.put('/:id', protect, authorize('admin', 'manager'), updateVoucher);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteVoucher);

module.exports = router;
