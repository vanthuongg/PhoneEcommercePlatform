import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI, orderAPI } from '../../services/api';
import { TrendingUp, TrendingDown, Users, Package, DollarSign, Sparkles, RefreshCw, Smartphone, CheckCircle2, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1 }).format(price || 0);

const statusLabel = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', processing: 'Đang đóng gói', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };
const statusColors = { pending: 'bg-amber-500', confirmed: 'bg-blue-500', processing: 'bg-indigo-500', shipping: 'bg-cyan-500', delivered: 'bg-emerald-500', cancelled: 'bg-red-500' };

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([statsAPI.getDashboard(), statsAPI.getRevenue()])
      .then(([dashRes, revRes]) => {
        setStats(dashRes.data);
        setRecentOrders(dashRes.data?.recentOrders || []);
        setRevenueData((revRes.data || []).map((d) => ({
          name: d.name,
          doanhThu: d.revenue,
          donHang: d.orders,
        })));
      })
      .catch((err) => toast.error('Lỗi tải dữ liệu thống kê'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderAPI.updateStatus(orderId, newStatus, `Admin cập nhật nhanh sang ${statusLabel[newStatus]}`);
      toast.success('🎉 Cập nhật trạng thái đơn hàng thành công!');
      setRecentOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
    } catch (err) {
      toast.error(err.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin shadow-glow" />
    </div>
  );

  // Tính trend thực từ dữ liệu API
  const revenueGrowth = stats?.overview?.revenueGrowth ?? null;
  const cancelRate = stats?.overview?.returnRate ?? null;
  const deliveredOrders = stats?.ordersByStatus?.delivered || 0;
  const totalOrders = stats?.overview?.totalOrders || 0;
  const deliveryRate = totalOrders > 0 ? +((deliveredOrders / totalOrders) * 100).toFixed(1) : null;

  const kpis = [
    {
      label: 'Tổng doanh thu',
      value: formatPrice(stats?.overview?.totalRevenue || 0),
      icon: DollarSign,
      trend: revenueGrowth,
      trendLabel: 'so với tháng trước',
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
    },
    {
      label: 'Doanh thu tháng này',
      value: formatPrice(stats?.overview?.monthlyRevenue || 0),
      icon: TrendingUp,
      trend: revenueGrowth,
      trendLabel: 'tăng trưởng tháng',
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      iconBg: 'bg-gradient-to-br from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/30',
    },
    {
      label: 'Tổng đơn hàng',
      value: (stats?.overview?.totalOrders || 0).toLocaleString(),
      icon: Package,
      trend: deliveryRate,
      trendLabel: 'tỷ lệ giao thành công',
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
      iconBg: 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30',
    },
    {
      label: 'Khách hàng thành viên',
      value: (stats?.overview?.totalUsers || 0).toLocaleString(),
      icon: Users,
      trend: cancelRate !== null ? -cancelRate : null,
      trendLabel: 'tỷ lệ hủy đơn',
      color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30',
    },
  ];

  return (
    <div className="p-3.5 sm:p-4 space-y-3.5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-gradient-to-r from-slate-900 via-primary-950 to-indigo-950 p-4 sm:p-5 rounded-2xl text-white shadow-premium border border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400 animate-spin-slow" size={20} />
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight">Trung Tâm Quản Trị TechPhone</h1>
          </div>
          <p className="text-slate-300 text-xs font-medium">Theo dõi các chỉ số kinh doanh KPI thời gian thực, hiệu suất bán hàng và xử lý đơn hàng siêu tốc</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="relative z-10 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-extrabold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto border border-white/15 hover:scale-105 active:scale-95 shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm Mới Dữ Liệu
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:scale-[1.01] transition-all duration-300 flex items-center justify-between group">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">{kpi.value}</p>
                {kpi.trend !== null && kpi.trend !== undefined && (
                  <span className={`text-[10px] font-extrabold inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-lg ${kpi.trend >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                    {kpi.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {kpi.trend >= 0 ? `+${kpi.trend}%` : `${kpi.trend}%`} {kpi.trendLabel || 'so với tháng trước'}
                  </span>
                )}
              </div>
              <div className={`w-11 h-11 ${kpi.iconBg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3.5">
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                📈 Biểu Đồ Doanh Thu 12 Tháng
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Đơn vị thống kê VNĐ (Triệu / Tỷ)</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[11px] font-black border border-primary-500/20">Năm 2026</span>
          </div>

          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11, fontWeight: 600 }} stroke="#64748b" tickFormatter={(v) => formatPrice(v)} />
                <Tooltip
                  formatter={(v) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v), 'Doanh thu']}
                  contentStyle={{ borderRadius: '0.75rem', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '12px', padding: '8px' }}
                />
                <Line type="monotone" dataKey="doanhThu" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#60a5fa' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Package size={28} className="opacity-40" />
              <span className="text-xs font-bold">Chưa có dữ liệu thống kê doanh thu năm nay</span>
            </div>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <h2 className="text-base font-black text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-slate-800 font-display">
            📊 Trạng Thái Đơn Hàng
          </h2>
          <div className="space-y-2.5">
            {Object.entries({
              pending: stats?.ordersByStatus?.pending || 0,
              confirmed: stats?.ordersByStatus?.confirmed || 0,
              processing: stats?.ordersByStatus?.processing || 0,
              shipping: stats?.ordersByStatus?.shipping || 0,
              delivered: stats?.ordersByStatus?.delivered || 0,
              cancelled: stats?.ordersByStatus?.cancelled || 0,
            }).map(([status, count]) => {
              const percentage = Math.round((count / (stats?.overview?.totalOrders || 1)) * 100);
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2 font-semibold">
                      <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status]} shadow-sm`} />
                      {statusLabel[status]}
                    </span>
                    <span className="text-slate-900 dark:text-white font-black">{count} đơn <span className="text-slate-400 font-normal">({percentage}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div
                      className={`h-full ${statusColors[status]} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
        {/* Recent orders table with quick update (8 cols) */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span>Đơn Hàng Gần Đây</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Thay đổi trạng thái trực tiếp để điều phối giao hàng nhanh</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-extrabold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-800/50">
                {recentOrders.length} đơn mới
              </span>
              <Link
                to="/admin/orders"
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
                          <Link to={`/admin/orders`} className="font-mono font-black text-primary-600 dark:text-primary-400 hover:underline block">
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

        {/* Top selling smartphones (4 cols) */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <h2 className="text-base font-black text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 font-display">
            🔥 Top Điện Thoại Bán Chạy
          </h2>
          <div className="space-y-2.5">
            {(stats?.topProducts || []).slice(0, 5).map((product, idx) => (
              <div key={product._id} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                  idx === 0 ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm' :
                  idx === 1 ? 'bg-slate-400 text-white shadow-sm' :
                  idx === 2 ? 'bg-orange-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  #{idx + 1}
                </span>
                <img src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80'} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-900 dark:text-white line-clamp-1">{product.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{product.brand?.name || 'Smartphone'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-black text-primary-600 dark:text-primary-400 block">{product.sold || 0}</span>
                  <span className="text-[9px] text-slate-400 font-medium">đã bán</span>
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
