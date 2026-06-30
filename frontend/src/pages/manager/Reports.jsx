import { useState, useEffect } from 'react';
import { statsAPI } from '../../services/api';
import { TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1 }).format(price);

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const statusLabel = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', processing: 'Xử lý', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsAPI.getDashboard(), statsAPI.getRevenue()])
      .then(([dashRes, revRes]) => {
        setStats(dashRes.data);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        setRevenueData((revRes.data || []).map((d) => ({
          name: months[d._id.month - 1],
          revenue: d.revenue,
          orders: d.orders,
        })));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full spinner" />
    </div>
  );

  // Pie data for order status
  const pieData = Object.entries(stats?.ordersByStatus || {}).map(([key, value]) => ({
    name: statusLabel[key] || key,
    value,
  }));

  const kpis = [
    { label: 'Tổng doanh thu', value: formatPrice(stats?.overview?.totalRevenue || 0), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100', sub: 'Tất cả thời gian' },
    { label: 'Doanh thu tháng này', value: formatPrice(stats?.overview?.monthlyRevenue || 0), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100', sub: 'Tháng hiện tại' },
    { label: 'Tổng đơn hàng', value: (stats?.overview?.totalOrders || 0).toLocaleString(), icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100', sub: 'Tất cả đơn' },
    { label: 'Khách hàng', value: (stats?.overview?.totalUsers || 0).toLocaleString(), icon: Users, color: 'text-orange-600', bg: 'bg-orange-100', sub: 'Đã đăng ký' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Báo cáo & Thống kê</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Tổng hợp dữ liệu kinh doanh</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">{kpi.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue line chart */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Doanh thu theo tháng</h2>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatPrice(v)} />
              <Tooltip formatter={(v, name) => [name === 'revenue' ? formatPrice(v) : v, name === 'revenue' ? 'Doanh thu' : 'Đơn hàng']} />
              <Legend formatter={(v) => v === 'revenue' ? 'Doanh thu' : 'Đơn hàng'} />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Orders bar chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Số đơn hàng theo tháng</h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="Đơn hàng" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Order status pie chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Phân bổ trạng thái đơn</h2>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top 10 sản phẩm bán chạy</h2>
        <div className="space-y-3">
          {(stats?.topProducts || []).map((product, idx) => (
            <div key={product._id} className="flex items-center gap-4">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : idx === 1 ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{product.category?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{product.sold} sold</p>
              </div>
              <div className="w-24">
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${Math.min(100, (product.sold / ((stats?.topProducts?.[0]?.sold || 1))) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
