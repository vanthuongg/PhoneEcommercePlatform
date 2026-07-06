import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI, orderAPI } from '../../services/api';
import { TrendingUp, Package, ShoppingBag, AlertTriangle, Eye, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

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

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderAPI.updateStatus(orderId, newStatus, `Quản lý cập nhật nhanh sang ${statusConfig[newStatus]?.label || newStatus}`);
      toast.success('🎉 Cập nhật trạng thái đơn hàng thành công!');
      setRecentOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
    } catch (err) {
      toast.error(err.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
        {/* Recent orders table (8 cols) */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span>Đơn Hàng Gần Đây</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Theo dõi, kiểm duyệt và cập nhật nhanh các đơn hàng mới phát sinh</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-extrabold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-800/50">
                {recentOrders.length} đơn mới
              </span>
              <Link
                to="/manager/orders"
                className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1 hover:underline ml-1"
              >
                <span>Xem tất cả</span> <ArrowRight size={14} />
              </Link>
            </div>
          </div>

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
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 animate-bounce-slow" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold">Chưa có đơn hàng nào vừa phát sinh</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const orderCode = order.orderCode || order._id?.slice(-6).toUpperCase() || 'N/A';
                    const customerName = order.shippingAddress?.name || order.user?.name || 'Khách vãng lai';
                    const itemCount = order.items?.length || 0;
                    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Vừa xong';
                    const payMethod = order.paymentMethod === 'vnpay' ? 'VNPay' : order.paymentMethod === 'banking' ? 'Chuyển khoản' : 'Tiền mặt (COD)';

                    return (
                      <tr key={order._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3 pr-3">
                          <Link to={`/manager/orders`} className="font-mono font-black text-primary-600 dark:text-primary-400 hover:underline block">
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products (4 cols) */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 font-display">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <span>Sản Phẩm Bán Chạy</span>
          </h2>
          <div className="space-y-3">
            {(stats?.topProducts || []).slice(0, 6).map((product, idx) => (
              <div key={product._id || idx} className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-all">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                  idx === 0 ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20' :
                  idx === 1 ? 'bg-slate-400 text-white shadow-sm' :
                  idx === 2 ? 'bg-orange-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  #{idx + 1}
                </span>
                <img src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80'} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0 shadow-xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{product.category?.name || 'Smartphone'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-primary-600 dark:text-primary-400 block">{product.sold || 0}</span>
                  <span className="text-[10px] text-slate-400 font-medium">đã bán</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
