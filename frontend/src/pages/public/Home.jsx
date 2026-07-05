import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, bannerAPI, categoryAPI, voucherAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCompare } from '../../contexts/CompareContext';
import ProductCard from '../../components/product/ProductCard';
import {
  ArrowRight, Star, Truck, RefreshCw, ChevronLeft, ChevronRight,
  Sparkles, Zap, Flame, Headphones, ShieldCheck, Award,
  Smartphone, Watch, BatteryCharging, Shield, Tablet, ArrowRightLeft, Gift, Scale, Check,
  Mail, Send, Bell, Tag, Copy, Percent, Clock, CheckCircle2, ShoppingBag, Store
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─────────── helpers ─────────── */
const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

/* ─────────── FlashSaleCard ─────────── */
const FlashSaleCard = ({ product }) => {
  const price = product.salePrice > 0 ? product.salePrice : product.price;
  const oldPrice = product.oldPrice > 0 ? product.oldPrice : (product.salePrice > 0 ? product.price : 0);
  const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  // Stable progress calculation based on product ID
  const idHash = (product._id || product.id || '123').toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const sold = product.sold || (idHash % 45) + 12;
  const stock = product.stock || (idHash % 15) + 5;
  const total = sold + stock;
  const percent = Math.min(100, Math.round((sold / total) * 100));
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const isCompared = isInCompare(product._id || product.id);

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product._id || product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <Link
      to={`/product/${product._id || product.id}`}
      className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-500/40 dark:hover:border-primary-500/40"
    >
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {discountPercent > 0 && (
          <span className="bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
            <Zap size={11} className="fill-white animate-pulse" /> -{discountPercent}%
          </span>
        )}
      </div>

      {/* Compare button */}
      <button
        type="button"
        onClick={handleToggleCompare}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
          isCompared
            ? 'bg-primary-600 text-white scale-105 shadow-md'
            : 'bg-white/90 dark:bg-slate-850/90 backdrop-blur-md text-slate-400 hover:text-primary-600 shadow-sm border border-slate-200/40 dark:border-slate-800/40 opacity-0 group-hover:opacity-100'
        }`}
        title={isCompared ? "Bỏ so sánh" : "Thêm vào so sánh"}
      >
        {isCompared ? <Check size={15} className="stroke-[3]" /> : <Scale size={15} />}
      </button>

      <div className="relative aspect-square p-5 bg-gradient-to-b from-slate-50/80 to-slate-100/30 dark:from-slate-900/80 dark:to-slate-850/30 flex items-center justify-center border-b border-slate-200/40 dark:border-slate-800/40 overflow-hidden">
        <div className="absolute inset-0 bg-radial from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400?text=Phone'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md relative z-10"
        />
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-white dark:bg-slate-900">
        <div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-mono font-bold text-base sm:text-lg text-red-600 dark:text-red-500 leading-none">{formatPrice(price)}</span>
            {oldPrice > price && <span className="text-[11px] font-mono text-slate-400 line-through">{formatPrice(oldPrice)}</span>}
          </div>
          {/* Progress bar */}
          <div className="relative w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center border border-slate-200/50 dark:border-slate-700/50">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
            <span className="relative z-10 text-[9px] font-bold text-white px-2 w-full text-center tracking-wider drop-shadow-xs">
              {percent >= 90 ? '🔥 SẮP CHÁY HÀNG' : `ĐÃ BÁN ${sold}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ─────────── Home ─────────── */
const Home = () => {
  const { user } = useAuth();
  const { setIsSearchOpen } = useCompare();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);

  // Newsletter state
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  /* Countdown cho Flash Sale – tính tới cuối ngày hôm nay */
  const getEndOfDay = () => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const diff = Math.max(0, Math.floor((end - now) / 1000));
    return { hours: Math.floor(diff / 3600), minutes: Math.floor((diff % 3600) / 60), seconds: diff % 60 };
  };
  const [timeLeft, setTimeLeft] = useState(getEndOfDay);
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getEndOfDay()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── Slide data (Aligned with TechPhone Teal & Gold brand identity) ── */
  const fallbackSlides = [
    {
      badge: 'Chính hãng VN/A · Bảo hành 24 tháng',
      subtitle: 'iPhone 16 Pro Max 512GB Titan Tự Nhiên',
      desc: 'Thiết kế Titan hàng không vũ trụ siêu nhẹ, chip Apple A18 Pro đỉnh cao công nghệ với nút điều khiển Camera Control đột phá.',
      price: 34990000,
      bg: 'bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 dark:from-slate-950 dark:via-primary-950 dark:to-slate-900 border border-primary-700/50',
      accent: 'text-accent-400',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      link: '/shop?brand=Apple',
    },
    {
      badge: 'Tặng ngay bộ quà AI trị giá 5.000.000đ',
      subtitle: 'Samsung Galaxy S26 Ultra AI 5G',
      desc: 'Kỷ nguyên quyền năng Galaxy AI thế hệ mới. Khung Titan nguyên khối, camera 200MP siêu zoom mắt thần bóng đêm.',
      price: 31990000,
      bg: 'bg-gradient-to-br from-primary-850 via-slate-900 to-primary-900 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950 border border-primary-700/50',
      accent: 'text-accent-400',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      link: '/shop?brand=Samsung',
    },
    {
      badge: 'Hot Deal · Ống kính Leica Summilux Master',
      subtitle: 'Xiaomi 15 Ultra Photography Kit',
      desc: 'Cảm biến 1 inch Sony LYT-900 thế hệ mới, thấu kính quang học Leica siêu sáng, sạc siêu tốc HyperCharge 120W.',
      price: 27990000,
      bg: 'bg-gradient-to-br from-slate-900 via-primary-900 to-slate-850 dark:from-slate-950 dark:via-primary-950 dark:to-slate-900 border border-primary-700/50',
      accent: 'text-accent-400',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      link: '/shop?brand=Xiaomi',
    },
  ];

  /* ── Static data ── */
  const categoriesList = [
    { name: 'Điện thoại', sub: 'iPhone · Samsung', icon: Smartphone, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500/10' },
    { name: 'Tai nghe', sub: 'AirPods · Sony', icon: Headphones, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500/10' },
    { name: 'Đồng hồ', sub: 'Apple Watch', icon: Watch, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500/10' },
    { name: 'Sạc & Pin', sub: 'Sạc nhanh · Dự phòng', icon: BatteryCharging, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500/10' },
    { name: 'Ốp lưng', sub: 'Kính · Bao da', icon: Shield, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500/10' },
    { name: 'Máy tính bảng', sub: 'iPad · Galaxy Tab', icon: Tablet, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500/10' },
  ];

  /* ── Static vouchers fallback ── */
  const defaultVouchers = [
    { code: 'TECH100K', title: 'Giảm 100K đơn từ 1 Triệu', discount: '100.000đ', tag: 'Dành cho mọi đơn' },
    { code: 'FREESHIP', title: 'Miễn phí vận chuyển toàn quốc', discount: 'Freeship 50K', tag: 'Đơn từ 300K' },
    { code: 'VIP500K', title: 'Siêu ưu đãi Khách hàng thân thiết', discount: '500.000đ', tag: 'Đơn từ 10 Triệu' },
    { code: 'SALE50', title: 'Giảm 50% phụ kiện chính hãng', discount: 'Giảm 50%', tag: 'Khi mua kèm máy' },
  ];

  /* ── Fetch ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, newRes, saleRes, banRes, catRes, vouchRes] = await Promise.all([
          productAPI.getAll({ isFeatured: true, limit: 8 }),
          productAPI.getAll({ limit: 12, sort: '-createdAt' }),
          productAPI.getAll({ isSale: true, limit: 12 }),
          bannerAPI.getAll({ isActive: true }).catch(() => ({ data: [] })),
          categoryAPI.getAll({ isActive: true }).catch(() => ({ data: [] })),
          voucherAPI.getAll().catch(() => ({ data: [] })),
        ]);
        const featList = featRes.data || [];
        const newList = newRes.data || [];
        const saleList = saleRes.data || [];
        setFeaturedProducts(featList);

        if (catRes?.data?.length > 0) setCategories(catRes.data);
        if (banRes?.data?.length > 0) setBanners(banRes.data);
        if (vouchRes?.data?.length > 0) {
          setVouchers(vouchRes.data.slice(0, 4));
        } else {
          setVouchers(defaultVouchers);
        }

        setFlashSaleProducts(saleList.length > 0 ? saleList.slice(0, 6) : featList.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentSlides = banners.length > 0
    ? banners.map((b, idx) => ({
      badge: 'Khuyến Mãi Độc Quyền',
      subtitle: b.title || 'Siêu ưu đãi công nghệ',
      desc: b.subtitle || 'Hàng ngàn sản phẩm chính hãng giảm giá sốc mỗi ngày',
      price: 0,
      bg: fallbackSlides[idx % fallbackSlides.length].bg,
      accent: 'text-accent-400',
      image: b.imageUrl || b.image || fallbackSlides[0]?.image,
      link: b.linkUrl || b.link || '/shop',
    }))
    : fallbackSlides;

  const slide = currentSlides[heroSlide] || fallbackSlides[0];

  const handleCopyVoucher = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success(`🎉 Đã lưu mã "${code}" vào clipboard!`, {
      style: { borderRadius: '12px', background: '#1F5A62', color: '#fff' }
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Vui lòng nhập email hợp lệ!');
      return;
    }
    setSubscribed(true);
    toast.success('🎉 Chúc mừng! Bạn đã đăng ký nhận thông tin và mã ưu đãi 100K thành công.');
    setEmail('');
  };

  /* ─────────── JSX ─────────── */
  return (
    <div className="pb-10 bg-slate-50 dark:bg-slate-950 min-h-screen relative overflow-hidden transition-colors">
      
      {/* Subtle Ambient Background Light (matching Brand Teal) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary-500/10 via-primary-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* ════════════════════════════════
          1. HERO SHOWCASE — 2 cột (Banner chính + 2 Banner Sale & Voucher)
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Cột lớn: Banner chính (2/3 width) - Teal & Gold Theme */}
          <div className={`lg:col-span-2 relative rounded-3xl overflow-hidden shadow-xl min-h-[400px] lg:min-h-[460px] flex items-center ${slide.bg} group transition-all duration-500`}>
            
            {/* Ambient glowing effect inside slide */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-primary-500/30 transition-all duration-700" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 p-8 sm:p-12 w-full flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md text-accent-300 px-3.5 py-1.5 rounded-full border border-white/15 shadow-sm">
                  <Sparkles size={13} className="text-accent-400 animate-spin-slow" /> {slide.badge}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight font-display drop-shadow-sm">
                  {slide.subtitle}
                </h1>
                <p className="text-slate-200 text-sm sm:text-base max-w-md line-clamp-2 leading-relaxed font-normal">{slide.desc}</p>
                {slide.price > 0 && (
                  <div className="pt-1 flex items-baseline gap-3">
                    <span className="text-xs uppercase text-slate-300 font-semibold tracking-wider">Giá ưu đãi:</span>
                    <p className="text-2xl sm:text-3xl font-mono font-bold text-accent-400 drop-shadow-sm">
                      {formatPrice(slide.price)}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 pt-3">
                  <Link
                    to={slide.link || '/shop'}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold px-7 py-3.5 rounded-full transition-all text-xs sm:text-sm shadow-lg shadow-primary-900/40 active:scale-95"
                  >
                    <span>Mua Ngay</span> <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-white font-semibold px-7 py-3.5 rounded-full transition-all text-xs sm:text-sm active:scale-95"
                  >
                    Khám Phá
                  </Link>
                </div>
              </div>

              {slide.image && (
                <div className="hidden md:flex flex-1 justify-center items-center relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-transparent rounded-full blur-2xl transform scale-75" />
                  <img
                    key={heroSlide}
                    src={slide.image}
                    alt={slide.subtitle}
                    className="max-h-80 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 relative z-10"
                  />
                </div>
              )}
            </div>

            {/* Nav arrows */}
            <button onClick={() => setHeroSlide((heroSlide - 1 + currentSlides.length) % currentSlides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/15 z-20 hover:scale-110 active:scale-95">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setHeroSlide((heroSlide + 1) % currentSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/15 z-20 hover:scale-110 active:scale-95">
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {currentSlides.map((_, i) => (
                <button key={i} onClick={() => setHeroSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === heroSlide ? 'bg-accent-400 w-8 shadow-sm shadow-accent-400' : 'bg-white/40 w-2 hover:bg-white/80'}`} />
              ))}
            </div>
          </div>

          {/* Cột phụ: 2 banner SALE & VOUCHER (1/3 width) - Clean Responsive Light/Dark Brand Colors */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Banner 1: SALE BANNER CHỚP NHOÁNG (Red & Orange accents) */}
            <Link to="/shop?isSale=true"
              className="flex-1 relative rounded-3xl overflow-hidden flex flex-col justify-between p-6 min-h-[190px] group border border-red-200/80 dark:border-red-900/40 shadow-sm hover:shadow-xl bg-gradient-to-br from-red-50/80 via-orange-50/50 to-white dark:from-slate-900 dark:via-red-950/30 dark:to-slate-900 hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-red-500/20 transition-all" />
              <div className="absolute -right-6 -bottom-6 opacity-10 dark:opacity-15 pointer-events-none transform rotate-12 group-hover:scale-110 transition-transform">
                <Flame size={130} className="text-red-500" />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm animate-pulse">
                  <Zap size={12} className="fill-white" /> Flash Sale Hôm Nay
                </span>
                <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-md border border-red-200 dark:border-red-800/60 shadow-xs">
                  -50% OFF
                </span>
              </div>

              <div className="relative z-10 my-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight font-display tracking-tight">
                  Săn Deal Chớp Nhoáng<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-600 dark:from-red-400 dark:to-amber-400">Giá Sốc Mỗi Ngày</span>
                </h3>
              </div>

              <div className="relative z-10 pt-2 flex items-center justify-between border-t border-red-200/60 dark:border-red-900/40">
                <span className="inline-flex items-center text-xs font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                  Săn deal ngay <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Hàng ngàn deal hot</span>
              </div>
            </Link>

            {/* Banner 2: VOUCHER BANNER (Brand Teal & Gold accents) */}
            <Link to="/vouchers"
              className="flex-1 relative rounded-3xl overflow-hidden flex flex-col justify-between p-6 min-h-[190px] group border border-primary-200/80 dark:border-primary-900/40 shadow-sm hover:shadow-xl bg-gradient-to-br from-primary-50/80 via-teal-50/50 to-white dark:from-slate-900 dark:via-primary-950/30 dark:to-slate-900 hover:border-primary-500/40 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary-500/20 transition-all" />
              <div className="absolute -right-6 -bottom-6 opacity-10 dark:opacity-15 pointer-events-none transform -rotate-12 group-hover:scale-110 transition-transform">
                <Gift size={130} className="text-primary-600" />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                  <Gift size={12} className="text-white" /> Kho Voucher Khủng
                </span>
                <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-md border border-primary-200 dark:border-primary-800/60 shadow-xs">
                  500K OFF
                </span>
              </div>

              <div className="relative z-10 my-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight font-display tracking-tight">
                  Đặc Quyền Thành Viên<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400">Quà Tặng Lên Đời</span>
                </h3>
              </div>

              <div className="relative z-10 pt-2 flex items-center justify-between border-t border-primary-200/60 dark:border-primary-900/40">
                <span className="inline-flex items-center text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                  Lưu mã giảm giá <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Áp dụng toàn sàn</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          NEW SECTION: SĂN VOUCHER & MÃ GIẢM GIÁ KHỦNG (Brand Teal & Gold Theme)
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
        <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 rounded-3xl p-6 sm:p-8 border border-primary-700/50 shadow-xl relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-accent-500/20 shrink-0">
                <Gift className="w-6 h-6 animate-bounce-slow" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-300 bg-accent-500/20 px-2.5 py-0.5 rounded-full border border-accent-400/30">
                  Độc Quyền Hôm Nay
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mt-1">
                  Săn Voucher & Mã Giảm Giá Khủng
                </h2>
              </div>
            </div>
            <Link to="/vouchers" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-300 hover:text-accent-200 transition-colors group bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl border border-white/15 shrink-0">
              <span>Vào Kho Voucher</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {(vouchers.length > 0 ? vouchers : defaultVouchers).map((v, idx) => {
              const code = v.code || `VIP${idx + 1}00K`;
              const title = v.title || v.description || 'Giảm ngay 100K cho đơn hàng';
              const discount = v.discountAmount ? formatPrice(v.discountAmount) : (v.discount || '100.000đ');
              const tag = v.tag || v.minOrderAmount ? `Đơn từ ${formatPrice(v.minOrderAmount)}` : 'Dành cho mọi đơn';

              return (
                <div key={idx} className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-white/15 hover:border-accent-400/50 transition-all duration-300 flex flex-col justify-between gap-3 group hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-500/10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-accent-500/20 text-accent-300 font-mono font-bold text-xs border border-accent-400/30">
                        {code}
                      </span>
                      <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-accent-300 transition-colors">
                        {discount}
                      </h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-accent-300 shrink-0">
                      <Tag size={16} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-1 font-normal">
                    {title}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-300 truncate font-medium">
                      {tag}
                    </span>
                    <button
                      onClick={(e) => handleCopyVoucher(code, e)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-500 to-amber-500 hover:from-accent-400 hover:to-amber-400 text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm active:scale-95 shrink-0"
                    >
                      <Copy size={11} />
                      <span>Lưu Mã</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          2. LỢI ÍCH CỬA HÀNG
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: 'Giao Hàng Siêu Tốc 2H', desc: 'Miễn phí cho đơn từ 300k', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500/10' },
              { icon: ShieldCheck, label: 'Bảo Hành Chính Hãng', desc: 'Lỗi 1 đổi 1 trong 30 ngày', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: RefreshCw, label: 'Đổi Trả Dễ Dàng', desc: 'Hoàn tiền nhanh chóng', color: 'text-accent-600 dark:text-accent-400', bg: 'bg-accent-500/10' },
              { icon: Award, label: 'Hỗ Trợ Chuyên Nghiệp', desc: 'Tư vấn kỹ thuật 24/7', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
            ].map(({ icon: Icon, label, desc, color, bg }) => (
              <div key={label} className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          3. DANH MỤC NỔI BẬT
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">Danh Mục Khám Phá</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Đầy đủ các dòng thiết bị công nghệ cao cấp chính hãng</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-5">
          {(categories.length > 0 ? categories : categoriesList).map((cat, i) => {
            const Icon = cat.icon || Smartphone;
            const linkUrl = cat._id ? `/shop?category=${cat._id}` : `/shop?search=${cat.name}`;
            return (
              <Link key={cat._id || i} to={linkUrl} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm hover:shadow-xl hover:border-primary-500/40 dark:hover:border-primary-500/40 transition-all duration-300 group cursor-pointer text-center h-full hover:-translate-y-1.5">
                {cat.image ? (
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2.5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className={`w-14 h-14 rounded-2xl ${cat.bg || 'bg-primary-500/10'} ${cat.color || 'text-primary-500'} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                  </div>
                )}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{cat.name.replace(/điện thoại/i, '').trim() || cat.name}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{cat.description || cat.sub || 'Khám phá ngay'}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ════════════════════════════════
          4. MỨC GIÁ
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Dưới 5 Triệu', link: '/shop?maxPrice=5000000', badge: 'Tiết kiệm' },
            { label: '5 - 10 Triệu', link: '/shop?minPrice=5000000&maxPrice=10000000', badge: 'Phổ biến' },
            { label: '10 - 20 Triệu', link: '/shop?minPrice=10000000&maxPrice=20000000', badge: 'Cận cao cấp' },
            { label: 'Trên 20 Triệu', link: '/shop?minPrice=20000000', badge: 'Flagship' },
          ].map((preset, idx) => (
            <Link 
              key={idx} 
              to={preset.link}
              className="bg-white hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-500 dark:bg-slate-900 dark:hover:from-primary-600 dark:hover:to-primary-500 text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-white font-bold text-xs py-4 px-5 rounded-2xl text-center shadow-sm hover:shadow-lg border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 flex flex-col items-center justify-center h-full min-h-[64px] active:scale-95 group"
            >
              <span className="text-sm font-display">{preset.label}</span>
              <span className="text-[10px] text-slate-400 group-hover:text-white/80 font-normal mt-0.5">{preset.badge}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          5. FLASH SALE
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-6 sm:p-8 bg-gradient-to-r from-red-500/10 via-rose-500/5 to-amber-500/10 dark:from-red-950/40 dark:via-rose-950/30 dark:to-amber-950/30 border border-red-500/20 dark:border-red-500/30 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30 shrink-0">
              <Zap className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                  Flash Sale
                </h2>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce-slow">
                  Đang diễn ra
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Khuyến mãi cực sốc chớp nhoáng theo ngày — Số lượng có hạn!</p>
            </div>
          </div>
          {/* Countdown */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-red-500/15">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">Kết thúc sau:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
              {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((v, i) => (
                <React.Fragment key={i}>
                  <span className="bg-gradient-to-b from-red-600 to-rose-700 text-white px-3 py-1.5 rounded-xl min-w-[36px] text-center shadow-md">
                    {String(v).padStart(2, '0')}
                  </span>
                  {i < 2 && <span className="text-red-600 dark:text-red-400 font-black text-base">:</span>}
                </React.Fragment>
              ))}
            </div>
            <Link to="/shop?isSale=true" className="ml-2 text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 group bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-red-500/20 shadow-xs">
              <span>Xem tất cả</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {flashSaleProducts.slice(0, 6).map((prod) => (
            <FlashSaleCard key={prod._id || prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          6. ĐIỆN THOẠI BÁN CHẠY
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">Sản Phẩm Bán Chạy Nhất</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Top siêu phẩm công nghệ được săn đón nhất tuần qua</p>
            </div>
          </div>
          <Link to="/shop?isFeatured=true" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline group bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span>Xem tất cả</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 animate-pulse space-y-4">
                <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featuredProducts.slice(0, 8).map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════
          7. BANNER KHUYẾN MÃI PHỤ (2 CỘT) - Clean Light/Dark Responsive Cards
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/trade-in" className="relative rounded-3xl overflow-hidden min-h-[150px] bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900 border border-amber-200/80 dark:border-amber-900/40 hover:border-amber-500/50 flex flex-col justify-center items-center text-center p-8 group transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2 border border-amber-500/20">Trợ Giá Siêu Tốt</span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1.5 font-display">Thu Cũ — Đổi Mới Lên Đời</h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">Trợ giá thu mua cao nhất thị trường lên đến <span className="text-red-600 dark:text-amber-400 font-mono font-bold text-base">5.000.000đ</span></p>
          </Link>

          <Link to="/installment" className="relative rounded-3xl overflow-hidden min-h-[150px] bg-gradient-to-br from-primary-50/80 via-cyan-50/50 to-white dark:from-slate-900 dark:via-primary-950/30 dark:to-slate-900 border border-primary-200/80 dark:border-primary-900/40 hover:border-primary-500/50 flex flex-col justify-center items-center text-center p-8 group transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary-500/20 transition-all" />
            <span className="px-3 py-1 rounded-full bg-primary-500/15 text-primary-700 dark:text-primary-300 text-[10px] font-bold uppercase tracking-wider mb-2 border border-primary-500/20">Thanh Toán Dễ Dàng</span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1.5 font-display">Trả Góp 0% Lãi Suất</h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">Kỳ hạn linh hoạt 12 tháng — Duyệt hồ sơ nhanh gọn chỉ trong <span className="text-primary-600 dark:text-primary-400 font-mono font-bold text-base">5 phút</span></p>
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════
          8. REDESIGNED NEWSLETTER & NEW TECH LAUNCH SECTION (Brand Teal & Gold Theme)
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 dark:from-primary-950 dark:via-slate-900 dark:to-primary-900 border border-primary-700/50 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
          
          {/* Animated background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-accent-500/25 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-accent-300 text-xs font-bold uppercase tracking-wider border border-white/15 shadow-sm">
                <Sparkles size={14} className="text-accent-400 animate-spin-slow" /> Nhận Mã Ưu Đãi 100K & Đặc Quyền VIP
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight font-display tracking-tight">
                Đăng ký nhận thông tin khuyến mãi<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 via-white to-primary-200">& ra mắt công nghệ mới</span>
              </h2>
              
              <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Là người đầu tiên cập nhật thông tin mở bán iPhone 17, Samsung Galaxy AI thế hệ mới cùng cơ hội nhận deal giảm giá độc quyền hàng tuần.
              </p>

              {/* Trust checklist */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2 text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-accent-400 shrink-0" /> Không spam thư rác</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-accent-400 shrink-0" /> Nhận voucher 100K ngay</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-accent-400 shrink-0" /> Hủy đăng ký bất kỳ lúc nào</span>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/15 shadow-xl">
                <h3 className="text-base font-bold text-white mb-3 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="text-accent-400 w-5 h-5" /> Đăng ký thành viên sớm
                </h3>
                
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập địa chỉ email của bạn..."
                      required
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 transition-all"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-accent-500 to-amber-500 hover:from-accent-400 hover:to-amber-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-500/25 active:scale-98"
                  >
                    <span>Đăng Ký Nhận Quà Ngay</span>
                    <Send size={16} />
                  </button>
                </form>

                {subscribed && (
                  <p className="mt-3 text-xs text-accent-300 font-semibold text-center bg-accent-500/10 py-2 rounded-lg border border-accent-500/20">
                    ✨ Cảm ơn bạn đã đồng hành cùng TechPhone!
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          9. CÔNG CỤ SO SÁNH / GỢI Ý
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white font-display">Phân vân giữa các dòng smartphone?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sử dụng công cụ so sánh cấu hình chi tiết để chọn được chiếc điện thoại ưng ý nhất.</p>
          </div>
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="px-6 py-3.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-all flex items-center gap-2 shrink-0 shadow-md shadow-primary-500/20 active:scale-95"
          >
            <span>So sánh thông số máy</span> <ArrowRightLeft size={16} />
          </button>
        </div>
      </section>

      {/* ════════════════════════════════
          10. ĐÁNH GIÁ & TIN TỨC CÔNG NGHỆ
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">Góc Công Nghệ & Đánh Giá Chi Tiết</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Cập nhật tin tức, xu hướng công nghệ và đánh giá chuyên sâu từ chuyên gia</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link to="#" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary-500/40 transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] font-bold text-primary-600 bg-primary-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">Đánh giá chuyên sâu</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-3 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">Đánh giá chi tiết iPhone 16 Pro Max: Titan nhẹ hơn, camera đỉnh cao</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">Kiểm chứng thời lượng pin thực tế đạt hơn 30 giờ phát video liên tục cùng nút Camera Control tiện ích.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <Star size={14} className="fill-amber-500" /> 4.9 <span className="text-slate-400 font-medium ml-1">· 2.400 lượt xem</span>
            </div>
          </Link>

          <Link to="#" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary-500/40 transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">Tư vấn chọn mua</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-3 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">Top 5 smartphone tầm trung đáng mua nhất nửa đầu năm 2026</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">Tổng hợp các mẫu điện thoại sở hữu màn hình OLED 120Hz mượt mà cùng dung lượng pin khủng 6000mAh.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <Star size={14} className="fill-amber-500" /> 4.8 <span className="text-slate-400 font-medium ml-1">· 1.800 lượt xem</span>
            </div>
          </Link>

          <Link to="#" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary-500/40 transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">So sánh flagship</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-3 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">Cuộc đối đầu thế kỷ: Galaxy S26 Ultra vs iPhone 16 Pro Max</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">So sánh chi tiết khả năng xử lý AI, chất lượng quay chụp đêm và màn hình chống phản chiếu sắc nét.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <Star size={14} className="fill-amber-500" /> 4.9 <span className="text-slate-400 font-medium ml-1">· 3.100 lượt xem</span>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
