import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
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
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Thao tác này không thể hoàn tác.')) return;
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
  };

  const filteredOrders = activeTab === 'all' ? orders : orders.filter((o) => o.orderStatus === activeTab);

  if (selectedOrder) {
    const currentStepNum = statusConfig[selectedOrder.orderStatus]?.step || 1;
    const isCancelled = selectedOrder.orderStatus === 'cancelled';

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Breadcrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Đơn hàng', link: '/orders' }, { label: `#${selectedOrder.orderCode || selectedOrder._id.slice(-6).toUpperCase()}` }]} />

          <button onClick={() => { setSelectedOrder(null); navigate('/orders'); }} className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-600">
            <ArrowLeft size={16} /> Quay lại danh sách đơn hàng
          </button>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mã đơn hàng:</span>
                <h1 className="text-2xl font-black text-primary-600 dark:text-primary-400">
                  #{selectedOrder.orderCode || selectedOrder._id.slice(-6).toUpperCase()}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Đặt ngày {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black self-start sm:self-auto uppercase tracking-wide ${statusConfig[selectedOrder.orderStatus]?.color || 'bg-gray-100'}`}>
                {statusConfig[selectedOrder.orderStatus]?.label || selectedOrder.orderStatus}
              </span>
            </div>

            {/* Visual 6-step Timeline */}
            {!isCancelled ? (
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-6">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">🚚 Tiến Trình Đơn Hàng</h3>
                <div className="grid grid-cols-5 gap-2 relative">
                  {timelineSteps.map((s, idx) => {
                    const isCompleted = currentStepNum >= s.step;
                    const isCurrent = currentStepNum === s.step;
                    return (
                      <div key={s.id} className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all shadow ${
                            isCompleted ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                          } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[11px] font-bold mt-2 leading-tight ${isCompleted ? 'text-gray-900 dark:text-white font-extrabold' : 'text-gray-400'}`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl p-5 flex items-center gap-3 text-red-700 dark:text-red-300">
                <AlertTriangle size={24} className="shrink-0 text-red-500" />
                <div>
                  <p className="font-bold text-sm">Đơn hàng này đã bị hủy</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Nếu bạn đã thanh toán trước, số tiền sẽ được hoàn vào tài khoản của bạn trong 3-5 ngày làm việc.</p>
                </div>
              </div>
            )}

            {/* Address & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-2 text-sm">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200 dark:border-gray-700">📍 Thông Tin Nhận Hàng</h3>
                <p><span className="text-gray-500">Người nhận:</span> <strong className="text-gray-900 dark:text-white">{selectedOrder.shippingAddress?.name}</strong></p>
                <p><span className="text-gray-500">Email:</span> <strong className="text-gray-900 dark:text-white">{selectedOrder.shippingAddress?.email}</strong></p>
                <p><span className="text-gray-500">Điện thoại:</span> <strong className="text-gray-900 dark:text-white">{selectedOrder.shippingAddress?.phone}</strong></p>
                <p><span className="text-gray-500">Địa chỉ:</span> <strong className="text-gray-900 dark:text-white">{[selectedOrder.shippingAddress?.street, selectedOrder.shippingAddress?.ward, selectedOrder.shippingAddress?.district, selectedOrder.shippingAddress?.city].filter(Boolean).join(', ')}</strong></p>
                {selectedOrder.note && <p className="pt-1 text-xs text-amber-600 dark:text-amber-400 italic">Ghi chú: {selectedOrder.note}</p>}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-2 text-sm">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200 dark:border-gray-700">💳 Thanh Toán & Trạng Thái</h3>
                <p><span className="text-gray-500">Phương thức:</span> <strong className="text-gray-900 dark:text-white">{selectedOrder.paymentMethod === 'cod' ? 'Thanh toán tiền mặt COD' : 'Chuyển khoản QR Bank / MoMo'}</strong></p>
                <p><span className="text-gray-500">Trạng thái TT:</span> <strong className={selectedOrder.isPaid ? 'text-emerald-600' : 'text-amber-600'}>{selectedOrder.isPaid ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}</strong></p>
                <p><span className="text-gray-500">Cập nhật lần cuối:</span> <strong className="text-gray-900 dark:text-white">{new Date(selectedOrder.updatedAt || selectedOrder.createdAt).toLocaleString('vi-VN')}</strong></p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white">🛍️ Sản Phẩm Đã Mua ({selectedOrder.items?.length || 0})</h3>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 border rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={item._id || idx} className="p-4 bg-white dark:bg-gray-900 flex items-center gap-4">
                    <img src={item.image || item.product?.images?.[0] || 'https://via.placeholder.com/60'} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-50 border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product?._id || item.product}`} className="font-bold text-sm text-gray-900 dark:text-white hover:text-primary-600 line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">SL: {item.quantity} {item.size ? `• Size: ${item.size}` : ''} {item.color ? `• Màu: ${item.color}` : ''}</p>
                    </div>
                    <span className="font-black text-sm text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Total */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-6 space-y-3 text-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tạm tính hàng:</span> <span className="font-bold text-gray-900 dark:text-white">{formatPrice(selectedOrder.itemsTotal || selectedOrder.totalAmount - (selectedOrder.shippingFee || 0))}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Phí vận chuyển:</span> <span className="font-bold text-gray-900 dark:text-white">{selectedOrder.shippingFee === 0 ? <span className="text-emerald-600">0đ (Freeship)</span> : formatPrice(selectedOrder.shippingFee || 0)}</span>
              </div>
              <div className="pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-baseline">
                <span className="font-bold text-base text-gray-900 dark:text-white">Tổng tiền thanh toán:</span>
                <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                  {formatPrice(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 justify-end">
              <Link to="/shop" className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 flex items-center gap-2">
                <ShoppingBag size={16} /> Mua thêm sản phẩm
              </Link>
              {['pending', 'confirmed'].includes(selectedOrder.orderStatus) && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder._id)}
                  className="px-6 py-3 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 font-bold text-xs hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 border border-red-200 dark:border-red-800"
                >
                  <AlertTriangle size={16} /> Hủy Đơn Hàng Này
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Breadcrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Đơn hàng của tôi' }]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">📦 Đơn Hàng Của Tôi</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Theo dõi trạng thái giao hàng và lịch sử mua sắm điện thoại tại TechPhone</p>
          </div>
          <Link to="/shop" className="btn-primary self-start sm:self-auto inline-flex items-center gap-2 text-xs font-bold px-5 py-3 rounded-2xl shadow-md">
            <ShoppingBag size={16} /> Mua Sắm Thêm
          </Link>
        </div>

        {/* Tabs Filter */}
        <div className="flex gap-1.5 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-x-auto shadow-sm scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
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
              <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border animate-pulse h-32" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400 animate-bounce">
              <Package size={40} />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Chưa có đơn hàng nào trong mục này</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">Hãy bắt đầu hành trình mua sắm và săn ngàn ưu đãi công nghệ tại TechPhone ngay hôm nay!</p>
            <Link to="/shop" className="px-6 py-3 bg-primary text-white rounded-2xl font-bold inline-flex items-center gap-2 text-xs shadow-md">
              Khám Phá Cửa Hàng
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = statusConfig[order.orderStatus] || { label: order.orderStatus, color: 'bg-gray-100' };
              return (
                <div
                  key={order._id}
                  onClick={() => { setSelectedOrder(order); navigate(`/orders/${order._id}`); }}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-primary-600 dark:text-primary-400">
                        #{order.orderCode || order._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-auto uppercase tracking-wide ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-lg">
                        📦
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          Gồm {order.items?.length || 1} sản phẩm
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Người nhận: {order.shippingAddress?.name}</p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="text-xs text-gray-400 block">Tổng thanh toán:</span>
                        <span className="text-base font-black text-primary-600 dark:text-primary-400">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
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
