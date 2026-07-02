import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Eye, EyeOff, Package, Loader2, ArrowRight, Gift, Sun, Moon, Rocket, Sparkles } from 'lucide-react';
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
      <div className="hidden lg:flex w-[45%] flex-col justify-center px-16 lg:px-24 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 relative overflow-hidden text-white border-r border-slate-800/80">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-black/15 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-lg space-y-6">
          <Link to="/" className="inline-flex items-center gap-3.5 bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/15 transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-3xl font-black tracking-tight font-display">Shop<span className="text-amber-200">VN</span></span>
          </Link>
          
          <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight font-display">
            Khởi đầu <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-orange-200">hành trình mới</span>
          </h1>
          
          <p className="text-base text-amber-50/90 leading-relaxed font-medium">
            Tạo tài khoản ngay hôm nay để nhận đặc quyền thành viên VIP, miễn phí vận chuyển cho đơn hàng đầu tiên và tích lũy điểm thưởng trọn đời.
          </p>

          <div className="flex items-center gap-4 text-sm font-semibold bg-black/15 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-fit shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-amber-600 font-black shadow-md">
              <Rocket className="w-5 h-5" />
            </div>
            <p className="text-amber-50">Thiết lập tài khoản <span className="font-extrabold text-white">siêu tốc chỉ 1 phút</span></p>
          </div>
        </div>
      </div>

      {/* Right Side - Seamless Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 bg-white dark:bg-slate-950 h-full overflow-y-auto">
        <div className="w-full max-w-[480px] mx-auto my-auto py-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex mb-6 justify-center">
            <Link to="/" className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-display">Shop<span className="text-amber-600">VN</span></span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight font-display">Tạo tài khoản mới</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Hoàn tất thông tin bên dưới để đăng ký thành viên</p>
          </div>

          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/40 text-center flex items-center justify-center gap-2.5 shadow-sm">
            <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-bounce shrink-0" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Tặng ngay voucher <span className="font-mono font-black bg-amber-200 dark:bg-amber-900/80 px-2 py-0.5 rounded-lg text-amber-950 dark:text-white">WELCOME10</span> khi hoàn tất!</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all outline-none placeholder:text-slate-400 text-sm font-medium shadow-sm"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Số điện thoại</label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all outline-none placeholder:text-slate-400 text-sm font-medium shadow-sm"
                  placeholder="0901234567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Email <span className="text-red-500">*</span></label>
              <input
                id="email"
                type="email"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all outline-none placeholder:text-slate-400 text-sm font-medium shadow-sm"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Mật khẩu <span className="text-red-500">*</span></label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all outline-none pr-14 placeholder:text-slate-400 text-sm font-medium shadow-sm"
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
              <input
                id="confirm-password"
                type="password"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all outline-none placeholder:text-slate-400 text-sm font-medium shadow-sm"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            <button
              id="register-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/45 transition-all flex items-center justify-center gap-2.5 mt-4 group disabled:opacity-70 disabled:cursor-not-allowed text-sm active:scale-[0.99]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Đang tạo hồ sơ...' : 'Đăng ký tài khoản'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 mt-6 text-sm font-medium">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-amber-600 dark:text-amber-400 font-extrabold hover:underline transition-colors">
              Đăng nhập ngay
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;
