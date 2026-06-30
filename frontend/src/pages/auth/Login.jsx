import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Eye, EyeOff, Package, Loader2, ArrowRight, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      
      // Nếu user đăng nhập bằng Google nhưng chưa có số điện thoại
      if (!user.phone) {
        toast.success(`Chào mừng, ${user.name}! Vui lòng cập nhật thông tin số điện thoại để hoàn tất hồ sơ.`, { duration: 5000 });
        navigate('/profile', { replace: true });
      } else {
        toast.success(`Chào mừng, ${user.name}!`);
        navigate(from || getRoleHome(user.role), { replace: true });
      }
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
    <div className="flex h-screen w-full bg-white dark:bg-slate-950 font-sans overflow-hidden relative">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme} 
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
        title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Left Side - Typography & Branding (No Images) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 lg:px-24 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 relative overflow-hidden text-white">
        {/* Subtle CSS-only decorations */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-3 mb-10 bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
            <Package className="w-8 h-8" />
            <span className="text-3xl font-extrabold tracking-tight">Shop<span className="text-primary-200">VN</span></span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.15] tracking-tight">
            Quản trị <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-100 to-white">thông minh</span>
          </h1>
          
          <p className="text-lg text-primary-50/90 leading-relaxed font-medium mb-12">
            Giải pháp quản lý bán hàng toàn diện, tối ưu quy trình và thúc đẩy doanh thu một cách mạnh mẽ.
          </p>

          <div className="flex items-center gap-4 text-sm font-medium bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 w-fit">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-700 font-bold text-xs shadow-md">
              +10k
            </div>
            <p className="text-primary-50">Hơn <span className="font-bold text-white">10,000+</span> cửa hàng tin dùng</p>
          </div>
        </div>
      </div>

      {/* Right Side - Seamless Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 bg-white dark:bg-slate-950 h-full overflow-hidden">
        <div className="w-full max-w-md mx-auto my-auto">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex mb-6">
            <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Shop<span className="text-primary-600">VN</span></span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Đăng nhập</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nhập thông tin tài khoản để truy cập hệ thống</p>
          </div>

          {/* Google Login */}
          <div className="mb-4">
            <div className="transform hover:-translate-y-0.5 transition-all duration-300 w-full flex justify-start">
               <GoogleLogin
                 onSuccess={handleGoogleSuccess}
                 onError={() => toast.error('Đăng nhập Google thất bại')}
                 width="100%"
               />
            </div>
          </div>

          <div className="flex items-center mb-4">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
            <span className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Hoặc bằng Email</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
              <input
                id="email"
                type="email"
                className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 outline-none placeholder:text-slate-400 text-base shadow-sm"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                 <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mật khẩu</label>
                 <Link to="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors">Quên mật khẩu?</Link>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 outline-none pr-14 placeholder:text-slate-400 text-base shadow-sm"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4 text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              {!loading && <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />}
            </button>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 mt-6 text-sm">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline transition-colors">
              Đăng ký ngay
            </Link>
          </p>

          {/* Minimalist Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Truy cập nhanh Demo</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                { role: 'admin', label: 'Admin' },
                { role: 'manager', label: 'Quản lý' },
                { role: 'staff', label: 'Nhân viên' },
                { role: 'customer', label: 'Khách hàng' },
              ].map(({ role, label }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="text-sm font-semibold py-2 px-4 rounded-full bg-slate-50 hover:bg-primary-50 dark:bg-slate-900 dark:hover:bg-primary-900/20 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200"
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

