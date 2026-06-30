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
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voucher', voucherSchema);
