const Voucher = require('../models/Voucher');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Helper: Tự động cập nhật & làm mới các voucher hàng ngày và đảm bảo có đủ combo voucher chuẩn hệ thống TechPhone Store
const ensureDailyVouchers = async () => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const futureDate = new Date();
    futureDate.setFullYear(now.getFullYear() + 1);

    // Tự động chuyển đổi tên và mã voucher cũ từ Shopee sang chuẩn TechPhone Store trong database
    await Voucher.updateMany({ code: 'FREESHIPXTRA' }, { $set: { code: 'TECHFREESHIP30', title: '🚚 Freeship TechPhone - Giảm 30K Phí Ship', badgeText: 'Freeship TechPhone' } });
    await Voucher.updateMany({ code: 'FREESHIP50K' }, { $set: { code: 'TECHFREESHIP50', title: '🚀 Freeship TechPhone - Giảm 50K Siêu Tốc', badgeText: 'Freeship 50K' } });
    await Voucher.updateMany({ code: 'FLASHDAY20' }, { $set: { code: 'TECHFLASH20', title: '⚡ TechPhone Flash Sale - Giảm 20% Hôm Nay', badgeText: 'Siêu Sale 20%' } });
    await Voucher.updateMany({ code: 'TODAY100K' }, { $set: { code: 'TECHDAY100K', title: '🎁 Quà Tặng TechPhone - Giảm 100K Hôm Nay', badgeText: 'Quà TechPhone' } });
    await Voucher.updateMany({ code: 'MOMOSALE' }, { $set: { code: 'TECHMOMO', title: '💜 TechPhone x MoMo - Giảm Ngay 150K', badgeText: 'Ưu Đãi MoMo' } });
    await Voucher.updateMany({ code: 'VNPAYSALE' }, { $set: { code: 'TECHVNPAY', title: '💙 TechPhone x VNPay - Giảm Ngay 100K', badgeText: 'Ưu Đãi VNPay' } });
    await Voucher.updateMany({ code: 'LUCKYDAY50' }, { $set: { code: 'TECHLUCKY', title: '🍀 TechPhone Lucky - Giảm Ngay 50K', badgeText: 'Mã May Mắn' } });
    await Voucher.updateMany({ title: /Shopee/i }, { $set: { title: '⚡ Ưu Đãi Hệ Thống TechPhone - Giảm Giá Đặc Biệt', badgeText: 'TechPhone Sàn' } });
    await Voucher.updateMany({ badgeText: /Shopee/i }, { $set: { badgeText: 'TechPhone Sàn' } });

    // Kiểm tra xem đã có voucher hệ thống TechPhone chưa
    const hasFreeship = await Voucher.findOne({ code: 'TECHFREESHIP30' });
    if (!hasFreeship) {
      const techPhoneVouchers = [
        // 1. Nhóm Miễn Phí Vận Chuyển (Freeship)
        {
          code: 'TECHFREESHIP30',
          title: '🚚 Freeship TechPhone - Giảm 30K Phí Ship',
          description: 'Miễn phí vận chuyển tối đa 30.000đ cho đơn hàng từ 100.000đ (Áp dụng mọi hình thức thanh toán)',
          discountType: 'freeship',
          discountValue: 30000,
          minOrderValue: 100000,
          usageLimit: 500,
          usedCount: Math.floor(Math.random() * 50) + 10,
          startDate: startOfDay,
          endDate: futureDate,
          applicableTo: 'all',
          scope: 'platform_freeship',
          paymentMethodRestriction: 'all',
          tag: 'shipping',
          badgeText: 'Freeship TechPhone',
          isDaily: false,
          isActive: true,
        },
        {
          code: 'TECHFREESHIP50',
          title: '🚀 Freeship TechPhone - Giảm 50K Siêu Tốc',
          description: 'Giảm ngay 50.000đ phí giao hàng hỏa tốc cho đơn từ 300.000đ',
          discountType: 'freeship',
          discountValue: 50000,
          minOrderValue: 300000,
          usageLimit: 300,
          usedCount: Math.floor(Math.random() * 30) + 5,
          startDate: startOfDay,
          endDate: futureDate,
          applicableTo: 'all',
          scope: 'platform_freeship',
          paymentMethodRestriction: 'all',
          tag: 'shipping',
          badgeText: 'Freeship 50K',
          isDaily: false,
          isActive: true,
        },
        // 2. Nhóm Mã Hệ Thống / Platform Voucher
        {
          code: 'TECHFLASH20',
          title: '⚡ TechPhone Flash Sale - Giảm 20% Hôm Nay',
          description: 'Siêu giảm giá 20% tối đa 1.000.000đ cho đơn từ 3 triệu (Khung giờ vàng mỗi ngày)',
          discountType: 'percentage',
          discountValue: 20,
          maxDiscountAmount: 1000000,
          minOrderValue: 3000000,
          usageLimit: 100,
          usedCount: Math.floor(Math.random() * 20) + 5,
          startDate: startOfDay,
          endDate: endOfDay,
          applicableTo: 'all',
          scope: 'platform_discount',
          paymentMethodRestriction: 'all',
          tag: 'flash',
          badgeText: 'Siêu Sale 20%',
          isDaily: true,
          isActive: true,
        },
        {
          code: 'TECHDAY100K',
          title: '🎁 Quà Tặng TechPhone - Giảm 100K Hôm Nay',
          description: 'Giảm ngay 100.000đ cho mọi đơn mua sắm từ 1.5 triệu đồng - Làm mới 00:00 hàng ngày',
          discountType: 'fixed',
          discountValue: 100000,
          minOrderValue: 1500000,
          usageLimit: 150,
          usedCount: Math.floor(Math.random() * 25) + 8,
          startDate: startOfDay,
          endDate: endOfDay,
          applicableTo: 'all',
          scope: 'platform_discount',
          paymentMethodRestriction: 'all',
          tag: 'daily',
          badgeText: 'Quà TechPhone',
          isDaily: true,
          isActive: true,
        },
        {
          code: 'TECHMOMO',
          title: '💜 TechPhone x MoMo - Giảm Ngay 150K',
          description: 'Giảm 150.000đ cho đơn hàng từ 2 triệu đồng khi thanh toán bằng Ví điện tử MoMo',
          discountType: 'fixed',
          discountValue: 150000,
          minOrderValue: 2000000,
          usageLimit: 200,
          usedCount: Math.floor(Math.random() * 40) + 15,
          startDate: startOfDay,
          endDate: futureDate,
          applicableTo: 'all',
          scope: 'platform_discount',
          paymentMethodRestriction: 'momo',
          tag: 'vip',
          badgeText: 'Ưu Đãi MoMo',
          isDaily: false,
          isActive: true,
        },
        {
          code: 'TECHVNPAY',
          title: '💙 TechPhone x VNPay - Giảm Ngay 100K',
          description: 'Giảm 100.000đ cho đơn từ 1.5 triệu đồng khi quét mã QR VNPay',
          discountType: 'fixed',
          discountValue: 100000,
          minOrderValue: 1500000,
          usageLimit: 200,
          usedCount: Math.floor(Math.random() * 35) + 12,
          startDate: startOfDay,
          endDate: futureDate,
          applicableTo: 'all',
          scope: 'platform_discount',
          paymentMethodRestriction: 'vnpay',
          tag: 'default',
          badgeText: 'Ưu Đãi VNPay',
          isDaily: false,
          isActive: true,
        },
        {
          code: 'TECHLUCKY',
          title: '🍀 TechPhone Lucky - Giảm Ngay 50K',
          description: 'Mã may mắn giảm 50.000đ cho đơn từ 500.000đ - Cập nhật liên tục mỗi ngày',
          discountType: 'fixed',
          discountValue: 50000,
          minOrderValue: 500000,
          usageLimit: 200,
          usedCount: Math.floor(Math.random() * 20) + 12,
          startDate: startOfDay,
          endDate: endOfDay,
          applicableTo: 'all',
          scope: 'platform_discount',
          paymentMethodRestriction: 'all',
          tag: 'daily',
          badgeText: 'Mã May Mắn',
          isDaily: true,
          isActive: true,
        },
        // 3. Nhóm Mã Shop / Thương Hiệu (Brand Vouchers)
        {
          code: 'APPLE500',
          title: '🍎 TechPhone x Apple - Giảm 500K Siêu Phẩm',
          description: 'Giảm ngay 500.000đ cho tất cả sản phẩm chính hãng Apple từ 10 triệu đồng',
          discountType: 'fixed',
          discountValue: 500000,
          minOrderValue: 10000000,
          usageLimit: 100,
          usedCount: Math.floor(Math.random() * 15) + 3,
          startDate: startOfDay,
          endDate: futureDate,
          applicableTo: 'brand',
          applicableBrands: ['Apple'],
          scope: 'shop_discount',
          paymentMethodRestriction: 'all',
          tag: 'brand',
          badgeText: 'Apple Store',
          isDaily: false,
          isActive: true,
        },
        {
          code: 'SAMSUNG300',
          title: '📱 TechPhone x Samsung - Giảm 300K Galaxy',
          description: 'Giảm ngay 300.000đ cho các dòng điện thoại Samsung Galaxy từ 5 triệu đồng',
          discountType: 'fixed',
          discountValue: 300000,
          minOrderValue: 5000000,
          usageLimit: 150,
          usedCount: Math.floor(Math.random() * 20) + 5,
          startDate: startOfDay,
          endDate: futureDate,
          applicableTo: 'brand',
          applicableBrands: ['Samsung'],
          scope: 'shop_discount',
          paymentMethodRestriction: 'all',
          tag: 'brand',
          badgeText: 'Samsung Store',
          isDaily: false,
          isActive: true,
        },
        {
          code: 'XIAOMI200',
          title: '🧡 TechPhone x Xiaomi - Giảm 200K Chính Hãng',
          description: 'Giảm 200.000đ cho sản phẩm Xiaomi chính hãng từ 3 triệu đồng',
          discountType: 'fixed',
          discountValue: 200000,
          minOrderValue: 3000000,
          usageLimit: 150,
          usedCount: Math.floor(Math.random() * 20) + 4,
          startDate: startOfDay,
          endDate: futureDate,
          applicableTo: 'brand',
          applicableBrands: ['Xiaomi'],
          scope: 'shop_discount',
          paymentMethodRestriction: 'all',
          tag: 'brand',
          badgeText: 'Xiaomi Store',
          isDaily: false,
          isActive: true,
        },
      ];
      await Voucher.insertMany(techPhoneVouchers);
      return;
    }

    const sampleDaily = await Voucher.findOne({ isDaily: true });
    if (sampleDaily && sampleDaily.startDate) {
      const sampleDateStr = new Date(sampleDaily.startDate).toISOString().slice(0, 10);
      if (sampleDateStr !== todayStr) {
        await Voucher.updateMany(
          { isDaily: true },
          {
            $set: {
              usedCount: Math.floor(Math.random() * 8) + 2,
              startDate: startOfDay,
              endDate: endOfDay,
            },
          }
        );
      }
    }
  } catch (err) {
    console.error('Error ensuring daily vouchers:', err.message);
  }
};

