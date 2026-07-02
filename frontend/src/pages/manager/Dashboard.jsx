import { useState, useEffect } from 'react';
import { statsAPI, orderAPI } from '../../services/api';
import { TrendingUp, Package, ShoppingBag, AlertTriangle, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsAPI.getDashboard(), statsAPI.getRevenue(), orderAPI.getAll({ limit: 8 })])
      .then(([dashRes, revRes, ordRes]) => {
        setStats(dashRes.data);
        setRevenueData((revRes.data || []).map((d) => ({
          name: d.name,
          revenue: d.revenue,
          orders: d.orders,
        })));
        setRecentOrders(ordRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full spinner" />
    </div>
  );

  const kpis = [
    { label: 'Doanh thu tháng', value: formatPrice(stats?.overview?.monthlyRevenue || 0), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Tổng đơn hàng', value: (stats?.overview?.totalOrders || 0).toLocaleString(), icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Sản phẩm', value: (stats?.overview?.totalProducts || 0).toLocaleString(), icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Tồn kho thấp', value: (stats?.overview?.lowStockProducts || 0).toLocaleString(), icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="p-3.5 sm:p-4 space-y-3.5 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Quản Lý</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tổng quan hoạt động cửa hàng</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card p-4">
              <div className={`w-9 h-9 ${kpi.bg} rounded-xl flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue chart */}
      <div className="card p-4 sm:p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Doanh thu theo tháng</h2>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatPrice(v)} />
              <Tooltip formatter={(v) => formatPrice(v)} />
              <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-44 flex items-center justify-center text-gray-400 text-xs">Chưa có dữ liệu</div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
        {/* Recent orders */}
        <div className="card p-4 sm:p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Đơn hàng gần đây</h2>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl text-xs">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">#{order.orderCode}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{order.user?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${statusConfig[order.orderStatus]?.badge}`}>
                    {statusConfig[order.orderStatus]?.label}
                  </span>
                  <span className="font-bold text-primary-600">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="card p-4 sm:p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Sản phẩm bán chạy</h2>
          <div className="space-y-2">
            {(stats?.topProducts || []).map((product, idx) => (
              <div key={product._id} className="flex items-center gap-2.5 text-xs">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  idx === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : idx === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : 'bg-orange-50 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{product.category?.name}</p>
                </div>
                <span className="font-bold text-gray-700 dark:text-gray-300">{product.sold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
