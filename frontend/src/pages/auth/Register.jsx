import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Eye, EyeOff, Package, Loader2, ArrowRight, Gift, Sun, Moon, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      <div className="hidden lg:flex w-[45%] flex-col justify-center px-16 lg:px-24 bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 relative overflow-hidden text-white">
        {/* Subtle CSS-only decorations */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-3 mb-10 bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
            <Package className="w-8 h-8" />
            <span className="text-3xl font-extrabold tracking-tight">Shop<span className="text-amber-200">VN</span></span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.15] tracking-tight">
            Mở rộng <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-white">Kinh doanh ngay</span>
          </h1>
          
          <p className="text-lg text-amber-50/90 leading-relaxed font-medium mb-12">
            Đăng ký để trải nghiệm hệ sinh thái quản lý toàn diện, giúp bạn tập trung vào việc bán hàng hiệu quả hơn.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-sm font-medium bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 w-fit">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-700 font-bold shadow-md">
                <Rocket className="w-5 h-5" />
              </div>
              <p className="text-amber-50">Thiết lập <span className="font-bold text-white">nhanh chóng</span> trong 5 phút</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Seamless Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 bg-white dark:bg-slate-950 h-full overflow-hidden">
        <div className="w-full max-w-[480px] mx-auto my-auto">
          
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
          <div className="mb-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Tạo tài khoản</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Đăng ký để trải nghiệm dịch vụ</p>
          </div>

          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-center flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-amber-500 animate-bounce flex-shrink-0" />
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Tặng mã <span className="font-mono bg-amber-200 dark:bg-amber-950/50 px-2 py-0.5 rounded text-amber-900 dark:text-amber-200">WELCOME10</span> khi hoàn tất!</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 outline-none placeholder:text-slate-400 text-sm shadow-sm"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Số điện thoại</label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 outline-none placeholder:text-slate-400 text-sm shadow-sm"
                  placeholder="0901234567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email <span className="text-red-500">*</span></label>
              <input
                id="email"
                type="email"
                className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 outline-none placeholder:text-slate-400 text-sm shadow-sm"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Mật khẩu <span className="text-red-500">*</span></label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 outline-none pr-14 placeholder:text-slate-400 text-sm shadow-sm"
                  placeholder="Ít nhất 6 ký tự"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
              <input
                id="confirm-password"
                type="password"
                className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 outline-none placeholder:text-slate-400 text-sm shadow-sm"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            <button
              id="register-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all duration-300 flex items-center justify-center gap-2 mt-4 group disabled:opacity-70 disabled:cursor-not-allowed text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
              {!loading && <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />}
            </button>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 mt-6 text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline transition-colors">
              Đăng nhập ngay
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;
