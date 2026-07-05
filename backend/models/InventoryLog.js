const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['import', 'export', 'adjust'],
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    variantId: {
      type: String,
      default: null,
    },
    variantInfo: {
      type: String,
      default: 'Tất cả / Mặc định',
    },
    quantity: {
      type: Number,
      required: true, // Dương cho nhập kho, Âm cho xuất kho
    },
    beforeStock: {
      type: Number,
      default: 0,
    },
    afterStock: {
      type: Number,
      default: 0,
    },
    unitPrice: {
      type: Number,
      default: 0, // Đơn giá nhập hoặc xuất (VND)
    },
    totalValue: {
      type: Number,
      default: 0, // Thành tiền = Math.abs(quantity) * unitPrice
    },
    reason: {
      type: String,
      default: 'Giao dịch kho hàng',
    },
    supplier: {
      type: String,
      default: '', // Nhà cung cấp khi nhập kho (e.g. Apple Vietnam, Synnex FPT)
    },
    note: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index giúp truy vấn lịch sử nhanh hơn theo sản phẩm và thời gian
inventoryLogSchema.index({ product: 1, createdAt: -1 });
inventoryLogSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
