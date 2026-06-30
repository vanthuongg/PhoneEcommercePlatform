import { useState, useEffect } from 'react';
import { statsAPI, orderAPI } from '../../services/api';
import { TrendingUp, TrendingDown, Users, Package, DollarSign, Sparkles, RefreshCw, Smartphone, CheckCircle2 } from 'lucide-react';
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
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const kpis = [
    {
      label: 'Tổng doanh thu',
      value: formatPrice(stats?.overview?.totalRevenue || 0),
      icon: DollarSign,
      trend: stats?.overview?.revenueGrowth || +12.5,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      iconBg: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
    },
    {
      label: 'Doanh thu tháng này',
      value: formatPrice(stats?.overview?.monthlyRevenue || 0),
      icon: TrendingUp,
      trend: +8.4,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      iconBg: 'bg-blue-600 text-white shadow-lg shadow-blue-500/30',
    },
    {
      label: 'Tổng đơn điện thoại',
      value: (stats?.overview?.totalOrders || 0).toLocaleString(),
      icon: Package,
      trend: +15.2,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
      iconBg: 'bg-purple-600 text-white shadow-lg shadow-purple-500/30',
    },
    {
      label: 'Khách hàng thành viên',
      value: (stats?.overview?.totalUsers || 0).toLocaleString(),
      icon: Users,
      trend: +5.1,
      color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
      iconBg: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30',
    },
  ];

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400 animate-bounce" size={24} />
            <h1 className="text-2xl sm:text-3xl font-black">Trung Tâm Quản Trị TechPhone</h1>
          </div>
          <p className="text-gray-300 text-xs sm:text-sm mt-1">Theo dõi các chỉ số kinh doanh KPI, hiệu suất bán hàng và xử lý đơn hàng nhanh chóng</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto shadow-inner"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm Mới Dữ Liệu
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{kpi.value}</p>
                {kpi.trend !== undefined && (
                  <span className={`text-[11px] font-extrabold inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full ${kpi.trend >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-700'}`}>
                    {kpi.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {kpi.trend >= 0 ? `+${kpi.trend}%` : `${kpi.trend}%`} so với tháng trước
                  </span>
                )}
              </div>
              <div className={`w-14 h-14 ${kpi.iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                📈 Biểu Đồ Doanh Thu 12 Tháng
              </h2>
              <p className="text-xs text-gray-500">Đơn vị thống kê VNĐ (Triệu / Tỷ)</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold">Năm 2026</span>
          </div>

          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12, fontWeight: 600 }} stroke="#9ca3af" tickFormatter={(v) => formatPrice(v)} />
                <Tooltip
                  formatter={(v) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v), 'Doanh thu']}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="doanhThu" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Package size={32} className="opacity-40" />
              <span className="text-sm font-bold">Chưa có dữ liệu thống kê doanh thu năm nay</span>
            </div>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 dark:text-white pb-4 border-b border-gray-100 dark:border-gray-800">
            📊 Trạng Thái Đơn Hàng
          </h2>
          <div className="space-y-4">
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
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`} />
                      {statusLabel[status]}
                    </span>
                    <span className="text-gray-900 dark:text-white font-black">{count} đơn <span className="text-gray-400 font-normal">({percentage}%)</span></span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColors[status]} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Recent orders table with quick update (8 cols) */}
        <div className="xl:col-span-8 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">⚡ Bảng Đơn Hàng Mới Nhất (Cập Nhật Nhang)</h2>
              <p className="text-xs text-gray-500">Thay đổi trạng thái trực tiếp để điều phối giao hàng</p>
            </div>
            <span className="text-xs font-bold text-primary">{recentOrders.length} đơn gần đây</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-black uppercase text-gray-400">
                  <th className="pb-3">Mã Đơn</th>
                  <th className="pb-3">Khách Hàng</th>
                  <th className="pb-3">Tổng Tiền</th>
                  <th className="pb-3">Cập Nhật Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 font-bold">Chưa có đơn hàng nào vừa phát sinh</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-3.5 font-mono font-black text-primary">#{order.orderCode || order._id.slice(-6).toUpperCase()}</td>
                      <td className="py-3.5 font-bold text-gray-900 dark:text-white">{order.shippingAddress?.name || order.user?.name || 'Khách vãng lai'}</td>
                      <td className="py-3.5 font-black text-red-600 dark:text-red-400">{formatPrice(order.totalAmount)}</td>
                      <td className="py-3.5">
                        <select
                          disabled={updatingId === order._id || order.orderStatus === 'cancelled'}
                          value={order.orderStatus}
                          onChange={(e) => handleQuickStatusUpdate(order._id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50"
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top selling smartphones (4 cols) */}
        <div className="xl:col-span-4 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 dark:text-white pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            🔥 Top Điện Thoại Bán Chạy
          </h2>
          <div className="space-y-4">
            {(stats?.topProducts || []).slice(0, 5).map((product, idx) => (
              <div key={product._id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                  idx === 0 ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' :
                  idx === 1 ? 'bg-gray-400 text-white' :
                  idx === 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  #{idx + 1}
                </span>
                <img src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80'} alt="" className="w-12 h-12 rounded-xl object-cover border bg-white shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{product.brand?.name || 'Smartphone'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-primary block">{product.sold || 0}</span>
                  <span className="text-[10px] text-gray-400">đã bán</span>
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
