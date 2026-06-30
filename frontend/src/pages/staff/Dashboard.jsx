import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';

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

  useEffect(() => {
    orderAPI.getAll({ limit: 100 })
      .then((res) => {
        const allOrders = res.data || [];
        const stats = { pending: 0, confirmed: 0, processing: 0, shipping: 0 };
        allOrders.forEach(o => { if (stats.hasOwnProperty(o.orderStatus)) stats[o.orderStatus]++; });
        setOrderStats(stats);
        
        // Filter out completed/cancelled to find urgent orders
        const urgent = allOrders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).slice(0, 5);
        setOrders(urgent);
      })
      .finally(() => setLoading(false));
  }, []);

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
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Đơn hàng cần xử lý
          {orderStats.pending > 0 && (
            <span className="ml-2 badge badge-warning">{orderStats.pending}</span>
          )}
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-gray-500 dark:text-gray-400">Không có đơn hàng chờ xử lý</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">#{order.orderCode}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.user?.name} • {order.items?.length} sản phẩm</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-600">{formatPrice(order.totalAmount)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <Link to="/staff/orders" className="text-sm text-primary-600 hover:underline font-medium">Xem tất cả đơn hàng →</Link>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
