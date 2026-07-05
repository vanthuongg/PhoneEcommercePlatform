const mongoose = require('mongoose');
const crypto = require('crypto');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  size: { type: String, default: 'M' },
  color: { type: String, default: 'Default' },
  image: { type: String, default: '' },
});

const timelineStepSchema = new mongoose.Schema({
  status: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  time: { type: Date, default: Date.now },
  completed: { type: Boolean, default: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      ward: { type: String, default: '' },
      district: { type: String, default: '' },
      city: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'bank_transfer', 'momo', 'vnpay', 'paypal', 'stripe'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
    itemsTotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 30000 },
    discount: { type: Number, default: 0 },
    voucherCode: { type: String, default: '' },
    freeshipDiscount: { type: Number, default: 0 },
    platformDiscount: { type: Number, default: 0 },
    shopDiscount: { type: Number, default: 0 },
    appliedVouchers: [
      {
        code: { type: String, required: true },
        scope: { type: String, default: 'platform_discount' },
        title: { type: String, default: '' },
        discountAmount: { type: Number, default: 0 },
        brand: { type: String, default: '' },
      },
    ],
    totalAmount: { type: Number, required: true },
    note: { type: String, default: '' },
    timeline: [timelineStepSchema],
    cancelReason: { type: String, default: '' },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (!this.orderCode) {
    this.orderCode = 'ORD' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  if (this.isNew && (!this.timeline || this.timeline.length === 0)) {
    this.timeline = [
      {
        status: 'pending',
        title: 'Đơn hàng đã đặt',
        description: 'Đơn hàng đang chờ nhà bán hàng xác nhận',
        time: new Date(),
        completed: true,
      },
    ];
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
