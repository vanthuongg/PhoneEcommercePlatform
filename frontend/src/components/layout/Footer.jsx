import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, HeadphonesIcon, RefreshCw, Facebook, Instagram, Youtube, Phone, Mail, MapPin, Send, Smartphone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 pt-16 pb-12 transition-colors mt-20 border-t border-slate-800/80 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Newsletter / Action Banner */}
        <div className="bg-gradient-to-r from-primary-900/60 via-indigo-900/60 to-slate-900/80 border border-primary-500/30 rounded-3xl p-6 sm:p-8 mb-14 shadow-premium flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
          <div className="space-y-2 max-w-lg">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-extrabold uppercase tracking-wider border border-primary-500/30">
              🎁 Nhận mã ưu đãi 100K
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Đăng ký nhận thông tin khuyến mãi & ra mắt công nghệ mới
            </h3>
            <p className="text-sm text-slate-300">
              Cập nhật sớm nhất giá iPhone, Samsung cùng deal chớp nhoáng hàng tuần.
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="px-5 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-primary-500 min-w-[280px] shadow-inner"
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-extrabold text-sm transition-all shadow-glow hover:scale-105 flex items-center justify-center gap-2 shrink-0"
            >
              <span>Đăng Ký Ngay</span>
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Banner tiện ích 4 cột */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4 group p-4 rounded-2xl bg-slate-800/40 border border-slate-800/60 hover:border-primary-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/20 text-primary-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Giao hàng siêu tốc</h4>
              <p className="text-xs text-slate-400">Miễn phí cho đơn từ 300k</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group p-4 rounded-2xl bg-slate-800/40 border border-slate-800/60 hover:border-emerald-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Bảo hành chính hãng</h4>
              <p className="text-xs text-slate-400">Cam kết 100% hàng thật</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group p-4 rounded-2xl bg-slate-800/40 border border-slate-800/60 hover:border-amber-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Đổi trả 30 ngày</h4>
              <p className="text-xs text-slate-400">Hoàn tiền nếu lỗi NSX</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group p-4 rounded-2xl bg-slate-800/40 border border-slate-800/60 hover:border-purple-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <HeadphonesIcon size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Hỗ trợ 24/7</h4>
              <p className="text-xs text-slate-400">Hotline tư vấn miễn phí</p>
            </div>
          </div>
        </div>

        {/* Nội dung chính Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12 border-b border-slate-800">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/30">
                <Smartphone className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-extrabold text-white font-display tracking-tight">TechPhone<span className="text-primary-500">.</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Hệ thống bán lẻ điện thoại thông minh, máy tính bảng và phụ kiện công nghệ cao cấp chính hãng hàng đầu Việt Nam.
            </p>
            <div className="space-y-2.5 text-sm text-slate-300 pt-1">
              <div className="flex items-center gap-3"><MapPin size={16} className="text-primary-400 shrink-0" /> Tòa nhà Landmark 81, Vinhomes Central Park, TP. HCM</div>
              <div className="flex items-center gap-3"><Phone size={16} className="text-primary-400 shrink-0" /> 1800 6688 (Miễn phí từ 8h - 22h)</div>
              <div className="flex items-center gap-3"><Mail size={16} className="text-primary-400 shrink-0" /> support@techphone.vn</div>
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase text-white mb-5 tracking-wider">Về TechPhone</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">Giới thiệu công ty</Link></li>
              <li><Link to="/careers" className="hover:text-primary-400 transition-colors">Tuyển dụng</Link></li>
              <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/blog" className="hover:text-primary-400 transition-colors">Tin tức công nghệ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase text-white mb-5 tracking-wider">Hỗ trợ khách hàng</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/faq" className="hover:text-primary-400 transition-colors">Trung tâm trợ giúp FAQ</Link></li>
              <li><Link to="/profile?tab=orders" className="hover:text-primary-400 transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/shipping" className="hover:text-primary-400 transition-colors">Phương thức vận chuyển</Link></li>
              <li><Link to="/returns" className="hover:text-primary-400 transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="/warranty" className="hover:text-primary-400 transition-colors">Chính sách bảo hành</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase text-white mb-5 tracking-wider">Thanh toán & Kết nối</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1.5 bg-slate-800/80 rounded-xl font-extrabold text-xs text-blue-400 border border-slate-700">VNPay</span>
              <span className="px-3 py-1.5 bg-slate-800/80 rounded-xl font-extrabold text-xs text-pink-400 border border-slate-700">MoMo</span>
              <span className="px-3 py-1.5 bg-slate-800/80 rounded-xl font-extrabold text-xs text-emerald-400 border border-slate-700">COD</span>
              <span className="px-3 py-1.5 bg-slate-800/80 rounded-xl font-extrabold text-xs text-indigo-400 border border-slate-700">Visa/MC</span>
            </div>
            <h4 className="font-extrabold text-sm uppercase text-white mb-3 tracking-wider">Mạng xã hội</h4>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-pink-400 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-pink-600 hover:text-white transition-all"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition-all"><Youtube size={18} /></a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 TechPhone Store. All rights reserved. Designed with UI/UX Pro Max.</p>
          <div className="flex space-x-6">
            <span>Quốc gia & Khu vực: Việt Nam</span>
            <span className="text-primary-400 font-semibold">Phiên bản Enterprise v3.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
