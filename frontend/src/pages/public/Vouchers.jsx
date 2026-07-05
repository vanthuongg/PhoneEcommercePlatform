import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { voucherAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { Gift, Tag, Clock, Check, Copy, Flame, ShieldCheck, Zap, Sparkles, Truck, Percent, DollarSign, Crown, RefreshCw, AlertCircle, ShoppingBag, ArrowRight, Wallet, CreditCard, Store, Bookmark, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const getDiscountIcon = (type, tag, scope) => {
  if (tag === 'vip') return <Crown className="w-6 h-6 text-amber-500" />;
  if (tag === 'flash' || tag === 'daily') return <Flame className="w-6 h-6 text-rose-500" />;
  if (type === 'freeship' || tag === 'shipping' || scope === 'platform_freeship') return <Truck className="w-6 h-6 text-emerald-500" />;
  if (scope === 'shop_discount' || tag === 'brand') return <Store className="w-6 h-6 text-indigo-500" />;
  if (type === 'percentage') return <Percent className="w-6 h-6 text-blue-500" />;
  return <DollarSign className="w-6 h-6 text-primary-600" />;
};

const getTagBadge = (v) => {
  if (v.isDaily || v.tag === 'daily' || v.tag === 'flash') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm animate-pulse">
        <Flame className="w-3 h-3 fill-white" /> Cập nhật hàng ngày
      </span>
    );
  }
  if (v.scope === 'platform_freeship' || v.tag === 'shipping' || v.discountType === 'freeship') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
        <Truck className="w-3 h-3" /> Freeship TechPhone
      </span>
    );
  }
  if (v.scope === 'shop_discount' || v.applicableTo === 'brand' || v.tag === 'brand') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
        <Store className="w-3 h-3" /> Mã Đặc Quyền Hãng
      </span>
    );
  }
  if (v.tag === 'vip') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 shadow-sm">
        <Crown className="w-3 h-3 fill-gray-950" /> Đặc quyền VIP
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
      <ShieldCheck className="w-3 h-3" /> Hệ Thống TechPhone
    </span>
  );
};

