import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { Package, Clock, CheckCircle, Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1 }).format(price);

const statusConfig = {
  pending: { label: 'Chờ xác nhận', badge: 'badge-warning' },
  confirmed: { label: 'Đã xác nhận', badge: 'badge-info' },
  processing: { label: 'Đang xử lý', badge: 'badge-info' },
  shipping: { label: 'Đang giao', badge: 'badge-info' },
  delivered: { label: 'Đã giao', badge: 'badge-success' },
  cancelled: { label: 'Đã hủy', badge: 'badge-danger' },
};

const StaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({ pending: 0, confirmed: 0, processing: 0, shipping: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    orderAPI.getAll({ limit: 100 })
      .then((res) => {
        const allOrders = res.data || [];
        const stats = { pending: 0, confirmed: 0, processing: 0, shipping: 0 };
        allOrders.forEach(o => { if (stats.hasOwnProperty(o.orderStatus)) stats[o.orderStatus]++; });
        setOrderStats(stats);
        
        // Filter out completed/cancelled to find urgent orders
        const urgent = allOrders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).slice(0, 8);
        setOrders(urgent);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderAPI.updateStatus(orderId, newStatus, `Nhân viên xử lý nhanh sang ${statusConfig[newStatus]?.label || newStatus}`);
      toast.success('🎉 Cập nhật trạng thái đơn hàng thành công!');
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
    } catch (err) {
      toast.error(err.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

  const kpis = [
    { label: 'Chờ xác nhận', value: orderStats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Đã xác nhận', value: orderStats.confirmed, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Đang xử lý', value: orderStats.processing, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Đang giao', value: orderStats.shipping, icon: Truck, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Tổng quan công việc hôm nay</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card p-5">
              <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{loading ? '—' : kpi.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pending orders needing action */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span>Đơn Hàng Gần Đây (Cần Xử Lý)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Danh sách các đơn hàng chờ tiếp nhận và đóng gói giao đi</p>
          </div>
          <div className="flex items-center gap-2.5">
            {orderStats.pending > 0 && (
              <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/50">
                {orderStats.pending} đơn chờ duyệt
              </span>
            )}
            <Link
              to="/staff/orders"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1 hover:underline ml-1"
            >
              <span>Xem tất cả</span> <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce-slow" />
              <p className="text-slate-700 dark:text-slate-300 font-bold text-base">Tuyệt vời! Không còn đơn hàng nào tồn đọng</p>
              <p className="text-xs text-slate-400">Tất cả các đơn hàng đã được tiếp nhận và xử lý kịp thời</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="pb-3">Mã Đơn & Thời Gian</th>
                  <th className="pb-3">Khách Hàng & Sản Phẩm</th>
                  <th className="pb-3">Tổng Tiền & Thanh Toán</th>
                  <th className="pb-3">Cập Nhật Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                {orders.map((order) => {
                  const orderCode = order.orderCode || order._id?.slice(-6).toUpperCase() || 'N/A';
                  const customerName = order.shippingAddress?.name || order.user?.name || 'Khách vãng lai';
                  const itemCount = order.items?.length || 0;
                  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Vừa xong';
                  const payMethod = order.paymentMethod === 'vnpay' ? 'VNPay' : order.paymentMethod === 'banking' ? 'Chuyển khoản' : 'Tiền mặt (COD)';

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3 pr-3">
                        <Link to={`/staff/orders`} className="font-mono font-black text-primary-600 dark:text-primary-400 hover:underline block">
                          #{orderCode}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Clock size={11} /> {orderDate}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{customerName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <ShoppingBag size={11} className="text-amber-500" />
                          <span>{itemCount} sản phẩm</span>
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="font-black text-red-600 dark:text-red-400 block">{formatPrice(order.totalAmount)}</span>
                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-0.5 border border-slate-200 dark:border-slate-700">
                          {payMethod}
                        </span>
                      </td>
                      <td className="py-3">
                        <select
                          disabled={updatingId === order._id || order.orderStatus === 'cancelled' || order.orderStatus === 'delivered'}
                          value={order.orderStatus || 'pending'}
                          onChange={(e) => handleQuickStatusUpdate(order._id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50 transition-all shadow-xs hover:border-primary-500/50"
                        >
                          <option value="pending">⏳ Chờ xác nhận</option>
                          <option value="confirmed">✓ Đã xác nhận</option>
                          <option value="processing">📦 Đang đóng gói</option>
                          <option value="shipping">🚚 Đang giao</option>
                          <option value="delivered">🎉 Đã giao</option>
                          <option value="cancelled">❌ Đã hủy</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
