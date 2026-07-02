import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Eye, EyeOff, Package, Loader2, ArrowRight, Sun, Moon, Sparkles } from 'lucide-react';
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
      toast.success(`Chào mừng, ${user.name}!`);
      if (!user.phone) {
        navigate('/profile', { replace: true });
      } else {
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
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden relative">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme} 
        className="absolute top-5 right-5 z-50 p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-md border border-slate-200/60 dark:border-slate-700/60"
        title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
      </button>

      {/* Left Side - Typography & Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 lg:px-24 bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-950 relative overflow-hidden text-white border-r border-slate-800/80">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-accent-500/15 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-lg space-y-6">
          <Link to="/" className="inline-flex items-center gap-3.5 bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/15 transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-accent-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight font-display">Shop<span className="text-accent-400">VN</span></span>
          </Link>
          
          <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight font-display">
            Hệ sinh thái <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 via-white to-primary-200">công nghệ đỉnh cao</span>
          </h1>
          
          <p className="text-base text-slate-300 leading-relaxed font-medium">
            Truy cập tài khoản của bạn để khám phá hàng ngàn ưu đãi hấp dẫn, theo dõi đơn hàng thời gian thực và trải nghiệm mua sắm thông minh.
          </p>

          <div className="flex items-center gap-4 text-sm font-semibold bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-fit shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
              <Sparkles size={18} />
            </div>
            <p className="text-slate-200">Bảo mật tuyệt đối chuẩn <span className="font-extrabold text-white">OAuth 2.0 & JWT</span></p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 bg-white dark:bg-slate-950 h-full overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto py-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex mb-8 justify-center">
            <Link to="/" className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-display">Shop<span className="text-primary-600">VN</span></span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight font-display">Chào mừng trở lại</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Đăng nhập tài khoản của bạn để tiếp tục</p>
          </div>

          {/* Google Login */}
          <div className="mb-5">
            <div className="transform hover:scale-[1.01] transition-all duration-200 w-full flex justify-start shadow-sm rounded-xl overflow-hidden">
               <GoogleLogin
                 onSuccess={handleGoogleSuccess}
                 onError={() => toast.error('Đăng nhập Google thất bại')}
                 width="100%"
               />
            </div>
          </div>

          <div className="flex items-center mb-5">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
            <span className="px-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Hoặc bằng Email</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Email</label>
              <input
                id="email"
                type="email"
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all outline-none placeholder:text-slate-400 text-sm font-medium shadow-sm"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                 <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Mật khẩu</label>
                 <Link to="#" className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors">Quên mật khẩu?</Link>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all outline-none pr-14 placeholder:text-slate-400 text-sm font-medium shadow-sm"
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
              className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/45 transition-all flex items-center justify-center gap-2.5 group disabled:opacity-70 disabled:cursor-not-allowed mt-3 text-sm active:scale-[0.99]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 mt-6 text-sm font-medium">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-extrabold hover:underline transition-colors">
              Đăng ký ngay
            </Link>
          </p>

          {/* Minimalist Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3.5 text-center">Đăng nhập nhanh (Demo tài khoản)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  className="text-xs font-bold py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-primary-50 dark:bg-slate-900 dark:hover:bg-primary-900/30 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-300 border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/40 transition-all text-center"
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
