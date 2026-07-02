import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, settingAPI } from '../../services/api';
import { Save, Lock, Globe, Bell, Shield, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);

  // Change password
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // System settings (static display — backend config would handle real values)
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'ShopVN',
    siteEmail: 'admin@shopvn.com',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    maintenanceMode: false,
    allowRegistration: true,
    orderConfirmEmail: true,
    lowStockThreshold: 10,
  });

  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingAPI.get();
      if (res.data) {
        setSiteSettings(res.data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải cài đặt hệ thống');
    } finally {
      setLoadingSettings(false);
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
      toast.success('Đổi mật khẩu thành công');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingAPI.update(siteSettings);
      toast.success('Lưu cài đặt hệ thống thành công');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
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
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Quản lý cấu hình website và tài khoản Admin</p>
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
                  activeTab === id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === id ? 'text-primary-600' : 'text-gray-400'}`} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {/* Account / Change Password */}
          {activeTab === 'account' && (
            <div className="card p-4 sm:p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Thông tin tài khoản</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Thông tin cơ bản của quản trị viên</p>

              {/* Info */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3.5 sm:p-4 mb-4 flex items-center gap-3.5">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <span className="badge bg-purple-100 text-purple-700 mt-1">Admin</span>
                </div>
              </div>

              {/* Change password */}
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Đổi mật khẩu
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 spinner" /> : <Save className="w-4 h-4" />}
                  Đổi mật khẩu
                </button>
              </form>
            </div>
          )}

          {/* System settings */}
          {activeTab === 'system' && (
            <div className="card p-4 sm:p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Cài đặt hệ thống</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Cấu hình chung cho website</p>
              <form onSubmit={handleSaveSettings} className="space-y-3.5 max-w-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tên website</label>
                    <input
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email liên hệ</label>
                    <input
                      type="email"
                      value={siteSettings.siteEmail}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteEmail: e.target.value })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Đơn vị tiền tệ</label>
                    <select
                      value={siteSettings.currency}
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
                      value={siteSettings.timezone}
                      onChange={(e) => setSiteSettings({ ...siteSettings, timezone: e.target.value })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                    >
                      <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ngưỡng tồn kho thấp</label>
                    <input
                      type="number"
                      value={siteSettings.lowStockThreshold}
                      onChange={(e) => setSiteSettings({ ...siteSettings, lowStockThreshold: Number(e.target.value) })}
                      className="input-field py-1.5 px-3 text-xs sm:text-sm"
                      min={1}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {[
                    { key: 'maintenanceMode', label: 'Chế độ bảo trì', desc: 'Tạm thời đóng website để bảo trì', danger: true },
                    { key: 'allowRegistration', label: 'Cho phép đăng ký', desc: 'Khách hàng có thể tự đăng ký tài khoản' },
                    { key: 'orderConfirmEmail', label: 'Email xác nhận đơn', desc: 'Gửi email xác nhận khi có đơn hàng mới' },
                  ].map(({ key, label, desc, danger }) => (
                    <label key={key} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div>
                        <p className={`text-xs font-medium ${danger ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>{label}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                      </div>
                      <div
                        onClick={() => setSiteSettings({ ...siteSettings, [key]: !siteSettings[key] })}
                        className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${siteSettings[key] ? (danger ? 'bg-red-500' : 'bg-primary-600') : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white dark:bg-gray-800 rounded-full shadow transition-transform ${siteSettings[key] ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                  ))}
                </div>

                <button type="submit" disabled={saving} className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5">
                  {saving ? <Loader2 className="w-3.5 h-3.5 spinner" /> : <Save className="w-3.5 h-3.5" />}
                  Lưu cài đặt
                </button>
              </form>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="card p-4 sm:p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Cài đặt thông báo</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Chọn loại thông báo bạn muốn nhận</p>
              <div className="space-y-2 max-w-lg">
                {[
                  { label: 'Đơn hàng mới', desc: 'Nhận thông báo khi có đơn hàng mới được tạo' },
                  { label: 'Đơn hàng bị hủy', desc: 'Nhận thông báo khi khách hàng hủy đơn' },
                  { label: 'Tồn kho thấp', desc: 'Cảnh báo khi sản phẩm sắp hết hàng' },
                  { label: 'Người dùng mới', desc: 'Thông báo khi có tài khoản mới đăng ký' },
                  { label: 'Đánh giá mới', desc: 'Nhận thông báo khi có đánh giá sản phẩm mới' },
                  { label: 'Báo cáo hàng tuần', desc: 'Nhận báo cáo tổng kết mỗi tuần qua email' },
                ].map(({ label, desc }, i) => (
                  <label key={i} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{label}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <div className="w-4.5 h-4.5 rounded bg-primary-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </label>
                ))}
              </div>
              <button className="btn-primary mt-4 py-1.5 px-4 text-xs flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> Lưu cài đặt
              </button>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="card p-4 sm:p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Bảo mật hệ thống</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Thông tin và cài đặt bảo mật</p>
              <div className="space-y-2 max-w-lg">
                {[
                  { label: 'Xác thực hai yếu tố (2FA)', desc: 'Thêm lớp bảo mật cho tài khoản admin', status: 'Chưa bật', danger: true },
                  { label: 'Phiên đăng nhập', desc: 'JWT Token — hết hạn sau 7 ngày', status: 'Đang hoạt động', ok: true },
                  { label: 'Mã hóa mật khẩu', desc: 'bcrypt với 12 salt rounds', status: 'Đang hoạt động', ok: true },
                  { label: 'CORS Protection', desc: 'Chỉ cho phép domain localhost:5173', status: 'Đang hoạt động', ok: true },
                  { label: 'Rate Limiting', desc: 'Giới hạn số request từ mỗi IP', status: 'Chưa cấu hình', warn: true },
                  { label: 'HTTPS', desc: 'Mã hóa kết nối SSL/TLS', status: 'Development mode', warn: true },
                ].map(({ label, desc, status, ok, warn, danger }) => (
                  <div key={label} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ok ? 'bg-emerald-500' : warn ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{label}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                      </div>
                    </div>
                    <span className={`badge text-[10px] py-0.5 px-2 ${ok ? 'badge-success' : warn ? 'badge-warning' : 'badge-danger'}`}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