const Vouchers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [walletVouchers, setWalletVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Daily Lucky Gift state
  const [luckyClaimed, setLuckyClaimed] = useState(false);
  const [luckyVoucher, setLuckyVoucher] = useState(null);
  const [spinning, setSpinning] = useState(false);

  // Countdown timer to midnight (00:00:00)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 23, minutes: 59, seconds: 59 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const res = await voucherAPI.getAll();
        setVouchers(res.data || []);
      } catch (err) {
        toast.error('Không thể tải danh sách voucher');
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  useEffect(() => {
    if (user) {
      voucherAPI.getMyWallet()
        .then(res => setWalletVouchers(res.data || []))
        .catch(() => {});
    } else {
      setWalletVouchers([]);
    }
  }, [user]);

  const isSavedInWallet = (v) => {
    if (!user) return false;
    if (walletVouchers.some(wv => wv.code === v.code || wv._id === v._id)) return true;
    if (v.savedByUsers && v.savedByUsers.includes(user._id)) return true;
    return false;
  };

  const handleClaim = async (v) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu voucher vào Ví');
      navigate('/login');
      return;
    }
    if (isSavedInWallet(v)) {
      toast.info('Bạn đã lưu mã này trong Ví rồi');
      return;
    }
    setClaimingId(v._id || v.code);
    try {
      const res = await voucherAPI.claim(v.code);
      if (res.success) {
        toast.success(res.message || '🎉 Đã lưu mã vào Ví Voucher!');
        setWalletVouchers(prev => [...prev, v]);
        setVouchers(prev =>
          prev.map(item =>
            item.code === v.code ? { ...item, savedByUsers: [...(item.savedByUsers || []), user._id] } : item
          )
        );
      }
    } catch (err) {
      toast.error(err.message || 'Không thể lưu voucher này');
    } finally {
      setClaimingId(null);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã: ${code}`, {
      icon: '📋',
      style: { borderRadius: '16px', background: '#333', color: '#fff' }
    });
    setTimeout(() => {
      if (copiedCode === code) setCopiedCode(null);
    }, 3000);
  };

  const handleUseNow = (code) => {
    toast.success(`Đã chọn mã ${code}. Mời bạn chọn mua sản phẩm!`, { icon: '🛍️' });
    navigate('/shop');
  };

  const handleClaimLucky = () => {
    if (spinning || luckyClaimed) return;
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      setLuckyClaimed(true);
      const dailyList = vouchers.filter(v => v.isDaily || v.tag === 'daily' || v.tag === 'flash');
      const randomV = dailyList.length > 0
        ? dailyList[Math.floor(Math.random() * dailyList.length)]
        : vouchers[0] || { code: 'TODAY100K', title: 'Quà tặng mỗi ngày Giảm 100K' };
      setLuckyVoucher(randomV);
      toast.success('🎉 Chúc mừng bạn đã nhận được voucher đặc quyền hôm nay!');
    }, 1200);
  };

  // Tabs structure
  const tabs = [
    { key: 'all', label: '🌟 Tất Cả Khuyến Mãi', count: vouchers.length },
    { key: 'wallet', label: '💼 Ví Của Tôi', count: walletVouchers.length, highlight: true },
    { key: 'daily', label: '🔥 Flash Sale & Hàng Ngày', count: vouchers.filter(v => v.isDaily || v.tag === 'daily' || v.tag === 'flash').length },
    { key: 'shipping', label: '🚚 Freeship TechPhone', count: vouchers.filter(v => v.tag === 'shipping' || v.discountType === 'freeship' || v.scope === 'platform_freeship').length },
    { key: 'brand', label: '🏷️ Đặc Quyền Hãng', count: vouchers.filter(v => v.tag === 'brand' || v.applicableTo === 'brand' || v.scope === 'shop_discount').length },
    { key: 'default', label: '👑 Hệ Thống TechPhone', count: vouchers.filter(v => !v.isDaily && (v.tag === 'default' || v.tag === 'vip' || v.tag === 'new_user' || v.scope === 'platform_discount')).length },
  ];

  const filteredVouchers = useMemo(() => {
    if (activeTab === 'wallet') {
      if (!user) return [];
      return walletVouchers.filter(v =>
        !searchQuery ||
        v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return vouchers.filter(v => {
      const matchesSearch = !searchQuery ||
        v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === 'all') return true;
      if (activeTab === 'daily') return v.isDaily || v.tag === 'daily' || v.tag === 'flash';
      if (activeTab === 'default') return !v.isDaily && (v.tag === 'default' || v.tag === 'vip' || v.tag === 'new_user' || v.scope === 'platform_discount');
      if (activeTab === 'shipping') return v.tag === 'shipping' || v.discountType === 'freeship' || v.scope === 'platform_freeship';
      if (activeTab === 'brand') return v.tag === 'brand' || v.applicableTo === 'brand' || v.scope === 'shop_discount';
      return true;
    });
  }, [vouchers, walletVouchers, activeTab, searchQuery, user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Breadcrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Kho Voucher & Ưu Đãi TechPhone Store' }]} />

        {/* Hero Banner with Countdown */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary-700 to-primary-600 p-8 sm:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-primary-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" /> Hệ Thống Combo Ưu Đãi TechPhone Store
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Kho Voucher & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">Ví Ưu Đãi</span>
              </h1>
              <p className="text-primary-100 text-sm sm:text-base max-w-xl leading-relaxed">
                Tự do áp dụng <strong className="text-white underline">cộng gộp 3 tầng giảm giá</strong> trên cùng 1 đơn hàng: Freeship TechPhone + Mã Hệ Thống + Mã Đặc Quyền Hãng. Lưu ngay vào Ví để không bỏ lỡ!
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                  <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                  <span className="text-xs font-bold">Làm mới lượt dùng: <strong className="text-amber-300">00:00 Hàng Ngày</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                  <Wallet className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-bold">Ví Voucher: <strong className="text-emerald-300">Lưu Trữ Cá Nhân</strong></span>
                </div>
              </div>
            </div>

            {/* Daily Countdown Box */}
            <div className="lg:col-span-5 bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-inner">
              <div className="flex items-center justify-center gap-2 text-amber-300 font-extrabold text-sm uppercase tracking-wider">
                <Clock className="w-4 h-4 animate-bounce" /> Thời gian làm mới voucher ngày hôm nay:
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                <div className="bg-gray-900/80 rounded-2xl p-3 border border-white/10">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Giờ</p>
                </div>
                <div className="bg-gray-900/80 rounded-2xl p-3 border border-white/10">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Phút</p>
                </div>
                <div className="bg-gray-900/80 rounded-2xl p-3 border border-white/10">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Giây</p>
                </div>
              </div>

              <p className="text-xs text-primary-100">
                ⚡ Các mã Flash Sale & Quà tặng mỗi ngày sẽ được làm mới lượt sử dụng vào đúng 00:00 đêm nay!
              </p>
            </div>
          </div>
        </div>

        {/* Daily Lucky Gift Section */}
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 dark:from-amber-500/5 dark:via-rose-500/5 dark:to-purple-500/5 border-2 border-dashed border-amber-400/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0 mx-auto md:mx-0 animate-bounce">
                <Gift className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Đặc quyền mỗi ngày</span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  🎁 Hộp Quà May Mắn Hôm Nay
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Mở hộp quà để nhận ngẫu nhiên 1 voucher độc quyền với giá trị cực khủng chỉ dành riêng cho bạn hôm nay!
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto text-center">
              {!luckyClaimed ? (
                <button
                  onClick={handleClaimLucky}
                  disabled={spinning}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-rose-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-75 flex items-center justify-center gap-2"
                >
                  {spinning ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Đang quay thưởng...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Nhận Mã May Mắn Ngay
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-700 rounded-2xl p-4 shadow-lg animate-in zoom-in duration-300 flex items-center gap-4">
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase text-gray-400">Mã trúng thưởng của bạn:</span>
                    <div className="text-lg font-black font-mono text-rose-600 dark:text-rose-400">
                      {luckyVoucher?.code || 'TODAY100K'}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                      {luckyVoucher?.title || 'Quà tặng giảm 100.000đ'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(luckyVoucher?.code || 'TODAY100K')}
                    className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 hover:bg-rose-100 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 border border-rose-200 dark:border-rose-800"
                  >
                    <Copy className="w-4 h-4" /> {copiedCode === (luckyVoucher?.code || 'TODAY100K') ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === tab.key
                    ? tab.highlight
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-105'
                      : 'bg-primary-600 text-white shadow-lg shadow-primary/25 scale-105'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm mã hoặc tên ưu đãi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Vouchers Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-gray-500">Đang tải danh sách voucher...</p>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {activeTab === 'wallet' ? 'Ví Voucher của bạn đang trống' : 'Không tìm thấy mã khuyến mãi nào'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {activeTab === 'wallet'
                ? 'Hãy khám phá các mã giảm giá có sẵn trong Kho Voucher và bấm "Lưu vào Ví" để lưu trữ tại đây nhé!'
                : searchQuery
                ? `Không có kết quả nào khớp với từ khóa "${searchQuery}".`
                : 'Danh mục voucher này hiện đang trống hoặc đã hết hạn.'}
            </p>
            {(searchQuery || activeTab === 'wallet') && (
              <button onClick={() => { setSearchQuery(''); setActiveTab('all'); }} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-xs shadow-md transition-all">
                Xem tất cả ưu đãi có sẵn
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVouchers.map((v) => {
              const isCopied = copiedCode === v.code;
              const isDaily = v.isDaily || v.tag === 'daily' || v.tag === 'flash';
              const usedPercentage = Math.min(100, Math.round(((v.usedCount || 0) / (v.usageLimit || 100)) * 100));
              const saved = isSavedInWallet(v);
              const isClaimingThis = claimingId === (v._id || v.code);

              return (
                <div
                  key={v._id || v.code}
                  className={`group relative bg-white dark:bg-gray-900 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col overflow-hidden ${
                    isDaily
                      ? 'border-rose-200 dark:border-rose-900/50 shadow-rose-500/5'
                      : saved
                      ? 'border-emerald-300 dark:border-emerald-800/80 shadow-emerald-500/5'
                      : 'border-gray-100 dark:border-gray-800 shadow-sm'
                  }`}
                >
                  {/* Decorative Coupon Notch Circles */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 z-10" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 z-10" />

                  {/* Card Header & Badge */}
                  <div className="p-6 pb-4 flex items-start justify-between gap-3 border-b border-dashed border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isDaily ? 'bg-rose-50 dark:bg-rose-950/40' : 'bg-primary-50 dark:bg-primary-950/40'
                      }`}>
                        {getDiscountIcon(v.discountType, v.tag, v.scope)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getTagBadge(v)}
                          {saved && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Đã lưu
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-base text-gray-900 dark:text-white mt-1.5 leading-snug group-hover:text-primary-600 transition-colors">
                          {v.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 pt-4 flex-1 flex flex-col justify-between gap-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {v.description || `Giảm giá đặc biệt khi mua sắm tại cửa hàng.`}
                    </p>

                    {/* Payment Method Badge & Min Order */}
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="bg-gray-50 dark:bg-gray-800/40 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-gray-600 dark:text-gray-300">Đơn từ:</span>
                        <strong className="text-gray-900 dark:text-white">
                          {v.minOrderValue > 0 ? formatPrice(v.minOrderValue) : '0đ'}
                        </strong>
                      </div>

                      {v.paymentMethodRestriction && v.paymentMethodRestriction !== 'all' && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800/40 flex items-center gap-1 font-extrabold text-[11px]">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{v.paymentMethodRestriction.toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar for Daily/Flash Vouchers */}
                    {isDaily && (
                      <div className="space-y-1.5 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Đã sử dụng {usedPercentage}%
                          </span>
                          <span className="text-gray-500">Còn {Math.max(0, (v.usageLimit || 100) - (v.usedCount || 0))} lượt</span>
                        </div>
                        <div className="w-full h-2 bg-rose-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${usedPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Code & Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 px-3 py-2.5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-between min-w-0">
                        <span className="font-mono font-black text-xs sm:text-sm text-primary-600 dark:text-primary-400 tracking-wider uppercase truncate pr-1">
                          {v.code}
                        </span>
                        <button
                          onClick={() => handleCopy(v.code)}
                          className="text-[11px] font-extrabold text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm shrink-0"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" /> Đã chép
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Chép mã
                            </>
                          )}
                        </button>
                      </div>

                      {!saved ? (
                        <button
                          onClick={() => handleClaim(v)}
                          disabled={isClaimingThis}
                          className="px-4 py-3 bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1.5"
                        >
                          {isClaimingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bookmark className="w-3.5 h-3.5" />}
                          <span>Lưu Ví</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUseNow(v.code)}
                          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1"
                        >
                          <span>Dùng ngay</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* How to use Vouchers guide */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Quy Tắc Áp Dụng Combo 3 Tầng TechPhone Store</h2>
            <p className="text-xs text-gray-500">
              Tối ưu chi phí mua sắm với mô hình cộng gộp ưu đãi độc quyền trên hệ thống
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Tầng 1: Freeship TechPhone</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Miễn phí vận chuyển lên đến <strong className="text-gray-700 dark:text-gray-300">50.000đ</strong> cho các đơn hàng đạt giá trị tối thiểu hoặc giao hỏa tốc.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Tầng 2: Hệ Thống TechPhone</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Áp dụng 1 mã giảm giá toàn hệ thống (Flash Sale, Quà tặng mỗi ngày, Ưu đãi thanh toán MoMo/VNPay).
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
                <Store className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Tầng 3: Mã Đặc Quyền Hãng</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Mỗi thương hiệu trong giỏ hàng (Apple, Samsung, Xiaomi...) được áp dụng thêm <strong className="text-gray-700 dark:text-gray-300">1 mã riêng biệt</strong>!
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4" /> Khám phá siêu phẩm ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vouchers;
