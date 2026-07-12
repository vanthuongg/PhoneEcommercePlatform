const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateProfile, updateUser, deleteUser, toggleUserStatus, getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = require('./user.controller');
const { protect, authorize } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

router.get('/', protect, authorize('admin', 'manager'), getAllUsers);
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.patch('/addresses/:addressId/default', protect, setDefaultAddress);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/:id', protect, authorize('admin', 'manager'), getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.patch('/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
