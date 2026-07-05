const Setting = require('../models/Setting');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Admin, Manager
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public settings
// @route   GET /api/settings/public
// @access  Public
const getPublicSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({
      success: true,
      data: {
        siteName: settings.siteName || 'TechPhone Store',
        siteEmail: settings.siteEmail || 'support@techphone.vn',
        currency: settings.currency || 'VND',
        timezone: settings.timezone || 'Asia/Ho_Chi_Minh',
        maintenanceMode: settings.maintenanceMode || false,
        allowRegistration: settings.allowRegistration !== undefined ? settings.allowRegistration : true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      settings = await Setting.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
    }
    res.json({ success: true, data: settings, message: 'Cập nhật cài đặt thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, getPublicSettings, updateSettings };
