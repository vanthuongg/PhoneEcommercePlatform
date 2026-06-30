import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, bannerAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCompare } from '../../contexts/CompareContext';
import ProductCard from '../../components/product/ProductCard';
import {
  ArrowRight, Star, Truck, RefreshCw, ChevronLeft, ChevronRight,
  Sparkles, Zap, Flame, Headphones, ShieldCheck, Award,
  Smartphone, Watch, BatteryCharging, Shield, Tablet, ArrowRightLeft, Gift, Scale
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─────────── helpers ─────────── */
const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

/* tiny avatar initial: first letter of last word */
const avatarInitial = (name = '') => {
  const parts = name.trim().split(' ');
  return (parts[parts.length - 1]?.[0] || 'K').toUpperCase();
};

/* ─────────── FlashSaleCard ─────────── */
const FlashSaleCard = ({ product }) => {
  const price = product.salePrice > 0 ? product.salePrice : product.price;
  const oldPrice = product.oldPrice > 0 ? product.oldPrice : (product.salePrice > 0 ? product.price : 0);
  const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  // Fake stock progress for demo if real data is small
  const sold = product.sold || Math.floor(Math.random() * 50) + 10;
  const stock = product.stock || Math.floor(Math.random() * 20) + 5;
  const total = sold + stock;
  const percent = Math.min(100, Math.round((sold / total) * 100));
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare(product._id || product.id)) {
      removeFromCompare(product._id || product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <Link to={`/product/${product._id || product.id}`} className="group relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl border border-red-100 dark:border-red-900/30 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1.5">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discountPercent > 0 && (
          <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-[11px] px-2 py-1 rounded-xl shadow-md flex items-center gap-1 animate-pulse">
            <Zap size={10} className="fill-white" /> -{discountPercent}%
          </span>
        )}
      </div>

      {/* Compare button */}
      <button
        type="button"
        onClick={handleToggleCompare}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
          isInCompare(product._id || product.id)
            ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-500 scale-110 shadow-md'
            : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-400 hover:text-blue-500 hover:scale-110 shadow-sm opacity-0 group-hover:opacity-100'
        }`}
        title={isInCompare(product._id || product.id) ? "Bỏ so sánh" : "Thêm vào so sánh"}
      >
        <Scale size={16} className={isInCompare(product._id || product.id) ? 'stroke-[2.5]' : ''} />
      </button>

      <div className="relative aspect-square p-6 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-900/10 dark:to-orange-900/10 flex items-center justify-center">
        <img src={product.images?.[0] || 'https://via.placeholder.com/400?text=Phone'} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
            {product.name}
          </h3>
        </div>
        <div>
          <div className="flex flex-col mb-3">
            <span className="font-black text-lg text-red-600 dark:text-red-400 leading-none">{formatPrice(price)}</span>
            {oldPrice > price && <span className="text-[11px] text-gray-400 line-through mt-1">{formatPrice(oldPrice)}</span>}
          </div>
          {/* Progress bar */}
          <div className="relative w-full h-4 bg-red-100 dark:bg-gray-700 rounded-full overflow-hidden flex items-center shadow-inner">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
            <div className="absolute inset-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-30"></div>
            <span className="relative z-10 text-[9px] font-black text-white px-2 w-full text-center drop-shadow-md">
              {percent >= 90 ? 'SẮP CHÁY HÀNG' : `ĐÃ BÁN ${sold}`}
            </span>
            {percent >= 80 && <Flame className="absolute right-1 w-3 h-3 text-amber-300 animate-pulse z-10" />}
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
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);

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

  /* ── Slide data ── */
  const fallbackSlides = [
    {
      badge: 'Chính hãng VN/A · Bảo hành 24 tháng',
      subtitle: 'iPhone 15 Pro Max',
      desc: 'Titan hàng không vũ trụ, chip A17 Pro, camera 5x Zoom quang học.',
      price: 29990000,
      bg: 'from-slate-900 via-blue-950 to-indigo-950',
      accent: 'from-blue-400 to-cyan-400',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      link: '/shop?brand=Apple',
    },
    {
      badge: 'Tặng ngay đế sạc không dây 15W',
      subtitle: 'Samsung Galaxy S24 Ultra',
      desc: 'Kỷ nguyên Galaxy AI. Khung Titan, bút S-Pen tích hợp.',
      price: 26990000,
      bg: 'from-gray-900 via-zinc-900 to-amber-950',
      accent: 'from-amber-400 to-orange-400',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      link: '/shop?brand=Samsung',
    },
    {
      badge: 'Hot Deal · Ống kính Leica Summilux',
      subtitle: 'Xiaomi 14 Ultra 5G',
      desc: 'Cảm biến 1 inch thế hệ mới, Leica siêu sáng, sạc 90W.',
      price: 24990000,
      bg: 'from-indigo-950 via-purple-950 to-slate-900',
      accent: 'from-purple-400 to-pink-400',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      link: '/shop?brand=Xiaomi',
    },
  ];

  /* ── Static data ── */
  const categoriesList = [
    { name: 'Điện thoại', sub: 'iPhone · Samsung', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { name: 'Tai nghe', sub: 'AirPods · Sony', icon: Headphones, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { name: 'Đồng hồ', sub: 'Apple Watch', icon: Watch, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { name: 'Sạc & Pin', sub: 'Sạc nhanh · Dự phòng', icon: BatteryCharging, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    { name: 'Ốp lưng', sub: 'Kính · Bao da', icon: Shield, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' },
    { name: 'Máy tính bảng', sub: 'iPad · Galaxy Tab', icon: Tablet, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/30' },
  ];

  /* ── Fetch ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, newRes, banRes] = await Promise.all([
          productAPI.getAll({ isFeatured: true, limit: 8 }),
          productAPI.getAll({ limit: 12, sort: '-createdAt' }),
          bannerAPI.getAll({ isActive: true }).catch(() => ({ data: [] })),
        ]);
        const featList = featRes.data || [];
        const newList = newRes.data || [];
        setFeaturedProducts(featList);


        if (banRes?.data?.length > 0) setBanners(banRes.data);

        const saleList = [...featList, ...newList].filter(
          (p) => p.salePrice > 0 && p.salePrice < p.price
        );
        setFlashSaleProducts(saleList.length > 0 ? saleList.slice(0, 6) : featList.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentSlides = banners.length > 0
    ? banners.map((b) => ({
      badge: 'Khuyến Mãi Độc Quyền',
      subtitle: b.title || 'Siêu ưu đãi công nghệ',
      desc: b.subtitle || 'Hàng ngàn sản phẩm chính hãng giảm giá sốc mỗi ngày',
      price: 0, bg: 'from-primary/90 via-indigo-950 to-slate-900',
      accent: 'from-amber-400 to-orange-400',
      image: b.imageUrl, link: b.linkUrl || '/shop',
    }))
    : fallbackSlides;

  useEffect(() => {
    const t = setInterval(() => setHeroSlide((p) => (p + 1) % currentSlides.length), 6000);
    return () => clearInterval(t);
  }, [currentSlides.length]);

  const slide = currentSlides[heroSlide] || fallbackSlides[0];

  /* ─────────── JSX ─────────── */
  return (
    <div className="pb-20 bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* ════════════════════════════════
          1. HERO SHOWCASE — 2 cột
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Cột lớn: Banner chính (2/3 width) */}
          <div className={`lg:col-span-2 relative rounded-3xl overflow-hidden shadow-xl min-h-[360px] lg:min-h-[420px] flex items-center bg-gradient-to-br ${slide.bg} group transition-all duration-700`}>

            {/* decorative glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,255,255,0.07),transparent_60%)] pointer-events-none" />

            <div className="relative z-10 p-8 sm:p-10 w-full flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent bg-white/10 backdrop-blur px-3 py-1 rounded-full border border-white/20`}>
                  <Sparkles size={12} className="text-amber-300" /> {slide.badge}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                  {slide.subtitle}
                </h1>
                <p className="text-white/70 text-sm sm:text-base max-w-sm line-clamp-2">{slide.desc}</p>
                {slide.price > 0 && (
                  <p className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
                    {formatPrice(slide.price)}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 pt-1">
                  <Link
                    to={slide.link || '/shop'}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-gray-950 font-black px-6 py-3 rounded-xl shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all text-sm"
                  >
                    Mua Ngay <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-xl backdrop-blur transition-all hover:-translate-y-0.5 text-sm"
                  >
                    Khám Phá
                  </Link>
                </div>
              </div>

              {slide.image && (
                <div className="hidden md:flex flex-1 justify-center items-center">
                  <img
                    key={heroSlide}
                    src={slide.image}
                    alt={slide.subtitle}
                    className="max-h-64 object-contain drop-shadow-2xl animate-in fade-in zoom-in-95 duration-500 hover:scale-105 transition-transform"
                  />
                </div>
              )}
            </div>

            {/* Nav arrows (appear on hover) */}
            <button onClick={() => setHeroSlide((heroSlide - 1 + currentSlides.length) % currentSlides.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/25 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setHeroSlide((heroSlide + 1) % currentSlides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/25 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20">
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {currentSlides.map((_, i) => (
                <button key={i} onClick={() => setHeroSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === heroSlide ? 'bg-amber-400 w-7' : 'bg-white/30 w-2 hover:bg-white/60'}`} />
              ))}
            </div>
          </div>

          {/* Cột phụ: 2 mini-banner (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <Link to="/shop?isSale=true"
              className="flex-1 relative rounded-3xl overflow-hidden flex flex-col justify-end p-6 min-h-[180px] group border border-white/10 shadow-lg bg-gradient-to-br from-violet-900 via-indigo-900 to-blue-900">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(167,139,250,0.25),transparent_60%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-red-300">Flash Sale</span>
                </div>
                <h3 className="text-xl font-black text-white leading-tight">Giảm Đến 50%<br />Cuối Tuần Này</h3>
                <span className="mt-3 inline-flex items-center text-xs font-bold text-white/70 group-hover:text-white transition-colors">
                  Xem ngay <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            <Link to="/vouchers"
              className="flex-1 relative rounded-3xl overflow-hidden flex flex-col justify-end p-6 min-h-[180px] group border border-white/10 shadow-lg bg-gradient-to-br from-teal-900 via-emerald-900 to-cyan-900">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(52,211,153,0.2),transparent_60%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                    Voucher Tháng {new Date().getMonth() + 1}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white leading-tight">Ưu Đãi Đến 500K<br />Cho Bạn Mới</h3>
                <span className="mt-3 inline-flex items-center text-xs font-bold text-white/70 group-hover:text-white transition-colors">
                  Lưu mã ngay <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          2. LỢI ÍCH CỬA HÀNG
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-5 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4">
            {[
              { icon: Truck, label: 'Giao Hàng Siêu Tốc 2H', desc: 'Miễn phí từ 300.000₫', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50' },
              { icon: ShieldCheck, label: 'Bảo Hành Chính Hãng', desc: 'Lỗi 1 đổi 1 trong 30 ngày', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
              { icon: RefreshCw, label: 'Đổi Trả 30 Ngày', desc: 'Hoàn tiền nếu không hài lòng', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/50' },
              { icon: Award, label: 'Hỗ Trợ 24/7', desc: 'Hotline tư vấn miễn phí', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/50' },
            ].map(({ icon: Icon, label, desc, color, bg }) => (
              <div key={label} className="flex items-center gap-3 group">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          3. DANH MỤC NỔI BẬT
      ════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <h2 className="text-xl font-black text-gray-900 dark:text-white text-center mb-6">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categoriesList.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link key={i} to={`/shop?search=${cat.name}`} className="flex flex-col items-center justify-center p-5 bg-white dark:bg-gray-900 border border-green-100 dark:border-green-900/30 rounded-2xl hover:shadow-lg hover:border-primary transition-all group cursor-pointer text-center">
                  <div className={`w-14 h-14 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">{cat.name}</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{cat.sub}</p>
                </Link>
              )
            })}
          </div>
        </section>

      {/* ════════════════════════════════
          5. FLASH SALE  (theme-aware)
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">
                Flash Sale
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Chớp ngay kẻo hết!</p>
            </div>
          </div>
          {/* Countdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Kết thúc sau:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-sm">
              {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((v, i) => (
                <React.Fragment key={i}>
                  <span className="bg-gray-900 dark:bg-gray-800 text-white px-2.5 py-1 rounded-lg min-w-[36px] text-center">
                    {String(v).padStart(2, '0')}
                  </span>
                  {i < 2 && <span className="text-gray-400 animate-pulse">:</span>}
                </React.Fragment>
              ))}
            </div>
            <Link to="/shop?isSale=true" className="ml-2 text-xs font-bold text-primary hover:text-blue-600 flex items-center gap-0.5 group">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {flashSaleProducts.slice(0, 6).map((prod) => (
            <FlashSaleCard key={prod._id || prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          7. ĐIỆN THOẠI BÁN CHẠY  (4×2 grid)
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-500 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Điện Thoại Bán Chạy Nhất</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Top sản phẩm được săn đón nhiều nhất tuần qua</p>
            </div>
          </div>
          <Link to="/shop?isFeatured=true" className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:text-blue-600 group">
            Xem tất cả <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse space-y-3">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 8).map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════
          7. BANNER KHUYẾN MÃI PHỤ (2 CỘT)
      ════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link to="/trade-in" className="relative rounded-2xl overflow-hidden min-h-[120px] bg-red-50 dark:bg-red-950/30 flex flex-col justify-center items-center text-center p-6 border border-red-100 dark:border-red-900/50 hover:shadow-lg hover:scale-[1.01] transition-all">
              <h3 className="text-xl font-black text-red-700 dark:text-red-400 mb-1">Thu cũ — Đổi mới</h3>
              <p className="text-red-600/80 dark:text-red-300/80 text-sm font-semibold">Trợ giá đến 5 triệu đồng</p>
            </Link>
            <Link to="/installment" className="relative rounded-2xl overflow-hidden min-h-[120px] bg-amber-50 dark:bg-amber-950/30 flex flex-col justify-center items-center text-center p-6 border border-amber-100 dark:border-amber-900/50 hover:shadow-lg hover:scale-[1.01] transition-all">
              <h3 className="text-xl font-black text-amber-700 dark:text-amber-500 mb-1">Trả góp 0% lãi suất</h3>
              <p className="text-amber-600/80 dark:text-amber-400/80 text-sm font-semibold">12 tháng — duyệt trong 5 phút</p>
            </Link>
          </div>
        </section>

      {/* ════════════════════════════════
          8. CÔNG CỤ SO SÁNH / GỢI Ý
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <p className="text-green-800 dark:text-green-400 font-semibold">Bạn chưa biết chọn máy nào? — Dùng công cụ so sánh của chúng tôi</p>
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            So sánh điện thoại <ArrowRightLeft size={16} />
          </button>
        </div>
      </section>

      {/* ════════════════════════════════
          9. ĐÁNH GIÁ & TIN TỨC CÔNG NGHỆ
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link to="#" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center hover:shadow-md transition-all group">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Review iPhone 17 Pro Max</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Camera đỉnh, pin 30 giờ?</p>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-500">
              <Star size={14} className="fill-amber-500" /> 4.9 <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">- 2.400 lượt xem</span>
            </div>
          </Link>
          <Link to="#" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center hover:shadow-md transition-all group">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Top 5 máy tầm trung 2026</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Hiệu năng — Pin — Thiết kế</p>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-500">
              <Star size={14} className="fill-amber-500" /> 4.8 <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">- 1.800 lượt xem</span>
            </div>
          </Link>
          <Link to="#" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center hover:shadow-md transition-all group">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Nên mua Samsung hay iPhone?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">So sánh chi tiết năm 2026</p>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-500">
              <Star size={14} className="fill-amber-500" /> 4.7 <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">- 3.100 lượt xem</span>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
