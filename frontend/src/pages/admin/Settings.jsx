import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, settingAPI, userAPI } from '../../services/api';
import { Save, Lock, Globe, Bell, Shield, Loader2, Check, User, Phone, Mail, RefreshCw, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  // Change password
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // System, Notification & Security settings
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'ShopVN',
    siteEmail: 'admin@shopvn.com',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    maintenanceMode: false,
    allowRegistration: true,
    orderConfirmEmail: true,
    lowStockThreshold: 10,
    newOrderNotify: true,
    orderCancelNotify: true,
    lowStockNotify: true,
    newUserNotify: true,
    newReviewNotify: true,
    weeklyReportNotify: false,
    twoFactorAuth: false,
    rateLimiting: true,
    sessionTimeoutDays: 7,
    corsProtection: true,
    maxLoginAttempts: 5,
  });

  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingAPI.get();
      if (res.data) {
        setSiteSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      toast.error('Lỗi khi tải cài đặt hệ thống');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await userAPI.updateProfile(profileForm);
      if (updateUser && res.data) {
        updateUser(res.data);
      }
      toast.success('Cập nhật thông tin tài khoản thành công!');
    } catch (err) {
      toast.error(err.message || 'Cập nhật thông tin thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải ít nhất 6 ký tự');
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    try {
      const res = await settingAPI.update(siteSettings);
      if (res.data) {
        setSiteSettings((prev) => ({ ...prev, ...res.data }));
      }
      toast.success('Lưu cấu hình hệ thống thành công!');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAllNotifications = (status) => {
    setSiteSettings((prev) => ({
      ...prev,
      newOrderNotify: status,
      orderCancelNotify: status,
      lowStockNotify: status,
      newUserNotify: status,
      newReviewNotify: status,
      weeklyReportNotify: status,
    }));
  };

  const tabs = [
    { id: 'account', label: 'Tài khoản', icon: Lock },
    { id: 'system', label: 'Hệ thống', icon: Globe },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
  ];

  return (
    <div className="p-3.5 sm:p-4 animate-fade-in">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Cài đặt hệ thống</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Quản lý cấu hình website và tài khoản Quản trị viên</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tab sidebar */}
        <div className="sm:w-44 flex-shrink-0">
          <nav className="card p-1.5 space-y-0.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === id ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {/* Account / Profile / Change Password */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              {/* Profile Update Section */}
              <div className="card p-4 sm:p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-600" /> Thông tin cá nhân
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Cập nhật thông tin hồ sơ của bạn</p>

                {/* Info Card Header */}
                <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5 sm:p-4 mb-5 flex items-center gap-3.5">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
                    {user?.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                      {user?.role || 'Admin'}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-3.5 max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="input-field py-1.5 px-3 text-xs sm:text-sm"
                        placeholder="Nhập họ và tên..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="input-field py-1.5 px-3 text-xs sm:text-sm"
                        placeholder="Nhập số điện thoại..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email đăng nhập (Không thể thay đổi)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input-field py-1.5 px-3 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-1">
                    <button type="submit" disabled={savingProfile} className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5">
                      {savingProfile ? <Loader2 className="w-3.5 h-3.5 spinner" /> : <Save className="w-3.5 h-3.5" />}
                      Lưu thông tin
                    </button>
                  </div>
                </form>
              </div>

              {/* Change Password Section */}
              <div className="card p-4 sm:p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary-600" /> Đổi mật khẩu
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>

                <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                      placeholder="Ít nhất 6 ký tự..."
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="pt-1">
                    <button type="submit" disabled={saving} className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5">
                      {saving ? <Loader2 className="w-3.5 h-3.5 spinner" /> : <Lock className="w-3.5 h-3.5" />}
                      Đổi mật khẩu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* System settings */}
          {activeTab === 'system' && (
            <div className="card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Cài đặt hệ thống</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cấu hình chung và thông số kỹ thuật cho website</p>
                </div>
                {loadingSettings && <Loader2 className="w-4 h-4 spinner text-primary-600" />}
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tên website</label>
                    <input
                      value={siteSettings.siteName || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                      placeholder="Ví dụ: ShopVN"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email liên hệ hệ thống</label>
                    <input
                      type="email"
                      value={siteSettings.siteEmail || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteEmail: e.target.value })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                      placeholder="admin@shopvn.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Đơn vị tiền tệ</label>
                    <select
                      value={siteSettings.currency || 'VND'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, currency: e.target.value })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                    >
                      <option value="VND">VND - Việt Nam Đồng</option>
                      <option value="USD">USD - US Dollar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Múi giờ</label>
                    <select
                      value={siteSettings.timezone || 'Asia/Ho_Chi_Minh'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, timezone: e.target.value })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                    >
                      <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
                      <option value="UTC">UTC (Giờ chuẩn quốc tế)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngưỡng cảnh báo tồn kho thấp (sản phẩm)
                    </label>
                    <input
                      type="number"
                      value={siteSettings.lowStockThreshold || 10}
                      onChange={(e) => setSiteSettings({ ...siteSettings, lowStockThreshold: Number(e.target.value) })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                      min={1}
                    />
                    <p className="text-[11px] text-gray-400 mt-0.5">Sản phẩm có số lượng tồn dưới hoặc bằng mức này sẽ được gắn thẻ "Sắp hết hàng" trong Kho.</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {[
                    { key: 'maintenanceMode', label: 'Chế độ bảo trì', desc: 'Tạm thời đóng website đối với khách hàng thông thường để bảo trì hệ thống', danger: true },
                    { key: 'allowRegistration', label: 'Cho phép đăng ký thành viên mới', desc: 'Khách hàng có thể tự do tạo tài khoản mới trên website' },
                    { key: 'orderConfirmEmail', label: 'Email xác nhận đơn hàng', desc: 'Tự động gửi email xác nhận chi tiết khi có đơn hàng đặt thành công' },
                  ].map(({ key, label, desc, danger }) => (
                    <label key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all">
                      <div>
                        <p className={`text-xs font-medium ${danger && siteSettings[key] ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-gray-100'}`}>{label}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={siteSettings[key]}
                        onClick={(e) => {
                          e.preventDefault();
                          setSiteSettings({ ...siteSettings, [key]: !siteSettings[key] });
                        }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                          siteSettings[key] ? (danger ? 'bg-red-500' : 'bg-primary-600') : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            siteSettings[key] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </label>
                  ))}
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={saving} className="btn-primary py-2 px-5 text-xs font-medium flex items-center gap-1.5 shadow-sm">
                    {saving ? <Loader2 className="w-3.5 h-3.5 spinner" /> : <Save className="w-3.5 h-3.5" />}
                    Lưu cài đặt hệ thống
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="card p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Cấu hình nhận thông báo</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tùy chỉnh các sự kiện quan trọng gửi cảnh báo đến Quản trị viên</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAllNotifications(true)}
                    className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                  >
                    Bật tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAllNotifications(false)}
                    className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                  >
                    Tắt tất cả
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-2.5 max-w-lg">
                {[
                  { key: 'newOrderNotify', label: 'Đơn hàng mới', desc: 'Nhận thông báo ngay lập tức khi có khách hàng tạo đơn hàng mới' },
                  { key: 'orderCancelNotify', label: 'Đơn hàng bị hủy', desc: 'Cảnh báo khi khách hàng hoặc nhân viên hủy một đơn hàng' },
                  { key: 'lowStockNotify', label: 'Cảnh báo tồn kho thấp', desc: 'Thông báo khi sản phẩm trong kho xuống dưới ngưỡng tối thiểu' },
                  { key: 'newUserNotify', label: 'Thành viên mới đăng ký', desc: 'Thông báo khi có người dùng mới tạo tài khoản thành công' },
                  { key: 'newReviewNotify', label: 'Đánh giá sản phẩm mới', desc: 'Nhận thông báo khi khách hàng gửi đánh giá hoặc bình luận mới' },
                  { key: 'weeklyReportNotify', label: 'Báo cáo tổng hợp hàng tuần', desc: 'Gửi email tổng kết doanh thu và hiệu suất hoạt động mỗi thứ Hai' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all">
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{label}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={siteSettings[key]}
                      onClick={(e) => {
                        e.preventDefault();
                        setSiteSettings({ ...siteSettings, [key]: !siteSettings[key] });
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                        siteSettings[key] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          siteSettings[key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                ))}

                <div className="pt-3">
                  <button type="submit" disabled={saving} className="btn-primary py-2 px-5 text-xs font-medium flex items-center gap-1.5 shadow-sm">
                    {saving ? <Loader2 className="w-3.5 h-3.5 spinner" /> : <Save className="w-3.5 h-3.5" />}
                    Lưu cài đặt thông báo
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="card p-4 sm:p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Bảo mật & Phân quyền hệ thống</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quản lý chính sách bảo mật, phiên đăng nhập và bảo vệ máy chủ</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5 max-w-lg">
                {/* Configurable Toggles */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tùy chọn bảo mật chủ động</h3>
                  
                  {[
                    { key: 'twoFactorAuth', label: 'Xác thực hai yếu tố (2FA)', desc: 'Yêu cầu mã xác thực qua Email/SMS khi đăng nhập vào trang Admin', danger: true },
                    { key: 'rateLimiting', label: 'Bảo vệ chống Brute-Force (Rate Limiting)', desc: 'Tự động khóa tạm thời IP nếu đăng nhập sai quá số lần quy định' },
                    { key: 'corsProtection', label: 'CORS Security Policy', desc: 'Chỉ chấp nhận các yêu cầu API từ tên miền hợp lệ đã được đăng ký' },
                  ].map(({ key, label, desc, danger }) => (
                    <label key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all">
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{label}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={siteSettings[key]}
                        onClick={(e) => {
                          e.preventDefault();
                          setSiteSettings({ ...siteSettings, [key]: !siteSettings[key] });
                        }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                          siteSettings[key] ? (danger ? 'bg-red-500' : 'bg-primary-600') : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            siteSettings[key] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </label>
                  ))}
                </div>

                {/* Numeric Configurations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thời hạn phiên đăng nhập (Token Expiry)
                    </label>
                    <select
                      value={siteSettings.sessionTimeoutDays || 7}
                      onChange={(e) => setSiteSettings({ ...siteSettings, sessionTimeoutDays: Number(e.target.value) })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                    >
                      <option value={1}>1 ngày (Bảo mật cao)</option>
                      <option value={3}>3 ngày</option>
                      <option value={7}>7 ngày (Mặc định)</option>
                      <option value={14}>14 ngày</option>
                      <option value={30}>30 ngày</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Giới hạn đăng nhập sai tối đa
                    </label>
                    <select
                      value={siteSettings.maxLoginAttempts || 5}
                      onChange={(e) => setSiteSettings({ ...siteSettings, maxLoginAttempts: Number(e.target.value) })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                    >
                      <option value={3}>3 lần thử</option>
                      <option value={5}>5 lần thử (Mặc định)</option>
                      <option value={10}>10 lần thử</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1">
                  <button type="submit" disabled={saving} className="btn-primary py-2 px-5 text-xs font-medium flex items-center gap-1.5 shadow-sm">
                    {saving ? <Loader2 className="w-3.5 h-3.5 spinner" /> : <Save className="w-3.5 h-3.5" />}
                    Lưu cấu hình bảo mật
                  </button>
                </div>

                {/* System Read-only Indicators */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Trạng thái bảo vệ máy chủ (System Status)</h3>
                  
                  {[
                    { label: 'Mã hóa mật khẩu', desc: 'Bcrypt với 12 salt rounds', status: 'Đang hoạt động', ok: true },
                    { label: 'Cấu hình SSL / HTTPS', desc: 'Kết nối được mã hóa bằng TLS 1.3', status: 'Đang hoạt động', ok: true },
                    { label: 'JWT Authentication', desc: 'Chuẩn xác thực không lưu trạng thái (Stateless)', status: 'Đang hoạt động', ok: true },
                  ].map(({ label, desc, status, ok }) => (
                    <div key={label} className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-100/60 dark:border-gray-800/60">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ok ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <div>
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{label}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                        </div>
                      </div>
                      <span className={`badge text-[10px] py-0.5 px-2 font-medium ${ok ? 'badge-success' : 'badge-warning'}`}>{status}</span>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

