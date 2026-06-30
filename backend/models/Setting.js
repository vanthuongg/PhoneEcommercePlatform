const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'ShopVN' },
    siteEmail: { type: String, default: 'admin@shopvn.com' },
    currency: { type: String, default: 'VND' },
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
    lowStockThreshold: { type: Number, default: 10 },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistration: { type: Boolean, default: true },
    orderConfirmEmail: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
