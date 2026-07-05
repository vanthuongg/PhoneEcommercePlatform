const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    // System Settings
    siteName: { type: String, default: 'ShopVN' },
    siteEmail: { type: String, default: 'admin@shopvn.com' },
    currency: { type: String, default: 'VND' },
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
    lowStockThreshold: { type: Number, default: 10 },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistration: { type: Boolean, default: true },
    orderConfirmEmail: { type: Boolean, default: true },

    // Notification Settings
    newOrderNotify: { type: Boolean, default: true },
    orderCancelNotify: { type: Boolean, default: true },
    lowStockNotify: { type: Boolean, default: true },
    newUserNotify: { type: Boolean, default: true },
    newReviewNotify: { type: Boolean, default: true },
    weeklyReportNotify: { type: Boolean, default: false },

    // Security Settings
    twoFactorAuth: { type: Boolean, default: false },
    rateLimiting: { type: Boolean, default: true },
    sessionTimeoutDays: { type: Number, default: 7 },
    corsProtection: { type: Boolean, default: true },
    maxLoginAttempts: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
