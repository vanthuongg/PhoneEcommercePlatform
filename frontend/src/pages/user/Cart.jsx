import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../contexts/NotificationContext';
import Breadcrumb from '../../components/ui/Breadcrumb';
import RecentlyViewed from '../../components/product/RecentlyViewed';
import VoucherPickerModal from '../../components/ui/VoucherPickerModal';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Truck, Sparkles, Tag, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const Cart = () => {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const { showConfirm } = useNotification();
  const navigate = useNavigate();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState(localStorage.getItem('appliedVoucher') || '');

  const handleSelectVoucherFromModal = (v) => {
    setAppliedVoucher(v);
    localStorage.setItem('appliedVoucher', v.code);
    toast.success(`Đã áp dụng mã giảm giá ${v.code}!`);
  };
  const [appliedVoucher, setAppliedVoucher] = useState(() => {
    const saved = localStorage.getItem('appliedVoucher');
    if (saved === 'VIPMEMBER500') return { code: 'VIPMEMBER500', discount: 500000, desc: 'Giảm 500k đơn hàng VIP' };
    if (saved === 'TECHPAY200') return { code: 'TECHPAY200', discount: 200000, desc: 'Giảm 200k ưu đãi thanh toán' };
    if (saved === 'WELCOME100') return { code: 'WELCOME100', discount: 100000, desc: 'Giảm 100k thành viên mới' };
    if (saved === 'FREESHIP50') return { code: 'FREESHIP50', discount: 50000, desc: 'Hỗ trợ phí vận chuyển 50k' };
    return null;
  });

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    const cleanCode = voucherCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    if (cleanCode === 'VIPMEMBER500') {
      if (cart.totalPrice < 10000000) {
        toast.error('Mã VIPMEMBER500 áp dụng cho đơn từ 10 triệu');
        return;
      }
      setAppliedVoucher({ code: 'VIPMEMBER500', discount: 500000, desc: 'Giảm 500k đơn hàng VIP' });
      localStorage.setItem('appliedVoucher', 'VIPMEMBER500');
      toast.success('Áp dụng thành công mã giảm giá 500.000đ!');
    } else if (cleanCode === 'TECHPAY200') {
      setAppliedVoucher({ code: 'TECHPAY200', discount: 200000, desc: 'Giảm 200k ưu đãi thanh toán' });
      localStorage.setItem('appliedVoucher', 'TECHPAY200');
      toast.success('Áp dụng thành công mã giảm giá 200.000đ!');
    } else if (cleanCode === 'WELCOME100') {
      setAppliedVoucher({ code: 'WELCOME100', discount: 100000, desc: 'Giảm 100k thành viên mới' });
      localStorage.setItem('appliedVoucher', 'WELCOME100');
      toast.success('Áp dụng thành công mã giảm giá 100.000đ!');
    } else if (cleanCode === 'FREESHIP50') {
      setAppliedVoucher({ code: 'FREESHIP50', discount: 50000, desc: 'Hỗ trợ phí vận chuyển 50k' });
      localStorage.setItem('appliedVoucher', 'FREESHIP50');
      toast.success('Áp dụng thành công mã giảm giá 50.000đ!');
    } else {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn (Thử: WELCOME100, TECHPAY200)');
    }
  };

  const handleRemoveVoucher = () => {
    showConfirm({
      title: 'Hủy áp dụng mã giảm giá?',
      message: 'Bạn có chắc chắn muốn gỡ bỏ mã ưu đãi đang áp dụng cho đơn hàng này?',
      type: 'warning',
      confirmText: 'Đồng ý gỡ',
      cancelText: 'Giữ lại',
      onConfirm: () => {
        setAppliedVoucher(null);
        setVoucherCode('');
        localStorage.removeItem('appliedVoucher');
        toast.info('Đã gỡ bỏ mã giảm giá');
      }
    });
  };

  if (!cart.items?.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <Breadcrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Giỏ hàng' }]} />
          
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 sm:p-16 text-center border border-gray-100 dark:border-gray-800 shadow-sm max-w-xl mx-auto space-y-6">
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto animate-bounce shadow-inner">
              <ShoppingBag size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Giỏ hàng điện thoại đang trống</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bạn chưa chọn mua mẫu smartphone hay phụ kiện nào. Hãy khám phá ngay các ưu đãi công nghệ hấp dẫn hôm nay!</p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-sm shadow-xl shadow-blue-500/30 hover:scale-105 transition-all"
            >
              <span>Khám Phá Siêu Phẩm</span> <ArrowRight size={18} />
            </Link>
          </div>

          <RecentlyViewed />
        </div>
      </div>
    );
  }

  const freeshipThreshold = 300000;
  const isFreeship = cart.totalPrice >= freeshipThreshold;
  const missingForFreeship = Math.max(0, freeshipThreshold - cart.totalPrice);
  const rawShippingFee = isFreeship ? 0 : 30000;
  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const finalTotal = Math.max(0, cart.totalPrice + rawShippingFee - discountAmount);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Giỏ hàng của tôi' }]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-white dark:bg-gray-900 border dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">🛒 Giỏ Hàng Của Bạn ({cart.items.length} sản phẩm)</h1>
          </div>

          {/* Freeship Progress Bar */}
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl px-5 py-3 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300 font-bold shadow-sm">
            <Truck size={20} className="text-amber-600 shrink-0 animate-bounce" />
            {isFreeship ? (
              <span>🎉 Đơn hàng của bạn đạt tiêu chuẩn <strong className="text-emerald-600 dark:text-emerald-400 font-black">MIỄN PHÍ GIAO HÀNG SIÊU TỐC 2H</strong></span>
            ) : (
              <span>Mua thêm <strong className="text-red-600 dark:text-red-400 font-black">{formatPrice(missingForFreeship)}</strong> để được Miễn phí vận chuyển toàn quốc</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item._id || item.product?._id}
                className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-5 items-center transition-all hover:shadow-md"
              >
                <Link to={`/product/${item.product?._id}`} className="shrink-0">
                  <img
                    src={item.product?.images?.[0] || item.product?.image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80'}
                    alt={item.product?.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 shadow-inner"
                  />
                </Link>

                <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                  <Link to={`/product/${item.product?._id}`}>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white hover:text-primary line-clamp-2 leading-snug">
                      {item.product?.name}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {item.color && <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-xl font-bold text-gray-800 dark:text-gray-200">Màu: {item.color}</span>}
                    {item.size && <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-xl font-bold text-gray-800 dark:text-gray-200">ROM: {item.size}</span>}
                  </div>
                  <div className="text-lg font-black text-red-600 dark:text-red-400 pt-1">
                    {formatPrice(item.price)}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-4 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-800">
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 p-1 shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.product?._id, Math.max(1, item.quantity - 1), item.size, item.color)}
                      disabled={loading || item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-40 font-bold"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-xs font-black text-gray-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product?._id, Math.min(item.product?.stock || 99, item.quantity + 1), item.size, item.color)}
                      disabled={loading || item.quantity >= (item.product?.stock || 99)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-40 font-bold"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-gray-900 dark:text-white sm:hidden">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => {
                        showConfirm({
                          title: 'Xóa khỏi giỏ hàng?',
                          message: `Bạn có chắc chắn muốn xóa "${item.product?.name || 'sản phẩm'}" khỏi giỏ hàng?`,
                          type: 'danger',
                          confirmText: 'Xóa ngay',
                          cancelText: 'Quay lại',
                          onConfirm: () => removeItem(item.product?._id, item.size, item.color)
                        });
                      }}
                      disabled={loading}
                      className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            {/* Voucher Box */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                  <Tag size={18} className="text-primary" /> Mã ưu đãi / Voucher
                </h3>
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Chọn voucher
                </button>
              </div>
              
              {appliedVoucher ? (
                <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-black text-primary text-sm">
                      <Check size={16} /> {appliedVoucher.code}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{appliedVoucher.desc}</div>
                  </div>
                  <button onClick={handleRemoveVoucher} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-primary/40 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-primary font-black text-xs flex items-center justify-between transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Tag size={16} className="group-hover:scale-110 transition-transform" /> Nhấn để chọn hoặc nhập mã giảm giá
                  </span>
                  <span className="bg-primary text-white px-2.5 py-1 rounded-xl text-[10px]">Chọn mã</span>
                </button>
              )}
            </div>

            {/* Total Box */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <Sparkles size={20} className="text-primary" /> Thanh Toán Đơn Hàng
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính sản phẩm:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatPrice(cart.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Phí vận chuyển:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {isFreeship ? <span className="text-emerald-600 font-extrabold">MIỄN PHÍ</span> : formatPrice(rawShippingFee)}
                  </span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Voucher ({appliedVoucher.code}):</span>
                    <span>-{formatPrice(appliedVoucher.discount)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 flex justify-between items-baseline">
                  <span className="font-bold text-base text-gray-900 dark:text-white">Tổng thanh toán:</span>
                  <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => navigate('/checkout', { state: { appliedVoucher, finalTotal } })}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-base shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>Tiến Hành Đặt Hàng</span> <ArrowRight size={18} />
                </button>
                <Link
                  to="/shop"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center transition-colors hover:bg-gray-200"
                >
                  Tiếp tục chọn thêm máy khác
                </Link>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2 font-semibold text-emerald-600 justify-center">
                  <ShieldCheck size={16} /> Bảo mật thông tin đặt hàng & thanh toán 100%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed */}
        <RecentlyViewed />
      </div>

      <VoucherPickerModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onSelect={handleSelectVoucherFromModal}
        currentVoucherCode={appliedVoucher?.code}
        orderTotal={cart.totalPrice}
      />
    </div>
  );
};

export default Cart;
