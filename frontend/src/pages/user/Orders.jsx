import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { Package, CheckCircle, Clock, XCircle, Truck, ChevronRight, ArrowLeft, ShoppingBag, AlertTriangle, ShieldCheck, FileText, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', icon: Clock, step: 1 },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: CheckCircle, step: 2 },
  processing: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300', icon: Package, step: 3 },
  shipping: { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', icon: Truck, step: 4 },
  delivered: { label: 'Giao thành công', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle, step: 5 },
  cancelled: { label: 'Đã hủy đơn', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: XCircle, step: 0 },
};

const timelineSteps = [
  { id: 'placed', label: 'Đặt hàng thành công', step: 1 },
  { id: 'confirmed', label: 'Hệ thống xác nhận', step: 2 },
  { id: 'processing', label: 'Đang đóng gói', step: 3 },
  { id: 'shipping', label: 'Đang giao hàng', step: 4 },
  { id: 'delivered', label: 'Giao thành công', step: 5 },
];

const Orders = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showConfirm } = useNotification();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { key: 'all', label: '📋 Tất cả' },
    { key: 'pending', label: '⏳ Chờ xác nhận' },
    { key: 'confirmed', label: '✓ Đã xác nhận' },
    { key: 'processing', label: '📦 Đang xử lý' },
    { key: 'shipping', label: '🚚 Đang giao' },
    { key: 'delivered', label: '🎉 Đã giao' },
    { key: 'cancelled', label: '❌ Đã hủy' },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getAll({ limit: 50 });
        const list = res.data || [];
        setOrders(list);
        if (id) {
          const detail = await orderAPI.getById(id).catch(() => null);
          if (detail?.data) setSelectedOrder(detail.data);
          else setSelectedOrder(list.find((o) => o._id === id) || null);
        } else {
          setSelectedOrder(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [id]);

  const handleCancelOrder = async (orderId) => {
    showConfirm({
      title: 'Xác nhận hủy đơn hàng?',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này? Thao tác hủy sẽ không thể hoàn tác.',
      type: 'danger',
      confirmText: 'Đồng ý hủy đơn',
      cancelText: 'Giữ lại đơn',
      onConfirm: async () => {
        try {
          await orderAPI.cancel(orderId, 'Khách hàng yêu cầu hủy đơn');
          toast.success('Đã hủy đơn hàng thành công');
          setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o)));
          if (selectedOrder?._id === orderId) {
            setSelectedOrder({ ...selectedOrder, orderStatus: 'cancelled' });
          }
        } catch (err) {
          toast.error(err.message || 'Không thể hủy đơn hàng');
        }
      }
    });
  };

  const filteredOrders = activeTab === 'all' ? orders : orders.filter((o) => o.orderStatus === activeTab);

  if (selectedOrder) {
    const currentStepNum = statusConfig[selectedOrder.orderStatus]?.step || 1;
    const isCancelled = selectedOrder.orderStatus === 'cancelled';
    const isOrderPaid = selectedOrder.paymentStatus === 'paid' || selectedOrder.isPaid || selectedOrder.orderStatus === 'delivered';

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <Breadcrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Đơn hàng của tôi', link: '/orders' }, { label: `#${selectedOrder.orderCode || selectedOrder._id.slice(-6).toUpperCase()}` }]} />

          {/* Top Navigation & Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedOrder(null); navigate('/orders'); }}
                className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-600 transition-all shadow-xs shrink-0"
                title="Quay lại danh sách"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                    #{selectedOrder.orderCode || selectedOrder._id.slice(-6).toUpperCase()}
                  </h1>
                  <span className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border shadow-2xs ${statusConfig[selectedOrder.orderStatus]?.color || 'bg-slate-100 text-slate-700'}`}>
                    {statusConfig[selectedOrder.orderStatus]?.label || selectedOrder.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>Đặt lúc: <strong className="text-slate-700 dark:text-slate-300 font-bold">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Link to="/shop" className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
                <ShoppingBag size={14} /> <span>Mua thêm</span>
              </Link>
            </div>
          </div>

          {/* 2-Column Responsive Layout (Fit Screen Frame) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Timeline & Products (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Compact Timeline */}
              {!isCancelled ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      <span>Tiến Trình Đơn Hàng</span>
                    </h3>
                    <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 rounded-md">
                      Bước {currentStepNum} / 5
                    </span>
                  </div>

                  <div className="py-2 grid grid-cols-5 gap-2 relative">
                    {timelineSteps.map((s, idx) => {
                      const isCompleted = currentStepNum >= s.step;
                      const isCurrent = currentStepNum === s.step;
                      return (
                        <div key={s.id} className="flex flex-col items-center text-center relative z-10 group">
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                              isCompleted
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20 scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                            } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110 animate-pulse' : ''}`}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[10px] sm:text-[11px] font-bold mt-2 leading-tight line-clamp-2 ${
                            isCompleted ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-3xl p-5 flex items-center gap-3 text-red-700 dark:text-red-300 shadow-sm">
                  <AlertTriangle size={24} className="shrink-0 text-red-500 animate-bounce-slow" />
                  <div>
                    <p className="font-extrabold text-sm">Đơn hàng này đã bị hủy</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 font-medium">
                      Nếu bạn đã thanh toán trước qua Ngân hàng/VNPay, số tiền sẽ được hoàn vào tài khoản của bạn trong 3-5 ngày làm việc.
                    </p>
                  </div>
                </div>
              )}

              {/* Items List (Compact & Rich) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-500" />
                    <span>Sản Phẩm Đã Mua ({selectedOrder.items?.length || 0})</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {selectedOrder.items?.reduce((sum, item) => sum + (item.quantity || 1), 0)} sản phẩm
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={item._id || idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-14 h-14 rounded-2xl object-cover bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/product/${item.product?._id || item.product}`}
                            className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1 block"
                          >
                            {item.name}
                          </Link>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>SL: <strong className="text-slate-900 dark:text-white font-bold">{item.quantity}</strong></span>
                            {item.size && <span>• Size/Dung lượng: <strong className="text-slate-700 dark:text-slate-300 font-bold">{item.size}</strong></span>}
                            {item.color && <span>• Màu: <strong className="text-slate-700 dark:text-slate-300 font-bold">{item.color}</strong></span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white block">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatPrice(item.price)} / món
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Payment & Shipping Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-5">
              {/* Payment & Status Card (Fixed Payment Status Bug!) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Thanh Toán & Trạng Thái</span>
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    isOrderPaid
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {isOrderPaid ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Phương thức:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {selectedOrder.paymentMethod === 'cod' ? 'Tiền mặt (COD)' : selectedOrder.paymentMethod === 'vnpay' ? 'VNPay QR Bank' : 'Chuyển khoản QR'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Tình trạng TT:</span>
                    <strong className={isOrderPaid ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-amber-600 dark:text-amber-400 font-extrabold'}>
                      {isOrderPaid ? '✓ Đã hoàn tất thanh toán' : '⏳ Thanh toán khi nhận hàng'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Cập nhật lúc:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {new Date(selectedOrder.updatedAt || selectedOrder.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedOrder.updatedAt || selectedOrder.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-3.5 border-t border-dashed border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Tạm tính tiền hàng:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatPrice(selectedOrder.itemsTotal || selectedOrder.totalAmount - (selectedOrder.shippingFee || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Phí vận chuyển:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedOrder.shippingFee === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">0đ (Freeship)</span>
                      ) : (
                        formatPrice(selectedOrder.shippingFee || 30000)
                      )}
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Giảm giá voucher:</span>
                      <span className="font-bold">-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                    <span className="font-black text-sm text-slate-900 dark:text-white">Tổng thanh toán:</span>
                    <span className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 leading-none font-mono">
                      {formatPrice(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Địa Chỉ Nhận Hàng</span>
                </h3>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Người nhận:</span>
                    <strong className="text-slate-900 dark:text-white font-extrabold">{selectedOrder.shippingAddress?.name}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Điện thoại:</span>
                    <strong className="text-slate-900 dark:text-white font-mono font-bold">{selectedOrder.shippingAddress?.phone}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[180px] font-medium">{selectedOrder.shippingAddress?.email}</span>
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Địa chỉ giao hàng:</span>
                    <strong className="text-slate-900 dark:text-white leading-relaxed block font-medium">
                      {[selectedOrder.shippingAddress?.street, selectedOrder.shippingAddress?.ward, selectedOrder.shippingAddress?.district, selectedOrder.shippingAddress?.city].filter(Boolean).join(', ')}
                    </strong>
                  </div>
                  {selectedOrder.note && (
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block mb-0.5">Ghi chú của bạn:</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                        "{selectedOrder.note}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {['pending', 'confirmed'].includes(selectedOrder.orderStatus) && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder._id)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 font-extrabold text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-800/60 shadow-sm active:scale-98"
                >
                  <AlertTriangle size={16} /> <span>Hủy Đơn Hàng Này</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Breadcrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Đơn hàng của tôi' }]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Package className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              <span>Đơn Hàng Của Tôi</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Theo dõi trạng thái giao hàng và lịch sử mua sắm điện thoại tại TechPhone</p>
          </div>
          <Link to="/shop" className="btn-primary self-start sm:self-auto inline-flex items-center gap-2 text-xs font-bold px-5 py-3.5 rounded-2xl shadow-lg shadow-primary-500/20">
            <ShoppingBag size={16} /> <span>Mua Sắm Thêm</span>
          </Link>
        </div>

        {/* Tabs Filter */}
        <div className="flex gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto shadow-sm scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List orders */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse h-36" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mx-auto text-primary-600 dark:text-primary-400 shadow-inner">
              <Package size={40} className="animate-bounce-slow" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Chưa có đơn hàng nào trong mục này</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-medium">Hãy bắt đầu hành trình mua sắm và săn ngàn ưu đãi công nghệ tại TechPhone ngay hôm nay!</p>
            <Link to="/shop" className="btn-primary px-6 py-3.5 rounded-2xl font-bold inline-flex items-center gap-2 text-xs shadow-lg shadow-primary-500/20">
              <ShoppingBag size={16} /> <span>Khám Phá Cửa Hàng</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = statusConfig[order.orderStatus] || { label: order.orderStatus, color: 'bg-slate-100 text-slate-700 border-slate-200' };
              const firstItem = order.items?.[0];
              const otherCount = (order.items?.length || 1) - 1;
              const isOrderPaid = order.paymentStatus === 'paid' || order.isPaid || order.orderStatus === 'delivered';

              return (
                <div
                  key={order._id}
                  onClick={() => { setSelectedOrder(order); navigate(`/orders/${order._id}`); }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all cursor-pointer group space-y-4 hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition-transform">
                        <Package size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            #{order.orderCode || order._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                            {order.items?.length || 1} món
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Clock size={11} /> Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-2xs ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="py-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {firstItem ? (
                        <>
                          <img
                            src={firstItem.image || firstItem.product?.images?.[0] || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-14 h-14 rounded-2xl object-cover bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                              {firstItem.name || firstItem.product?.name || 'Sản phẩm công nghệ'}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>SL: <strong className="text-slate-700 dark:text-slate-300 font-bold">{firstItem.quantity || 1}</strong></span>
                              {firstItem.price && <span>• Giá: <strong className="text-slate-700 dark:text-slate-300 font-bold">{formatPrice(firstItem.price)}</strong></span>}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-slate-500 font-medium italic">Đơn hàng gồm {order.items?.length || 1} sản phẩm</div>
                      )}
                    </div>

                    {otherCount > 0 && (
                      <div className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-extrabold text-slate-600 dark:text-slate-300">
                        +{otherCount} sp khác
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                      <span>Thanh toán: <strong className="text-slate-700 dark:text-slate-300 font-bold">{order.paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'Chuyển khoản / VNPay'}</strong></span>
                      {isOrderPaid && <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">✓ Đã thanh toán</span>}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Tổng thanh toán:</span>
                        <span className="text-base sm:text-lg font-black text-red-600 dark:text-red-400 leading-none">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
