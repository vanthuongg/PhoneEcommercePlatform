import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, HeadphonesIcon, RefreshCw, Facebook, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50 pt-12 pb-8 transition-colors mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner tiện ích 4 cột */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Giao hàng siêu tốc</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Miễn phí cho đơn từ 300k</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Bảo hành chính hãng</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cam kết 100% hàng thật</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Đổi trả 30 ngày</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hoàn tiền nếu không hài lòng</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <HeadphonesIcon size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Hỗ trợ 24/7</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hotline tư vấn miễn phí</p>
            </div>
          </div>
        </div>

        {/* Nội dung chính Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-10 border-b border-slate-100 dark:border-slate-800/50">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black text-lg">
                T
              </div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">TechPhone</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Hệ thống sàn thương mại điện tử uy tín chất lượng hàng đầu Việt Nam. Mua sắm an toàn, tiện lợi với hàng triệu sản phẩm chính hãng cùng ngập tràn ưu đãi mỗi ngày.
            </p>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5"><MapPin size={16} className="text-primary-600 shrink-0" /> Tòa nhà Landmark 81, Vinhomes Central Park, TP. HCM</div>
              <div className="flex items-center gap-2.5"><Phone size={16} className="text-primary-600 shrink-0" /> 1900 6868 (Miễn phí từ 8h - 22h)</div>
              <div className="flex items-center gap-2.5"><Mail size={16} className="text-primary-600 shrink-0" /> support@techphone.vn</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase text-slate-900 dark:text-white mb-4 tracking-wider">Về TechPhone</h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/about" className="hover:text-primary-600 transition-colors">Giới thiệu công ty</Link></li>
              <li><Link to="/careers" className="hover:text-primary-600 transition-colors">Tuyển dụng</Link></li>
              <li><Link to="/terms" className="hover:text-primary-600 transition-colors">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-600 transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/blog" className="hover:text-primary-600 transition-colors">Tin tức thị trường</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase text-slate-900 dark:text-white mb-4 tracking-wider">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/faq" className="hover:text-primary-600 transition-colors">Trung tâm trợ giúp FAQ</Link></li>
              <li><Link to="/profile?tab=orders" className="hover:text-primary-600 transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/shipping" className="hover:text-primary-600 transition-colors">Phương thức vận chuyển</Link></li>
              <li><Link to="/returns" className="hover:text-primary-600 transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="/warranty" className="hover:text-primary-600 transition-colors">Chính sách bảo hành</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase text-slate-900 dark:text-white mb-4 tracking-wider">Thanh toán & Kết nối</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-xs text-blue-600">VNPay</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-xs text-pink-600">MoMo</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-xs text-emerald-600">COD</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-xs text-indigo-600">Stripe</span>
            </div>
            <h4 className="font-bold text-sm uppercase text-slate-900 dark:text-white mb-3 tracking-wider">Mạng xã hội</h4>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"><Facebook size={18} /></a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-pink-600 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-pink-600 hover:text-white transition-all"><Instagram size={18} /></a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors"><Youtube size={18} /></a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 TechPhone. All rights reserved.</p>
          <div className="flex space-x-6">
            <span>Quốc gia & Khu vực: Việt Nam</span>
            <span>Phiên bản Enterprise v3.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
