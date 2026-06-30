import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderAPI } from '../../services/api';
import Breadcrumb from '../../components/ui/Breadcrumb';
import VoucherPickerModal from '../../components/ui/VoucherPickerModal';
import { Package, ArrowLeft, Loader2, CheckCircle2, Home, FileText, ShieldCheck, Truck, Tag, Sparkles, CreditCard, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const [appliedVoucher, setAppliedVoucher] = useState(() =>
    location.state?.appliedVoucher || null
  );

  // Lấy danh sách brand từ cart để validate brand-specific vouchers
  const cartBrands = [...new Set((cart.items || []).map(item => item.product?.brand).filter(Boolean))];

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

  const isAutoFreeship = cart.totalPrice >= 300000;
  const rawShippingFee = isAutoFreeship ? 0 : 30000;
  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const totalAmount = Math.max(0, cart.totalPrice + rawShippingFee - discountAmount);

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
        voucherCode: appliedVoucher?.code || '',
      });
      await clearCart();
      localStorage.removeItem('appliedVoucher');
      toast.success('🎉 Đặt hàng thành công!');
      setSuccessOrder(res.data);
    } catch (err) {
      toast.error(err.message || 'Lỗi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10 text-center relative overflow-hidden space-y-6">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/40 rounded-full animate-ping opacity-75" />
            <div className="relative w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mx-auto">
              <CheckCircle2 size={40} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              🎉 Đặt Hàng Điện Thoại Thành Công!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Cảm ơn bạn đã lựa chọn mua sắm tại TechPhone. Đơn hàng của bạn đang được hệ thống xác nhận và chuẩn bị đóng gói giao siêu tốc 2H.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-5 text-left space-y-3 border border-gray-100 dark:border-gray-800 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500">Mã đơn hàng:</span>
              <span className="font-mono font-black text-primary text-base">
                #{successOrder.orderCode || successOrder._id?.slice(-6).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Người nhận:</span>
              <span className="font-bold text-gray-900 dark:text-white">{successOrder.shippingAddress?.name} ({successOrder.shippingAddress?.phone})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Thanh toán:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {successOrder.paymentMethod === 'cod' ? '💵 Tiền mặt khi nhận hàng (COD)' :
                 successOrder.paymentMethod === 'bank_transfer' ? '🏦 Chuyển khoản QR Bank' :
                 successOrder.paymentMethod === 'momo' ? '📱 Ví điện tử MoMo' : '🔐 Cổng VNPay ATM'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="font-bold text-gray-700 dark:text-gray-300">Tổng tiền đã đặt:</span>
              <span className="text-lg font-black text-red-600 dark:text-red-400">
                {formatPrice(successOrder.totalAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/profile?tab=orders"
              className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 text-sm"
            >
              <FileText size={18} /> Theo Dõi Trạng Thái Đơn
            </Link>
            <Link
              to="/"
              className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Home size={18} className="text-gray-500" /> Về Trang Chủ
            </Link>
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

                {/* Voucher selection from Checkout */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag size={15} className="text-primary" /> Khuyến mãi đã chọn
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsVoucherModalOpen(true)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Chọn voucher khác
                    </button>
                  </div>

                  {appliedVoucher ? (
                    <div className="p-3 bg-primary/10 border border-primary/30 rounded-2xl text-xs font-bold text-primary flex items-center justify-between">
                      <span>Mã {appliedVoucher.code} ({appliedVoucher.desc})</span>
                      <div className="flex items-center gap-2">
                        <span>-{formatPrice(appliedVoucher.discount)}</span>
                        <button type="button" onClick={() => { setAppliedVoucher(null); localStorage.removeItem('appliedVoucher'); }} className="text-red-500 hover:underline text-[10px]">Bỏ</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsVoucherModalOpen(true)}
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-primary/40 bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50 text-primary font-bold text-xs flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-1.5">
                        <Tag size={15} /> Nhấn để chọn mã giảm giá từ kho
                      </span>
                      <span className="bg-primary text-white px-2 py-0.5 rounded-lg text-[10px]">Chọn mã</span>
                    </button>
                  )}
                </div>

                {/* Final Calculation */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tạm tính:</span> <span className="font-bold text-gray-900 dark:text-white">{formatPrice(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Phí vận chuyển:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {rawShippingFee === 0 ? <span className="text-emerald-600 font-extrabold">0đ (Freeship)</span> : formatPrice(rawShippingFee)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Voucher ưu đãi:</span> <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-dashed border-gray-200 dark:border-gray-800 flex justify-between items-baseline">
                    <span className="font-bold text-base text-gray-900 dark:text-white">Tổng thanh toán:</span>
                    <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-base shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
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
        onSelect={(v) => {
          setAppliedVoucher(v);
          toast.success(`✅ Đã áp dụng mã "${v.code}" - Giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.discount)}`);
        }}
        currentVoucherCode={appliedVoucher?.code}
        orderTotal={cart.totalPrice}
        cartBrands={cartBrands}
      />
    </div>
  );
};

export default Checkout;
