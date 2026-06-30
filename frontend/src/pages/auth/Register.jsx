import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Package, Loader2, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      toast.success('🎉 Đăng ký thành công! Tặng bạn mã voucher WELCOME10 giảm ngay 10%!', { duration: 5000 });
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Shop<span className="text-primary-600">VN</span></span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Tạo tài khoản mới</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tham gia cùng hàng triệu khách hàng</p>
          </div>

          <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 text-center flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-amber-500 animate-bounce flex-shrink-0" />
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Tặng ngay mã voucher <span className="font-mono bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200">WELCOME10</span> khi tạo tài khoản!</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
              <input id="name" type="text" className="input-field" placeholder="Nguyễn Văn A"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input id="email" type="email" className="input-field" placeholder="your@email.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Số điện thoại</label>
              <input id="phone" type="tel" className="input-field" placeholder="0901234567"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="Ít nhất 6 ký tự"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
              <input id="confirm-password" type="password" className="input-field" placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            </div>

            <button id="register-btn" type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? <Loader2 className="w-4 h-4 spinner" /> : null}
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