// @desc    Lấy voucher public (đang hoạt động, còn hiệu lực)
exports.getVouchers = async (req, res) => {
  try {
    await ensureDailyVouchers();
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $expr: { $lt: ['$usedCount', '$usageLimit'] },
    }).sort({ isDaily: -1, endDate: 1 });
    res.json({ success: true, count: vouchers.length, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy voucher khả dụng theo giá trị đơn hàng (dùng trong checkout)
exports.getAvailableVouchers = async (req, res) => {
  try {
    await ensureDailyVouchers();
    const { orderValue = 0 } = req.query;
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      minOrderValue: { $lte: Number(orderValue) },
      $expr: { $lt: ['$usedCount', '$usageLimit'] },
    }).sort({ isDaily: -1, discountValue: -1 });
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
    await ensureDailyVouchers();
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
    
    // Gửi thông báo đẩy chỉ cho customer
    await Notification.create({
      user: null,
      role: 'customer',
      title: '🎁 Mã Giảm Giá Đặc Biệt',
      message: `Nhanh tay sử dụng mã ${voucher.code} - ${voucher.title}. Số lượng có hạn!`,
      type: 'promo',
      link: '/vouchers'
    });
    
    res.json({ success: true, message: `Đã gửi thông báo voucher thành công` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lưu voucher vào Ví Voucher cá nhân (TechPhone Wallet)
// @route   POST /api/vouchers/:id/claim hoặc /api/vouchers/claim
// @access  Private (User)
exports.claimVoucher = async (req, res) => {
  try {
    const code = req.body.code || req.params.id;
    if (!code) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã giảm giá' });

    const voucher = await Voucher.findOne({
      $or: [{ code: code.toUpperCase() }, { _id: mongoose.isValidObjectId(code) ? code : null }],
      isActive: true,
    });

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã ngừng hoạt động' });
    }

    const now = new Date();
    if (now > voucher.endDate) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn sử dụng' });
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết số lượng sử dụng' });
    }

    // Kiểm tra user đã lưu chưa
    if (voucher.savedByUsers && voucher.savedByUsers.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Bạn đã lưu mã giảm giá này trong Ví rồi' });
    }

    voucher.savedByUsers = voucher.savedByUsers || [];
    voucher.savedByUsers.push(req.user._id);
    await voucher.save();

    res.json({ success: true, message: '🎉 Đã lưu mã vào Ví Voucher thành công!', data: voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy danh sách voucher trong Ví của user
// @route   GET /api/vouchers/my-wallet
// @access  Private (User)
exports.getMyWallet = async (req, res) => {
  try {
    await ensureDailyVouchers();
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      savedByUsers: req.user._id,
      $expr: { $lt: ['$usedCount', '$usageLimit'] },
    }).sort({ endDate: 1 });

    res.json({ success: true, count: vouchers.length, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate & Apply combo voucher (TechPhone Stacking: Freeship + Platform + Brand)
// @route   POST /api/vouchers/validate-stack
// @access  Public / Private
exports.validateVoucherStack = async (req, res) => {
  try {
    await ensureDailyVouchers();
    const { freeshipCode, platformCode, shopCodes = {}, orderValue = 0, cartItems = [], paymentMethod = 'cod', cartBrands = [] } = req.body;

    const now = new Date();
    const appliedVouchers = [];
    let freeshipDiscount = 0;
    let platformDiscount = 0;
    let shopDiscount = 0;

    // Helper kiểm tra điều kiện chung của 1 voucher
    const validateSingle = (voucher, expectedScope, subtotalForCheck = orderValue) => {
      if (!voucher || !voucher.isActive) return { valid: false, error: 'Mã giảm giá không tồn tại hoặc đã bị khóa' };
      if (now < voucher.startDate || now > voucher.endDate) return { valid: false, error: `'${voucher.code}' chưa đến hạn hoặc đã hết hạn` };
      if (voucher.usedCount >= voucher.usageLimit) return { valid: false, error: `'${voucher.code}' đã hết số lượng sử dụng` };
      if (subtotalForCheck < voucher.minOrderValue) {
        const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.minOrderValue);
        return { valid: false, error: `'${voucher.code}' áp dụng cho đơn/nhóm sản phẩm tối thiểu từ ${formatted}` };
      }
      if (voucher.paymentMethodRestriction && voucher.paymentMethodRestriction !== 'all') {
        if (voucher.paymentMethodRestriction !== paymentMethod) {
          const methodNames = {
            cod: 'Tiền mặt (COD)',
            momo: 'Ví MoMo',
            vnpay: 'VNPay QR',
            bank_transfer: 'Chuyển khoản QR',
          };
          const requiredName = methodNames[voucher.paymentMethodRestriction] || voucher.paymentMethodRestriction.toUpperCase();
          return { valid: false, error: `'${voucher.code}' chỉ áp dụng khi thanh toán bằng ${requiredName}` };
        }
      }
      return { valid: true };
    };

    // Helper tính tiền giảm
    const calcDiscount = (voucher, baseAmount) => {
      if (voucher.discountType === 'freeship') return voucher.discountValue || 30000;
      if (voucher.discountType === 'percentage') {
        let amt = Math.round((baseAmount * voucher.discountValue) / 100);
        if (voucher.maxDiscountAmount > 0) amt = Math.min(amt, voucher.maxDiscountAmount);
        return amt;
      }
      return Math.min(voucher.discountValue, baseAmount);
    };

    // 1. Kiểm tra Lớp 1: Freeship Voucher
    if (freeshipCode) {
      const v = await Voucher.findOne({ code: freeshipCode.toUpperCase(), isActive: true });
      if (v) {
        const check = validateSingle(v, 'platform_freeship', orderValue);
        if (!check.valid) return res.status(400).json({ success: false, message: check.error });
        
        freeshipDiscount = calcDiscount(v, 30000); // Mặc định tính trên phí ship
        appliedVouchers.push({
          code: v.code,
          scope: 'platform_freeship',
          title: v.title,
          discountAmount: freeshipDiscount,
          brand: '',
          voucherData: v,
        });
      } else {
        return res.status(404).json({ success: false, message: `Mã Miễn Phí Vận Chuyển '${freeshipCode}' không tồn tại` });
      }
    }

    // 2. Kiểm tra Lớp 2: TechPhone Platform Voucher
    if (platformCode) {
      const v = await Voucher.findOne({ code: platformCode.toUpperCase(), isActive: true });
      if (v) {
        const check = validateSingle(v, 'platform_discount', orderValue);
        if (!check.valid) return res.status(400).json({ success: false, message: check.error });

        platformDiscount = calcDiscount(v, orderValue);
        appliedVouchers.push({
          code: v.code,
          scope: 'platform_discount',
          title: v.title,
          discountAmount: platformDiscount,
          brand: '',
          voucherData: v,
        });
      } else {
        return res.status(404).json({ success: false, message: `Mã Ưu đãi hệ thống '${platformCode}' không tồn tại` });
      }
    }

    // 3. Kiểm tra Lớp 3: Shop / Brand Vouchers (mỗi brand trong giỏ 1 mã)
    if (shopCodes && typeof shopCodes === 'object') {
      for (const [brand, code] of Object.entries(shopCodes)) {
        if (!code) continue;
        const v = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });
        if (!v) return res.status(404).json({ success: false, message: `Mã Thương hiệu '${code}' không tồn tại` });

        // Tính subtotal cho Brand đó trong giỏ hàng
        let brandSubtotal = orderValue;
        if (cartItems && cartItems.length > 0) {
          const brandItems = cartItems.filter(item => item.product?.brand?.toLowerCase() === brand.toLowerCase() || item.brand?.toLowerCase() === brand.toLowerCase());
          if (brandItems.length > 0) {
            brandSubtotal = brandItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
          }
        }

        const check = validateSingle(v, 'shop_discount', brandSubtotal);
        if (!check.valid) return res.status(400).json({ success: false, message: check.error });

        // Kiểm tra xem mã có đúng áp dụng cho brand này không
        if (v.applicableTo === 'brand' && v.applicableBrands?.length > 0) {
          const isBrandMatch = v.applicableBrands.some(b => b.toLowerCase() === brand.toLowerCase());
          if (!isBrandMatch) {
            return res.status(400).json({ success: false, message: `Mã '${v.code}' chỉ áp dụng cho thương hiệu ${v.applicableBrands.join(', ')}` });
          }
        }

        const disc = calcDiscount(v, brandSubtotal);
        shopDiscount += disc;
        appliedVouchers.push({
          code: v.code,
          scope: 'shop_discount',
          title: v.title,
          discountAmount: disc,
          brand: brand,
          voucherData: v,
        });
      }
    }

    const totalDiscount = freeshipDiscount + platformDiscount + shopDiscount;
    res.json({
      success: true,
      data: {
        appliedVouchers,
        freeshipDiscount,
        platformDiscount,
        shopDiscount,
        totalDiscount,
        summaryText: `Đã áp dụng ${appliedVouchers.length} mã giảm giá (Tiết kiệm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalDiscount)})`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
