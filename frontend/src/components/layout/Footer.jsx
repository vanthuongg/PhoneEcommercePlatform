import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, HeadphonesIcon, RefreshCw, Facebook, Instagram, Youtube, Phone, Mail, MapPin, Smartphone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-10 pb-10 transition-colors mt-8 border-t border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden">
      {/* Subtle brand ambient glow in dark mode */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Banner tiện ích 4 cột */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pb-10 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-4 group p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-primary-500/40 dark:hover:border-primary-500/40 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Giao hàng siêu tốc</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Miễn phí cho đơn từ 300k</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Bảo hành chính hãng</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cam kết 100% hàng thật</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-accent-500/40 dark:hover:border-accent-500/40 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
              <RefreshCw size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">Đổi trả 30 ngày</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hoàn tiền nếu lỗi NSX</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-purple-500/40 dark:hover:border-purple-500/40 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
              <HeadphonesIcon size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Hỗ trợ 24/7</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hotline tư vấn miễn phí</p>
            </div>
          </div>
        </div>

        {/* Nội dung chính Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-10 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
                <Smartphone className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
                TechPhone<span className="text-primary-600 dark:text-primary-500">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Hệ thống bán lẻ điện thoại thông minh, máy tính bảng và phụ kiện công nghệ cao cấp chính hãng hàng đầu Việt Nam.
            </p>
            <div className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300 pt-1 font-medium">
              <div className="flex items-center gap-3"><MapPin size={16} className="text-primary-600 dark:text-primary-400 shrink-0" /> Tòa nhà Landmark 81, Vinhomes Central Park, TP. HCM</div>
              <div className="flex items-center gap-3"><Phone size={16} className="text-primary-600 dark:text-primary-400 shrink-0" /> 1800 6688 (Miễn phí từ 8h - 22h)</div>
              <div className="flex items-center gap-3"><Mail size={16} className="text-primary-600 dark:text-primary-400 shrink-0" /> support@techphone.vn</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase text-slate-900 dark:text-white mb-4 tracking-widest font-display">Về TechPhone</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block font-medium">Giới thiệu công ty</Link></li>
              <li><Link to="/careers" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block font-medium">Tuyển dụng</Link></li>
              <li><Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block font-medium">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block font-medium">Chính sách bảo mật</Link></li>
              <li><Link to="/blog" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block font-medium">Tin tức công nghệ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase text-slate-900 dark:text-white mb-4 tracking-widest font-display">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block font-medium">Trung tâm trợ giúp FAQ</Link></li>
              <li><Link to="/profile?tab=orders" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block font-medium">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/shipping" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block font-medium">Phương thức vận chuyển</Link></li>
              <li><Link to="/returns" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block font-medium">Chính sách đổi trả</Link></li>
              <li><Link to="/warranty" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block font-medium">Chính sách bảo hành</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase text-slate-900 dark:text-white mb-4 tracking-widest font-display">Thanh toán & Kết nối</h4>
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg font-bold text-[10px] text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800">VNPay</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg font-bold text-[10px] text-pink-600 dark:text-pink-400 border border-slate-200 dark:border-slate-800">MoMo</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg font-bold text-[10px] text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800">COD</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg font-bold text-[10px] text-primary-600 dark:text-primary-400 border border-slate-200 dark:border-slate-800">Visa/MC</span>
            </div>
            <h4 className="font-bold text-xs uppercase text-slate-900 dark:text-white mb-3 tracking-widest font-display">Mạng xã hội</h4>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-xs"><Facebook size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-pink-600 dark:text-pink-400 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 dark:hover:text-white transition-all shadow-xs"><Instagram size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-xs"><Youtube size={16} /></a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© 2026 TechPhone Store. All rights reserved.</p>
          <div className="flex space-x-6">
            <span>Quốc gia & Khu vực: Việt Nam</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">Phiên bản Enterprise v3.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
