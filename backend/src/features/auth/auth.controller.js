const User = require('../users/user.model');
const Setting = require('../settings/setting.model');
const Notification = require('../notifications/notification.model');
const jwt = require('jsonwebtoken');

const generateToken = (id, expiresInDays) => {
  const expiresIn = expiresInDays ? `${expiresInDays}d` : (process.env.JWT_EXPIRE || '7d');
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const settings = await Setting.findOne();
    if (settings && settings.allowRegistration === false) {
      return res.status(403).json({ success: false, message: 'Hệ thống hiện tạm dừng nhận đăng ký tài khoản mới' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id, settings && settings.sessionTimeoutDays);

    if (settings && settings.newUserNotify !== false) {
      Notification.create({
        role: 'admin',
        title: `👤 Thành viên mới đăng ký`,
        message: `Khách hàng ${user.name} (${user.email}) vừa tạo tài khoản thành công.`,
        type: 'user',
        link: `/admin/users`,
      }).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
    }

    const settings = await Setting.findOne();
    if (settings && settings.maintenanceMode === true && user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Hệ thống đang bảo trì, vui lòng quay lại sau' });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, settings && settings.sessionTimeoutDays);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: avatar } = payload;
    
    const settings = await Setting.findOne() || {};

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.avatar) user.avatar = avatar;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        role: 'customer'
      });

      if (settings.newUserNotify !== false) {
        Notification.create({
          role: 'admin',
          title: `👤 Thành viên mới đăng ký Google`,
          message: `Khách hàng ${user.name} (${user.email}) vừa đăng ký qua Google.`,
          type: 'user',
          link: `/admin/users`,
        }).catch(console.error);
      }
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
    }
    
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    
    const jwtToken = generateToken(user._id, settings.sessionTimeoutDays);
    
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Đăng nhập Google thất bại: ' + error.message });
  }
};

module.exports = { register, login, googleLogin, getMe, changePassword };
