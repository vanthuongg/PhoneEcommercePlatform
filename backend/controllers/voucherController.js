const Voucher = require('../models/Voucher');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Lấy voucher public (đang hoạt động, còn hiệu lực)
exports.getVouchers = async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $expr: { $lt: ['$usedCount', '$usageLimit'] },
    }).sort({ endDate: 1 });
    res.json({ success: true, count: vouchers.length, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy voucher khả dụng theo giá trị đơn hàng (dùng trong checkout)
exports.getAvailableVouchers = async (req, res) => {
  try {
    const { orderValue = 0 } = req.query;
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      minOrderValue: { $lte: Number(orderValue) },
      $expr: { $lt: ['$usedCount', '$usageLimit'] },
    }).sort({ discountValue: -1 });
    res.json({ success: true, count: vouchers.length, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy tất cả voucher (Admin/Manager)
exports.getAllVouchersAdmin = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json({ success: true, count: vouchers.length, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo voucher
exports.createVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.create(req.body);
    res.status(201).json({ success: true, data: voucher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật voucher
exports.updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!voucher) return res.status(404).json({ success: false, message: 'Không tìm thấy voucher' });
    res.json({ success: true, data: voucher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Xóa voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Không tìm thấy voucher' });
    res.json({ success: true, message: 'Đã xóa voucher' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate & Apply voucher
exports.validateVoucher = async (req, res) => {
  try {
    const { code, orderValue, cartBrands } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã voucher' });

    const voucher = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });
    if (!voucher) return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá chưa đến hạn hoặc đã hết hạn' });
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    if (orderValue < voucher.minOrderValue) {
      const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.minOrderValue);
      return res.status(400).json({ success: false, message: `Đơn hàng tối thiểu phải từ ${formatted}` });
    }

    // Kiểm tra brand-specific voucher
    if (voucher.applicableTo === 'brand' && voucher.applicableBrands?.length > 0) {
      const brandsInCart = cartBrands || [];
      const hasApplicableBrand = voucher.applicableBrands.some(b =>
        brandsInCart.some(cb => cb.toLowerCase() === b.toLowerCase())
      );
      if (!hasApplicableBrand) {
        return res.status(400).json({
          success: false,
          message: `Mã này chỉ áp dụng cho sản phẩm: ${voucher.applicableBrands.join(', ')}`
        });
      }
    }

    // Tính toán giảm giá
    let discountAmount = 0;
    if (voucher.discountType === 'percentage') {
      discountAmount = Math.round((orderValue * voucher.discountValue) / 100);
      if (voucher.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
      }
    } else if (voucher.discountType === 'fixed') {
      discountAmount = Math.min(voucher.discountValue, orderValue);
    } else if (voucher.discountType === 'freeship') {
      discountAmount = voucher.discountValue;
    }

    res.json({ success: true, data: voucher, discountAmount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Làm mới lượt sử dụng voucher hằng ngày (Dành cho Admin)
// @route   POST /api/vouchers/reset
// @access  Admin/Manager
exports.resetDailyVouchers = async (req, res) => {
  try {
    const result = await Voucher.updateMany(
      { isActive: true },
      { $set: { usedCount: 0 } }
    );
    res.json({ success: true, message: 'Đã làm mới lượt sử dụng cho toàn bộ voucher đang hoạt động', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Gửi thông báo Voucher tới toàn bộ người dùng
// @route   POST /api/vouchers/:id/notify
// @access  Admin/Manager
exports.notifyVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Không tìm thấy voucher' });
    
    // Gửi thông báo đẩy broadcast chung (user = null, role = all)
    await Notification.create({
      user: null,
      role: 'all',
      title: '🎁 Mã Giảm Giá Đặc Biệt',
      message: `Nhanh tay sử dụng mã ${voucher.code} - ${voucher.title}. Số lượng có hạn!`,
      type: 'promo',
      link: '/shop'
    });
    
    res.json({ success: true, message: `Đã gửi thông báo voucher thành công` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
