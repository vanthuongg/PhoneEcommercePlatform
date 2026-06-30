import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Package, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const getRoleHome = (role) => {
    const homes = { admin: '/admin', manager: '/manager', staff: '/staff', customer: '/' };
    return homes[role] || '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Chào mừng, ${user.name}!`);
      navigate(from || getRoleHome(user.role), { replace: true });
    } catch (err) {
      toast.error(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      toast.success(`Chào mừng, ${user.name}!`);
      navigate(from || getRoleHome(user.role), { replace: true });
    } catch (err) {
      toast.error(err.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const accounts = {
      admin: { email: 'admin@shop.com', password: 'admin123' },
      manager: { email: 'manager@shop.com', password: 'manager123' },
      staff: { email: 'staff@shop.com', password: 'staff123' },
      customer: { email: 'customer@shop.com', password: 'customer123' },
    };
    setForm(accounts[role]);
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Shop<span className="text-primary-600">VN</span></span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Đăng nhập tài khoản</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chào mừng bạn trở lại!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? <Loader2 className="w-4 h-4 spinner" /> : null}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <span className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></span>
            <span className="px-3 text-sm text-gray-500 dark:text-gray-400">hoặc đăng nhập bằng</span>
            <span className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></span>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Đăng nhập Google thất bại')}
            />
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Tài khoản demo</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
                { role: 'manager', label: 'Manager', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
                { role: 'staff', label: 'Staff', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                { role: 'customer', label: 'Customer', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
              ].map(({ role, label, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className={`text-xs font-medium py-2 px-3 rounded-lg transition-colors ${color}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
