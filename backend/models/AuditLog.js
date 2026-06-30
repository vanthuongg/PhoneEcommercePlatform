const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true }, // e.g. 'UPDATE_PRODUCT', 'CONFIRM_ORDER', 'DELETE_USER'
    targetEntity: { type: String, required: true }, // e.g. 'Product', 'Order', 'User'
    targetId: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed }, // Lưu thông tin thay đổi
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
