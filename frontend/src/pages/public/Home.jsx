import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, bannerAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCompare } from '../../contexts/CompareContext';
import ProductCard from '../../components/product/ProductCard';
import {
  ArrowRight, Star, Truck, RefreshCw, ChevronLeft, ChevronRight,
  Sparkles, Zap, Flame, Headphones, ShieldCheck, Award,
  Smartphone, Watch, BatteryCharging, Shield, Tablet, ArrowRightLeft, Gift, Scale, Check
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

  // Fake stock progress for demo if real data is small
  const sold = product.sold || Math.floor(Math.random() * 50) + 10;
  const stock = product.stock || Math.floor(Math.random() * 20) + 5;
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
      className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-red-100/80 dark:border-red-900/40 overflow-hidden transition-all duration-300 hover:shadow-premium dark:hover:shadow-premium-dark hover:-translate-y-1.5 hover:border-red-500/50"
    >
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discountPercent > 0 && (
          <span className="bg-gradient-to-r from-red-600 to-accent-600 text-white font-black text-[10px] px-2.5 py-1 rounded-xl shadow-md uppercase tracking-wider flex items-center gap-1">
            <Zap size={11} className="fill-white animate-pulse" /> -{discountPercent}%
          </span>
        )}
      </div>

      {/* Compare button */}
      <button
        type="button"
        onClick={handleToggleCompare}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-2xl flex items-center justify-center transition-all duration-200 ${
          isCompared
            ? 'bg-primary-600 text-white scale-105 shadow-md shadow-primary-500/30'
            : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-400 hover:text-primary-600 hover:scale-110 shadow-sm border border-slate-200/50 dark:border-slate-700/50 opacity-0 group-hover:opacity-100'
        }`}
        title={isCompared ? "Bỏ so sánh" : "Thêm vào so sánh"}
      >
        {isCompared ? <Check size={16} className="stroke-[3]" /> : <Scale size={16} />}
      </button>

      <div className="relative aspect-square p-6 bg-gradient-to-br from-red-50/50 via-amber-50/30 to-white dark:from-red-950/20 dark:via-amber-950/10 dark:to-slate-900 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/50">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400?text=Phone'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
        />
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-white dark:bg-slate-900">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {product.name}
          </h3>
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-black text-lg text-red-600 dark:text-red-400 leading-none tracking-tight">{formatPrice(price)}</span>
            {oldPrice > price && <span className="text-[11px] text-slate-400 line-through">{formatPrice(oldPrice)}</span>}
          </div>
          {/* Progress bar */}
          <div className="relative w-full h-4 bg-red-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center shadow-inner">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 via-accent-500 to-amber-500 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
            <span className="relative z-10 text-[9px] font-black text-white px-2 w-full text-center drop-shadow">
              {percent >= 90 ? '🔥 SẮP CHÁY HÀNG' : `ĐÃ BÁN ${sold}`}
            </span>
            {percent >= 80 && <Flame className="absolute right-1.5 w-3 h-3 text-amber-300 animate-pulse z-10" />}
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
      subtitle: 'iPhone 16 Pro Max 512GB Titan Tự Nhiên',
      desc: 'Thiết kế Titan hàng không vũ trụ siêu nhẹ, chip Apple A18 Pro đỉnh cao công nghệ với nút điều khiển Camera Control đột phá.',
      price: 34990000,
      bg: 'from-slate-900 via-blue-950 to-indigo-950',
      accent: 'from-blue-400 to-cyan-400',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      link: '/shop?brand=Apple',
    },
    {
      badge: 'Tặng ngay bộ quà AI trị giá 5.000.000đ',
      subtitle: 'Samsung Galaxy S26 Ultra AI 5G',
      desc: 'Kỷ nguyên quyền năng Galaxy AI thế hệ mới. Khung Titan nguyên khối, camera 200MP siêu zoom mắt thần bóng đêm.',
      price: 31990000,
      bg: 'from-slate-950 via-zinc-900 to-amber-950',
      accent: 'from-amber-400 to-orange-400',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      link: '/shop?brand=Samsung',
    },
    {
      badge: 'Hot Deal · Ống kính Leica Summilux Master',
      subtitle: 'Xiaomi 15 Ultra Photography Kit',
      desc: 'Cảm biến 1 inch Sony LYT-900 thế hệ mới, thấu kính quang học Leica siêu sáng, sạc siêu tốc HyperCharge 120W.',
      price: 27990000,
      bg: 'from-indigo-950 via-purple-950 to-slate-900',
      accent: 'from-purple-400 to-pink-400',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      link: '/shop?brand=Xiaomi',
    },
  ];

  /* ── Static data ── */
  const categoriesList = [
    { name: 'Điện thoại', sub: 'iPhone · Samsung', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-500/15' },
    { name: 'Tai nghe', sub: 'AirPods · Sony', icon: Headphones, color: 'text-purple-500', bg: 'bg-purple-500/15' },
    { name: 'Đồng hồ', sub: 'Apple Watch', icon: Watch, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
    { name: 'Sạc & Pin', sub: 'Sạc nhanh · Dự phòng', icon: BatteryCharging, color: 'text-amber-500', bg: 'bg-amber-500/15' },
    { name: 'Ốp lưng', sub: 'Kính · Bao da', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-500/15' },
    { name: 'Máy tính bảng', sub: 'iPad · Galaxy Tab', icon: Tablet, color: 'text-indigo-500', bg: 'bg-indigo-500/15' },
  ];

  /* ── Fetch ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, newRes, banRes, catRes] = await Promise.all([
          productAPI.getAll({ isFeatured: true, limit: 8 }),
          productAPI.getAll({ limit: 12, sort: '-createdAt' }),
          bannerAPI.getAll({ isActive: true }).catch(() => ({ data: [] })),
          categoryAPI.getAll({ isActive: true }).catch(() => ({ data: [] })),
        ]);
        const featList = featRes.data || [];
        const newList = newRes.data || [];
        setFeaturedProducts(featList);

        if (catRes?.data?.length > 0) setCategories(catRes.data);
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
      price: 0, bg: 'from-primary-950 via-indigo-950 to-slate-900',
      accent: 'from-amber-400 to-orange-400',
      image: b.imageUrl, link: b.linkUrl || '/shop',
    }))
    : fallbackSlides;

  const slide = currentSlides[heroSlide] || fallbackSlides[0];

  /* ─────────── JSX ─────────── */
  return (
    <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen">

      {/* ════════════════════════════════
          1. HERO SHOWCASE — 2 cột
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Cột lớn: Banner chính (2/3 width) */}
          <div className={`lg:col-span-2 relative rounded-3xl overflow-hidden shadow-premium dark:shadow-premium-dark min-h-[380px] lg:min-h-[440px] flex items-center bg-gradient-to-br ${slide.bg} group transition-all duration-700 border border-slate-800/60`}>

            {/* decorative glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 p-8 sm:p-12 w-full flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm`}>
                  <Sparkles size={13} className="text-amber-300 animate-spin-slow" /> {slide.badge}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight font-display">
                  {slide.subtitle}
                </h1>
                <p className="text-slate-300 text-sm sm:text-base max-w-md line-clamp-2 leading-relaxed">{slide.desc}</p>
                {slide.price > 0 && (
                  <p className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent pt-1`}>
                    {formatPrice(slide.price)}
                  </p>
                )}
                <div className="flex flex-wrap gap-3.5 pt-2">
                  <Link
                    to={slide.link || '/shop'}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 to-orange-600 hover:from-accent-400 hover:to-orange-500 text-white font-extrabold px-7 py-3.5 rounded-2xl shadow-glow-accent hover:scale-105 transition-all text-sm"
                  >
                    <span>Mua Ngay</span> <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold px-6 py-3.5 rounded-2xl backdrop-blur-md transition-all hover:scale-105 text-sm"
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
                    className="max-h-72 object-contain drop-shadow-2xl animate-fade-in hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
            </div>

            {/* Nav arrows (appear on hover) */}
            <button onClick={() => setHeroSlide((heroSlide - 1 + currentSlides.length) % currentSlides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/60 hover:bg-slate-900 text-white rounded-2xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/10 shadow-lg z-20">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setHeroSlide((heroSlide + 1) % currentSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/60 hover:bg-slate-900 text-white rounded-2xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/10 shadow-lg z-20">
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {currentSlides.map((_, i) => (
                <button key={i} onClick={() => setHeroSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === heroSlide ? 'bg-amber-400 w-8 shadow-glow-accent' : 'bg-white/30 w-2 hover:bg-white/60'}`} />
              ))}
            </div>
          </div>

          {/* Cột phụ: 2 mini-banner (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Link to="/shop?isSale=true"
              className="flex-1 relative rounded-3xl overflow-hidden flex flex-col justify-end p-7 min-h-[185px] group border border-slate-800/80 shadow-premium bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-900 hover:scale-[1.02] transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-red-400">Siêu Cuối Tuần</span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight font-display">Giảm Đến 50%<br />Giá Sốc Hôm Nay</h3>
                <span className="pt-2 inline-flex items-center text-xs font-extrabold text-purple-300 group-hover:text-white transition-colors">
                  Săn deal ngay <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            <Link to="/vouchers"
              className="flex-1 relative rounded-3xl overflow-hidden flex flex-col justify-end p-7 min-h-[185px] group border border-slate-800/80 shadow-premium bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 hover:scale-[1.02] transition-all">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                    Kho Voucher Khủng
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight font-display">Ưu Đãi 500.000đ<br />Cho Khách Mới</h3>
                <span className="pt-2 inline-flex items-center text-xs font-extrabold text-emerald-300 group-hover:text-white transition-colors">
                  Lưu mã ngay <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          2. LỢI ÍCH CỬA HÀNG
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: 'Giao Hàng Siêu Tốc 2H', desc: 'Miễn phí cho đơn từ 300k', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/30' },
              { icon: ShieldCheck, label: 'Bảo Hành Chính Hãng', desc: 'Lỗi 1 đổi 1 trong 30 ngày', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
              { icon: RefreshCw, label: 'Đổi Trả Dễ Dàng', desc: 'Hoàn tiền nhanh chóng', color: 'text-accent-600 dark:text-accent-400', bg: 'bg-accent-50 dark:bg-accent-900/30' },
              { icon: Award, label: 'Hỗ Trợ Chuyên Nghiệp', desc: 'Tư vấn kỹ thuật 24/7', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
            ].map(({ icon: Icon, label, desc, color, bg }) => (
              <div key={label} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{label}</p>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-8 font-display tracking-tight">Danh Mục Khám Phá</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {(categories.length > 0 ? categories : categoriesList).map((cat, i) => {
            const Icon = cat.icon || Smartphone;
            const linkUrl = cat._id ? `/shop?category=${cat._id}` : `/shop?search=${cat.name}`;
            return (
              <Link key={cat._id || i} to={linkUrl} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl hover:shadow-premium dark:hover:shadow-premium-dark hover:border-primary-500/50 transition-all duration-300 group cursor-pointer text-center h-full hover:-translate-y-1">
                {cat.image ? (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2 shadow-sm">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-2xl ${cat.bg || 'bg-primary-500/15'} ${cat.color || 'text-primary-500'} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                    <Icon size={30} />
                  </div>
                )}
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{cat.name.replace(/điện thoại/i, '').trim() || cat.name}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{cat.description || cat.sub || 'Khám phá ngay'}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ════════════════════════════════
          4. MỨC GIÁ
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Dưới 5 Triệu', link: '/shop?maxPrice=5000000', color: 'from-emerald-600 to-teal-600 shadow-emerald-500/20' },
            { label: '5 - 10 Triệu', link: '/shop?minPrice=5000000&maxPrice=10000000', color: 'from-primary-600 to-indigo-600 shadow-primary-500/20' },
            { label: '10 - 20 Triệu', link: '/shop?minPrice=10000000&maxPrice=20000000', color: 'from-purple-600 to-pink-600 shadow-purple-500/20' },
            { label: 'Trên 20 Triệu', link: '/shop?minPrice=20000000', color: 'from-accent-600 to-red-600 shadow-accent-500/20' },
          ].map((preset, idx) => (
            <Link 
              key={idx} 
              to={preset.link}
              className={`bg-gradient-to-r ${preset.color} text-white font-extrabold text-sm p-4 rounded-2xl text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center justify-center h-full min-h-[64px]`}
            >
              {preset.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          5. FLASH SALE  (theme-aware)
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-6 bg-gradient-to-r from-red-600/10 via-amber-500/10 to-transparent dark:from-red-950/40 dark:via-amber-950/20 dark:to-transparent border border-red-200/60 dark:border-red-900/40 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-accent-600 flex items-center justify-center shadow-md shadow-red-500/30">
              <Zap className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight font-display flex items-center gap-2">
                Flash Sale <Flame className="w-6 h-6 text-red-500 fill-red-500 animate-bounce" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Khuyến mãi cực sốc chớp nhoáng theo ngày!</p>
            </div>
          </div>
          {/* Countdown */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-300 font-bold hidden sm:inline">Kết thúc sau:</span>
            <div className="flex items-center gap-1.5 font-mono font-black text-sm">
              {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((v, i) => (
                <React.Fragment key={i}>
                  <span className="bg-red-600 text-white px-3 py-1.5 rounded-xl min-w-[40px] text-center shadow-sm">
                    {String(v).padStart(2, '0')}
                  </span>
                  {i < 2 && <span className="text-red-500 font-bold text-lg animate-pulse">:</span>}
                </React.Fragment>
              ))}
            </div>
            <Link to="/shop?isSale=true" className="ml-3 text-xs font-extrabold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 group">
              Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
          6. ĐIỆN THOẠI BÁN CHẠY  (4×2 grid)
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">Sản Phẩm Bán Chạy Nhất</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Top siêu phẩm công nghệ được săn đón nhất tuần qua</p>
            </div>
          </div>
          <Link to="/shop?isFeatured=true" className="hidden sm:flex items-center gap-1 text-sm font-extrabold text-primary-600 dark:text-primary-400 hover:underline group">
            Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
          7. BANNER KHUYẾN MÃI PHỤ (2 CỘT)
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/trade-in" className="relative rounded-3xl overflow-hidden min-h-[140px] bg-gradient-to-r from-red-600/10 via-orange-500/10 to-amber-500/10 dark:from-red-950/40 dark:to-amber-950/20 flex flex-col justify-center items-center text-center p-8 border border-red-200/60 dark:border-red-900/40 hover:shadow-premium dark:hover:shadow-premium-dark hover:scale-[1.01] transition-all group">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider mb-2">Trợ Giá Siêu Tốt</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 font-display">Thu Cũ — Đổi Mới Lên Đời</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Trợ giá thu mua cao nhất thị trường lên đến <span className="text-red-600 dark:text-red-400 font-extrabold">5.000.000đ</span></p>
          </Link>

          <Link to="/installment" className="relative rounded-3xl overflow-hidden min-h-[140px] bg-gradient-to-r from-primary-600/10 via-indigo-500/10 to-purple-500/10 dark:from-primary-950/40 dark:to-purple-950/20 flex flex-col justify-center items-center text-center p-8 border border-primary-200/60 dark:border-primary-900/40 hover:shadow-premium dark:hover:shadow-premium-dark hover:scale-[1.01] transition-all group">
            <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-wider mb-2">Thanh Toán Dễ Dàng</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 font-display">Trả Góp 0% Lãi Suất</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Kỳ hạn linh hoạt 12 tháng — Duyệt hồ sơ nhanh gọn chỉ trong <span className="text-primary-600 dark:text-primary-400 font-extrabold">5 phút</span></p>
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════
          8. CÔNG CỤ SO SÁNH / GỢI Ý
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-gradient-to-r from-emerald-600/15 via-teal-600/15 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 border border-emerald-500/30 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-black text-slate-900 dark:text-white font-display">Phân vân giữa các dòng smartphone?</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">Sử dụng công cụ so sánh cấu hình chi tiết để chọn được chiếc điện thoại ưng ý nhất.</p>
          </div>
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 hover:scale-105"
          >
            <span>So sánh thông số máy</span> <ArrowRightLeft size={17} />
          </button>
        </div>
      </section>

      {/* ════════════════════════════════
          9. ĐÁNH GIÁ & TIN TỨC CÔNG NGHỆ
      ════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 font-display tracking-tight">Góc Công Nghệ & Đánh Giá Chi Tiết</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link to="#" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 hover:shadow-premium dark:hover:shadow-premium-dark hover:border-primary-500/50 transition-all duration-300 group hover:-translate-y-1">
            <span className="text-[10px] font-extrabold text-primary-600 uppercase tracking-widest">Đánh giá chuyên sâu</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Đánh giá chi tiết iPhone 16 Pro Max: Titan nhẹ hơn, camera đỉnh cao</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">Kiểm chứng thời lượng pin thực tế đạt hơn 30 giờ phát video liên tục cùng nút Camera Control tiện ích.</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <Star size={14} className="fill-amber-500" /> 4.9 <span className="text-slate-400 font-medium ml-1">· 2.400 lượt xem</span>
            </div>
          </Link>

          <Link to="#" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 hover:shadow-premium dark:hover:shadow-premium-dark hover:border-primary-500/50 transition-all duration-300 group hover:-translate-y-1">
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">Tư vấn chọn mua</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Top 5 smartphone tầm trung đáng mua nhất nửa đầu năm 2026</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">Tổng hợp các mẫu điện thoại sở hữu màn hình OLED 120Hz mượt mà cùng dung lượng pin khủng 6000mAh.</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <Star size={14} className="fill-amber-500" /> 4.8 <span className="text-slate-400 font-medium ml-1">· 1.800 lượt xem</span>
            </div>
          </Link>

          <Link to="#" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 hover:shadow-premium dark:hover:shadow-premium-dark hover:border-primary-500/50 transition-all duration-300 group hover:-translate-y-1">
            <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest">So sánh flagship</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Cuộc đối đầu thế kỷ: Galaxy S26 Ultra vs iPhone 16 Pro Max</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">So sánh chi tiết khả năng xử lý AI, chất lượng quay chụp đêm và màn hình chống phản chiếu sắc nét.</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <Star size={14} className="fill-amber-500" /> 4.9 <span className="text-slate-400 font-medium ml-1">· 3.100 lượt xem</span>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
