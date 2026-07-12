const User = require('./user.model');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: users,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin, Manager
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile (self)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, street, ward, district, city } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;

    if (street !== undefined || city !== undefined) {
      const addrData = {
        name: name || user.name,
        phone: phone || user.phone,
        street: street || '',
        ward: ward || '',
        district: district || '',
        city: city || '',
        isDefault: true,
      };
      if (user.addresses && user.addresses.length > 0) {
        user.addresses[0] = { ...user.addresses[0].toObject(), ...addrData };
      } else {
        user.addresses = [addrData];
      }
    }

    await user.save();
    res.json({ success: true, message: 'Cập nhật thông tin thành công', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all addresses
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user.addresses || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
  try {
    const { name, phone, street, ward, district, city, isDefault } = req.body;
    if (!name || !phone || !street || !city) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ họ tên, số điện thoại, địa chỉ và thành phố' });
    }
    const user = await User.findById(req.user._id);
    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }
    const newIsDefault = isDefault || user.addresses.length === 0;
    user.addresses.push({ name, phone, street, ward: ward || '', district: district || '', city, isDefault: newIsDefault });
    await user.save();
    res.status(201).json({ success: true, message: 'Thêm địa chỉ thành công', data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const { name, phone, street, ward, district, city, isDefault } = req.body;
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, message: 'Địa chỉ không tồn tại' });
    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }
    addr.name = name || addr.name;
    addr.phone = phone || addr.phone;
    addr.street = street || addr.street;
    addr.ward = ward !== undefined ? ward : addr.ward;
    addr.district = district !== undefined ? district : addr.district;
    addr.city = city || addr.city;
    addr.isDefault = isDefault !== undefined ? isDefault : addr.isDefault;
    await user.save();
    res.json({ success: true, message: 'Cập nhật địa chỉ thành công', data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, message: 'Địa chỉ không tồn tại' });
    const wasDefault = addr.isDefault;
    addr.deleteOne();
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    res.json({ success: true, message: 'Xóa địa chỉ thành công', data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set default address
// @route   PATCH /api/users/addresses/:addressId/default
// @access  Private
const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, message: 'Địa chỉ không tồn tại' });
    user.addresses.forEach(a => { a.isDefault = false; });
    addr.isDefault = true;
    await user.save();
    res.json({ success: true, message: 'Đã đặt làm địa chỉ mặc định', data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin update user role/status
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  try {
    const { name, role, isActive, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive, phone },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    res.json({ success: true, message: 'Cập nhật người dùng thành công', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Admin' });
    await user.deleteOne();
    res.json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle-status
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `Tài khoản đã ${user.isActive ? 'mở khóa' : 'khóa'} thành công`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateProfile, updateUser, deleteUser, toggleUserStatus, getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };
