const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Vui lòng nhập mã giảm giá'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'freeship'],
      required: true,
    },
    discountValue: { type: Number, required: true, default: 0 }, // % giảm hoặc số tiền giảm
    maxDiscountAmount: { type: Number, default: 0 }, // Giảm tối đa (cho %, 0 là không giới hạn)
    minOrderValue: { type: Number, default: 0 }, // Đơn tối thiểu
    usageLimit: { type: Number, default: 100 }, // Tổng số lần dùng
    usedCount: { type: Number, default: 0 }, // Số lần đã dùng
    userLimit: { type: Number, default: 1 }, // Mỗi user dùng tối đa
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    applicableTo: {
      type: String,
      enum: ['all', 'category', 'product', 'brand', 'user'],
      default: 'all',
    },
    applicableIds: [{ type: mongoose.Schema.Types.ObjectId }], // IDs của category, product hoặc user nếu không phải all
    applicableBrands: [{ type: String }], // Tên thương hiệu nếu applicableTo === 'brand'
    tag: {
      type: String,
      enum: ['default', 'daily', 'flash', 'brand', 'shipping', 'new_user', 'vip'],
      default: 'default',
    },
    scope: {
      type: String,
      enum: ['platform_freeship', 'platform_discount', 'shop_discount', 'all'],
      default: 'all', // all = tự xác định theo discountType hoặc áp dụng sàn
    },
    paymentMethodRestriction: {
      type: String,
      enum: ['all', 'cod', 'momo', 'vnpay', 'bank_transfer', 'paypal', 'stripe'],
      default: 'all', // all = áp dụng mọi hình thức thanh toán
    },
    savedByUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Danh sách user đã lưu vào Ví Voucher
    badgeText: { type: String, default: '' }, // Nhãn nổi bật (VD: Freeship TechPhone, Ưu Đãi Hệ Thống)
    isDaily: { type: Boolean, default: false }, // true = Cập nhật & thay đổi hàng ngày, false = Mặc định luôn có sẵn
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voucher', voucherSchema);
