const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null nếu thông báo chung (broadcast)
    role: { type: String, enum: ['customer', 'admin', 'manager', 'staff', 'all'], default: 'all' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['order', 'promo', 'alert', 'user'], default: 'order' },
    link: { type: String, default: '' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
