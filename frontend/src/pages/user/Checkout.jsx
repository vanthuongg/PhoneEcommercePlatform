import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderAPI } from '../../services/api';
import Breadcrumb from '../../components/ui/Breadcrumb';
import VoucherPickerModal from '../../components/ui/VoucherPickerModal';
import { Package, ArrowLeft, Loader2, CheckCircle2, Home, FileText, ShieldCheck, Truck, Tag, Sparkles, CreditCard, DollarSign, Gift, Store, Check, X, Copy, Clock, Calendar, MapPin, Phone, User, ShoppingBag, ArrowRight, Shield, Award, Zap, ChevronRight, HelpCircle, HeartHandshake } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const Checkout = () => {
  const {
    cart,
    clearCart,
    appliedVouchers = { freeship: null, platform: null, shop: {} },
    shippingFee = 0,
    discountAmount = 0,
    freeshipDiscount = 0,
    platformDiscount = 0,
    shopDiscount = 0,
    totalDiscountAll = 0,
    finalTotal = 0,
    applyVoucherStack,
    removeVoucher,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyOrderCode = () => {
    if (!successOrder) return;
    const code = successOrder.orderCode || successOrder._id?.slice(-6).toUpperCase();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('🎉 Đã sao chép mã đơn hàng!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Lấy danh sách thương hiệu từ cart
  const cartBrands = useMemo(() => {
    const brands = (cart.items || []).map(item => item.product?.brand).filter(Boolean);
    return [...new Set(brands)];
  }, [cart.items]);

  const getBrandDiscount = (brandName, v) => {
    if (!v) return 0;
    if (v.discountAmount || v.discount) return v.discountAmount || v.discount;
    const brandItems = (cart.items || []).filter(item => 
      item.product?.brand?.toLowerCase() === brandName?.toLowerCase() || 
      item.brand?.toLowerCase() === brandName?.toLowerCase()
    );
    const brandSubtotal = brandItems.length > 0
      ? brandItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
      : (cart.items || []).reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    
    let disc = 0;
    if (v.discountType === 'percentage') {
      disc = Math.round((brandSubtotal * (v.discountValue || 0)) / 100);
      if (v.maxDiscountAmount && disc > v.maxDiscountAmount) disc = v.maxDiscountAmount;
    } else {
      disc = Math.min(v.discountValue || 0, brandSubtotal);
    }
    return disc;
  };

  const [form, setForm] = useState({
    name: user?.addresses?.[0]?.name || user?.name || '',
    email: user?.email || '',
    phone: user?.addresses?.[0]?.phone || user?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    ward: user?.addresses?.[0]?.ward || '',
    district: user?.addresses?.[0]?.district || '',
    city: user?.addresses?.[0]?.city || 'TP. Hồ Chí Minh',
    paymentMethod: 'cod',
    note: '',
  });

  const isFreeshipEligible = cart.totalPrice >= 300000;
  const rawShippingFee = isFreeshipEligible ? 0 : 30000;

  const hasAnyVoucher =
    appliedVouchers?.freeship ||
    appliedVouchers?.platform ||
    Object.keys(appliedVouchers?.shop || {}).length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.street || !form.city) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng');
      return;
    }
    if (!cart.items?.length) {
      toast.error('Giỏ hàng trống');
      return;
    }
    setLoading(true);
    try {
      // Build danh sách voucher đã chọn cho backend chuẩn Shopee
      const vouchersList = [];
      if (appliedVouchers.freeship) {
        vouchersList.push({
          code: appliedVouchers.freeship.code,
          scope: 'platform_freeship',
          discountAmount: freeshipDiscount || 30000,
        });
      }
      if (appliedVouchers.platform) {
        vouchersList.push({
          code: appliedVouchers.platform.code,
          scope: 'platform_discount',
          discountAmount: platformDiscount,
        });
      }
      Object.entries(appliedVouchers.shop || {}).forEach(([brand, v]) => {
        if (v) {
          vouchersList.push({
            code: v.code,
            scope: 'shop_discount',
            discountAmount: getBrandDiscount(brand, v),
            brand,
          });
        }
      });

      const fallbackCode =
        appliedVouchers.platform?.code ||
        appliedVouchers.freeship?.code ||
        Object.values(appliedVouchers.shop || {})[0]?.code ||
        '';

      const res = await orderAPI.create({
        shippingAddress: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          street: form.street,
          ward: form.ward,
          district: form.district,
          city: form.city,
        },
        paymentMethod: form.paymentMethod,
        note: form.note,
        voucherCode: fallbackCode,
        appliedVouchers: vouchersList,
      });

      await clearCart();
      setSuccessOrder(res.data);
      toast.success('🎉 Đặt hàng thành công!');
    } catch (err) {
      toast.error(err.message || 'Lỗi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    const orderCode = successOrder.orderCode || successOrder._id?.slice(-6).toUpperCase() || 'ORDER';
    const itemsSubtotal = successOrder.itemsTotal || (successOrder.items || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const shippingFeeVal = successOrder.shippingFee || 0;
    const totalDiscountVal = (successOrder.discount || 0) + (successOrder.freeshipDiscount || 0);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-6 sm:py-10 px-4 transition-colors relative overflow-hidden font-sans flex items-center justify-center">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-primary-500/10 dark:bg-primary-500/15 rounded-full blur-[100px] pointer-events-none animate-float-slow" />

        {/* Compact Main Container */}
        <div className="w-full max-w-4xl mx-auto space-y-6 relative z-10">
          
          {/* Hero Celebration Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-premium text-center relative overflow-hidden animate-scale-in">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-primary-600" />
            
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Icon */}
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-ping opacity-25" />
                <div className="relative w-16 h-16 bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/10 mx-auto">
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-spin-slow" />
                  <CheckCircle2 size={32} className="drop-shadow-sm" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-black tracking-wider uppercase border border-emerald-200/60 dark:border-emerald-800/60">
                  <Zap size={12} className="fill-emerald-500" />
                  <span>Đơn Hàng Đã Xử Lý Thành Công</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Cảm Ơn Bạn Đã Đặt Hàng! 🎉
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto">
                  Hệ thống TechPhone Store đã ghi nhận đơn hàng. Chúng tôi đang chuẩn bị giao siêu tốc 2H đến tận tay bạn.
                </p>
              </div>

              {/* Order Code & Delivery Badge */}
              <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
                <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-3.5 py-2 rounded-xl text-xs shadow-2xs">
                  <span className="font-bold text-slate-400">Mã đơn:</span>
                  <span className="font-mono font-black text-primary-600 dark:text-primary-400">
                    #{orderCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOrderCode}
                    className="p-1 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-95 shadow-2xs ml-0.5"
                    title="Sao chép"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-xl text-xs font-extrabold">
                  <Truck size={14} className="animate-bounce-subtle" />
                  <span>Giao hỏa tốc 2H</span>
                </div>
              </div>

              {/* Compact Timeline Stepper */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80">
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col items-center text-center p-2 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-[10px] mb-1">
                      <Check size={12} />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">Đã đặt hàng</span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400">Vừa xong</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2 rounded-xl bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20 animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center font-black text-[10px] mb-1">
                      <Clock size={12} className="animate-spin-slow" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">Đang đóng gói</span>
                    <span className="text-[9px] text-primary-600 dark:text-primary-400">Xử lý</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 opacity-60">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-black text-[10px] mb-1">
                      <Truck size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Giao 2H</span>
                    <span className="text-[9px] text-slate-400">Chờ giao</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 opacity-60">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-black text-[10px] mb-1">
                      <Gift size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Nhận hàng</span>
                    <span className="text-[9px] text-slate-400">Hoàn tất</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Compact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left: Items & Info (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Order Items */}
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-primary-600 dark:text-primary-400" />
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Sản Phẩm Đã Đặt ({successOrder.items?.length || 0})</h2>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-500">Bảo hành 24T</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {(successOrder.items || []).map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                      <img
                        src={item.image || 'https://via.placeholder.com/60'}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.color && <span>{item.color}</span>}
                          {item.color && item.size && <span>•</span>}
                          {item.size && <span>{item.size}</span>}
                          <span>•</span>
                          <span className="font-bold">SL: x{item.quantity || 1}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Payment Info */}
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <MapPin size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">Thông Tin Nhận Hàng & Thanh Toán</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block">Người nhận</span>
                    <p className="font-black text-slate-900 dark:text-white text-sm">
                      {successOrder.shippingAddress?.name}
                    </p>
                    <p className="font-medium text-slate-600 dark:text-slate-300">
                      📞 {successOrder.shippingAddress?.phone}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                      📍 {[successOrder.shippingAddress?.street, successOrder.shippingAddress?.ward, successOrder.shippingAddress?.district, successOrder.shippingAddress?.city].filter(Boolean).join(', ')}
                    </p>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block mb-1">Thanh toán</span>
                      <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-2">
                        <CreditCard size={14} className="text-primary-500 shrink-0" />
                        <span className="truncate">
                          {successOrder.paymentMethod === 'cod' ? 'Tiền mặt (COD)' :
                           successOrder.paymentMethod === 'bank_transfer' ? 'Chuyển khoản QR' :
                           successOrder.paymentMethod === 'momo' ? 'Ví MoMo' : 'VNPay'}
                        </span>
                      </div>
                    </div>
                    {successOrder.note && (
                      <p className="text-[11px] italic text-slate-500 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/50">
                        "{successOrder.note}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Summary & Actions (5 cols) */}
            <div className="md:col-span-5 space-y-6">
              
              {/* Receipt Summary Card */}
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-premium relative overflow-hidden space-y-4">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-600 via-indigo-600 to-emerald-500" />
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText size={16} className="text-amber-500" /> Tổng Kết Hóa Đơn
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">#{orderCode}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Tạm tính:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(itemsSubtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Phí vận chuyển:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {shippingFeeVal === 0 ? 'Miễn phí (0đ)' : formatPrice(shippingFeeVal)}
                    </span>
                  </div>

                  {successOrder.appliedVouchers && successOrder.appliedVouchers.length > 0 && (
                    <div className="pt-1 space-y-1">
                      {successOrder.appliedVouchers.map((v, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] bg-primary-500/5 px-2.5 py-1.5 rounded-lg border border-primary-500/15">
                          <span className="font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                            <Gift size={12} /> {v.code}
                          </span>
                          <span className="font-bold text-emerald-600">-{formatPrice(v.discountAmount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {totalDiscountVal > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                      <span>Giảm giá:</span>
                      <span>-{formatPrice(totalDiscountVal)}</span>
                    </div>
                  )}
                </div>

                {/* Dashed line */}
                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-2" />

                {/* Total Amount */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center space-y-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Tổng Thanh Toán
                  </span>
                  <div className="text-2xl font-black bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 dark:from-red-400 dark:via-rose-400 dark:to-amber-400 bg-clip-text text-transparent">
                    {formatPrice(successOrder.totalAmount)}
                  </div>
                  <p className="text-[10px] text-slate-400">(Đã bao gồm VAT & Miễn phí Giao 2H)</p>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-1">
                  <Link
                    to="/profile?tab=orders"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-primary-500/25 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={16} /> 
                    <span>Theo Dõi Đơn Hàng</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    to="/shop"
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs border border-slate-200 dark:border-slate-700 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} className="text-amber-500" />
                    <span>Tiếp Tục Mua Sắm</span>
                  </Link>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 text-center space-y-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto" />
                  <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">Bảo Hành 24T</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 text-center space-y-1">
                  <Truck className="w-5 h-5 text-primary-500 mx-auto" />
                  <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">Giao Hỏa Tốc</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 text-center space-y-1">
                  <HeartHandshake className="w-5 h-5 text-rose-500 mx-auto" />
                  <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">Đổi Trả 30N</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }

  if (!cart.items?.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 transition-colors">
        <div className="text-center bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-md">
          <p className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Giỏ hàng của bạn đang trống</p>
          <Link to="/shop" className="px-6 py-3 bg-primary text-white rounded-2xl font-bold inline-flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Quay lại chọn điện thoại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Giỏ hàng', link: '/cart' }, { label: 'Thanh toán đơn hàng' }]} />

        <div className="flex items-center gap-3">
          <Link to="/cart" className="p-2.5 rounded-2xl bg-white dark:bg-gray-900 border dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 shadow-sm">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">📦 Tiến Hành Đặt Hàng & Thanh Toán</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Payment (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">1</div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">📍 Địa Chỉ Nhận Hàng (Giao siêu tốc 2H)</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Họ & Tên <span className="text-red-500">*</span></label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
                      placeholder="Nguyễn Văn An"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
                      placeholder="0901234567"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Địa chỉ cụ thể (Số nhà, tên đường) <span className="text-red-500">*</span></label>
                    <input
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
                      placeholder="Số 123 Đường Nguyễn Huệ..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Phường / Xã</label>
                    <input
                      value={form.ward}
                      onChange={(e) => setForm({ ...form, ward: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
                      placeholder="Phường Bến Nghé"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Quận / Huyện</label>
                    <input
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
                      placeholder="Quận 1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
                      placeholder="TP. Hồ Chí Minh"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Ghi chú cho shipper</label>
                    <textarea
                      rows={2}
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary text-sm font-medium text-gray-900 dark:text-white resize-none focus:outline-none"
                      placeholder="Gọi trước 15 phút, đồng kiểm tra máy nguyên seal trước khi nhận..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">2</div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">💳 Phương Thức Thanh Toán</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: 'cod', label: 'Thanh toán tiền mặt khi nhận hàng (COD)', desc: 'Kiểm tra máy nguyên seal trước khi trả tiền', emoji: '💵' },
                    { value: 'bank_transfer', label: 'Chuyển khoản QR Bank 24/7', desc: 'Giảm thêm hoặc ưu đãi quà tặng (tự động duyệt)', emoji: '🏦' },
                    { value: 'momo', label: 'Ví điện tử MoMo', desc: 'Quét mã QR qua app MoMo siêu nhanh', emoji: '📱' },
                    { value: 'vnpay', label: 'Cổng thanh toán VNPay ATM/Visa', desc: 'Hỗ trợ trả góp 0% qua thẻ tín dụng', emoji: '🔐' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-start gap-4 p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                        form.paymentMethod === method.value
                          ? 'border-primary bg-primary/5 dark:bg-primary-900/20 shadow-md scale-[1.01]'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 bg-gray-50/50 dark:bg-gray-800/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={form.paymentMethod === method.value}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                        className="mt-1 text-primary focus:ring-primary"
                      />
                      <span className="text-3xl shrink-0">{method.emoji}</span>
                      <div>
                        <div className="text-sm font-black text-gray-900 dark:text-white">{method.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (4 cols) */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <div className="pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">🛍️ Đơn Hàng ({cart.items.length})</h2>
                  <Link to="/cart" className="text-xs text-primary hover:underline font-bold">Quay lại giỏ</Link>
                </div>

                {/* Items List */}
                <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-100 dark:divide-gray-800">
                  {cart.items.map((item) => (
                    <div key={item._id || item.product?._id} className="flex gap-3 items-center pt-3 first:pt-0">
                      <img
                        src={item.product?.images?.[0] || item.product?.image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border dark:border-gray-700 bg-gray-50"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{item.product?.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">SL: {item.quantity} {item.size ? `• ${item.size}` : ''} {item.color ? `• ${item.color}` : ''}</p>
                      </div>
                      <span className="text-xs font-black text-gray-900 dark:text-white shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Voucher selection from Checkout - 3 layers */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Gift size={15} className="text-primary-600" /> TechPhone Voucher (3 Tầng)
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsVoucherModalOpen(true)}
                      className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
                    >
                      {hasAnyVoucher ? 'Thay đổi combo' : 'Chọn voucher'}
                    </button>
                  </div>

                  {hasAnyVoucher ? (
                    <div className="space-y-2 pt-1">
                      {appliedVouchers?.freeship && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3 flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 min-w-0">
                            <Truck size={15} className="text-emerald-600 shrink-0" />
                            <span className="truncate">{appliedVouchers.freeship.code} (Freeship TechPhone)</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-emerald-600">-{formatPrice(freeshipDiscount || 30000)}</span>
                            <button type="button" onClick={() => removeVoucher && removeVoucher('freeship')} className="text-gray-400 hover:text-red-500">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {appliedVouchers?.platform && (
                        <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/60 rounded-2xl p-3 flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2 text-primary-800 dark:text-primary-300 min-w-0">
                            <Tag size={15} className="text-primary-600 shrink-0" />
                            <span className="truncate">{appliedVouchers.platform.code} (Hệ Thống TechPhone)</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-primary-600">-{formatPrice(platformDiscount)}</span>
                            <button type="button" onClick={() => removeVoucher && removeVoucher('platform')} className="text-gray-400 hover:text-red-500">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {Object.entries(appliedVouchers?.shop || {}).map(([brand, v]) => {
                        if (!v) return null;
                        return (
                          <div key={brand} className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-3 flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 min-w-0">
                              <Store size={15} className="text-indigo-600 shrink-0" />
                              <span className="truncate">{v.code} ({brand})</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-indigo-600">-{formatPrice(getBrandDiscount(brand, v))}</span>
                              <button type="button" onClick={() => removeVoucher && removeVoucher('shop', brand)} className="text-gray-400 hover:text-red-500">
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsVoucherModalOpen(true)}
                      className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 text-primary-600 dark:text-primary-400 font-black text-xs flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-1.5">
                        <Gift size={16} className="text-primary-600" /> Chọn hoặc nhập mã combo 3 tầng
                      </span>
                      <span className="bg-primary-600 text-white px-2.5 py-1 rounded-xl text-[10px]">Chọn mã</span>
                    </button>
                  )}
                </div>

                {/* Final Calculation */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tạm tính sản phẩm:</span> <span className="font-bold text-gray-900 dark:text-white">{formatPrice(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Phí vận chuyển:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {rawShippingFee === 0 ? <span className="text-emerald-600 font-extrabold">0đ (Freeship)</span> : formatPrice(rawShippingFee)}
                    </span>
                  </div>
                  {freeshipDiscount > 0 && rawShippingFee > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold text-xs">
                      <span>• Freeship TechPhone:</span> <span>-{formatPrice(freeshipDiscount)}</span>
                    </div>
                  )}
                  {platformDiscount > 0 && (
                    <div className="flex justify-between text-primary-600 font-bold text-xs">
                      <span>• Voucher Hệ Thống:</span> <span>-{formatPrice(platformDiscount)}</span>
                    </div>
                  )}
                  {shopDiscount > 0 && (
                    <div className="flex justify-between text-indigo-600 font-bold text-xs">
                      <span>• Voucher Thương hiệu:</span> <span>-{formatPrice(shopDiscount)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-dashed border-gray-200 dark:border-gray-800 flex justify-between items-baseline">
                    <span className="font-bold text-base text-gray-900 dark:text-white">Tổng thanh toán:</span>
                    <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white font-black text-base shadow-xl shadow-primary/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                  <span>{loading ? 'Đang Xử Lý...' : 'Xác Nhận Hoàn Tất Đặt Hàng'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <VoucherPickerModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onSelectStack={(stack) => applyVoucherStack && applyVoucherStack(stack)}
        appliedVouchers={appliedVouchers}
        orderTotal={cart.totalPrice}
        cartBrands={cartBrands}
        paymentMethod={form.paymentMethod}
      />
    </div>
  );
};

export default Checkout;
