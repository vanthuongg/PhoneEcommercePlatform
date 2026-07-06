import React, { useState, useEffect, useMemo } from 'react';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, Eye, X, Loader2, Package, Truck, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, Filter, ArrowRight, ArrowLeft, 
  CreditCard, User, Phone, Mail, MapPin, FileText, Check, 
  ShieldAlert, Sparkles, ChevronRight, Ban, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const statusConfig = {
  pending: { label: 'Chờ xác nhận', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Clock, color: 'text-amber-500' },
  confirmed: { label: 'Đã xác nhận', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Check, color: 'text-blue-500' },
  processing: { label: 'Đang đóng gói', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', icon: Package, color: 'text-indigo-500' },
  shipping: { label: 'Đang giao hàng', badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20', icon: Truck, color: 'text-cyan-500' },
  delivered: { label: 'Đã giao hàng', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle2, color: 'text-emerald-500' },
  cancelled: { label: 'Đã hủy đơn', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', icon: Ban, color: 'text-rose-500' },
};

const paymentStatusConfig = {
  pending: { label: 'Chờ thanh toán', badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30', dot: 'bg-amber-500 animate-pulse' },
  paid: { label: 'Đã thanh toán', badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30', dot: 'bg-emerald-500' },
  failed: { label: 'Thất bại', badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30', dot: 'bg-rose-500' },
  refunded: { label: 'Đã hoàn tiền', badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30', dot: 'bg-purple-500' },
};

const nextStatusMap = {
  pending: 'confirmed',
  confirmed: 'processing',
  processing: 'shipping',
  shipping: 'delivered',
};

const prevStatusMap = {
  confirmed: 'pending',
  processing: 'confirmed',
  shipping: 'processing',
  delivered: 'shipping',
};

const workflowSteps = [
  { key: 'pending', label: 'Chờ xác nhận', icon: Clock },
  { key: 'confirmed', label: 'Đã xác nhận', icon: Check },
  { key: 'processing', label: 'Đang đóng gói', icon: Package },
  { key: 'shipping', label: 'Đang giao', icon: Truck },
  { key: 'delivered', label: 'Hoàn thành', icon: CheckCircle2 },
];

const Orders = () => {
  const { user } = useAuth();
  const role = user?.role || 'admin';
  const roleTitle = role === 'staff' ? 'Nhân viên Điều phối' : role === 'manager' ? 'Quản lý Đơn hàng' : 'Quản trị Đơn hàng';

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateNote, setUpdateNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { 
        page, 
        limit: 15, 
        status: statusFilter,
        search: searchQuery.trim() || undefined 
      };
      const res = await orderAPI.getAll(params);
      setOrders(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      toast.error(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  useEffect(() => {
    if (selectedOrder) {
      setSelectedStatus(selectedOrder.orderStatus);
      setSelectedPaymentStatus(selectedOrder.paymentStatus);
      setUpdateNote('');
    }
  }, [selectedOrder]);

  const handleUpdateStatus = async (orderId, newStatus, note = '') => {
    setUpdating(true);
    try {
      const res = await orderAPI.updateStatus(orderId, newStatus, note);
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
      if (selectedOrder?._id === orderId) setSelectedOrder(res.data);
      toast.success(`Đã cập nhật trạng thái: ${statusConfig[newStatus]?.label}`);
    } catch (err) {
      toast.error(err.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    setUpdating(true);
    try {
      const res = await orderAPI.updatePaymentStatus(orderId, newPaymentStatus);
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
      if (selectedOrder?._id === orderId) setSelectedOrder(res.data);
      toast.success('Cập nhật trạng thái thanh toán thành công');
    } catch (err) {
      toast.error(err.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn');
      return;
    }
    setUpdating(true);
    try {
      const res = await orderAPI.cancel(selectedOrder._id, cancelReason);
      setOrders(orders.map(o => o._id === selectedOrder._id ? res.data : o));
      setSelectedOrder(res.data);
      setShowCancelModal(false);
      setCancelReason('');
      toast.success('Đã hủy đơn hàng');
    } catch (err) {
      toast.error(err.message || 'Hủy đơn thất bại');
    } finally {
      setUpdating(false);
    }
  };

  // Filtered locally by search query if API search isn't full-text
  const displayedOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(o => 
      o.orderCode?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.phone?.includes(q) ||
      o.shippingAddress?.phone?.includes(q) ||
      o.shippingAddress?.name?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  // Calculate quick stats from current fetched batch / pagination total
  const stats = useMemo(() => {
    const total = pagination.total || orders.length;
    const pending = orders.filter(o => o.orderStatus === 'pending').length;
    const shipping = orders.filter(o => o.orderStatus === 'shipping').length;
    const delivered = orders.filter(o => o.orderStatus === 'delivered').length;
    return { total, pending, shipping, delivered };
  }, [orders, pagination.total]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display">
              {roleTitle}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-12">
            Theo dõi, điều phối và xử lý đơn hàng toàn hệ thống • Tổng: <strong className="text-primary-600 font-bold">{stats.total}</strong> đơn
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-600' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.pending}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chờ xác nhận</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.shipping}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đang giao hàng</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.delivered}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đã giao thành công</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng đơn hàng</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <button
              onClick={() => { setStatusFilter(''); setPage(1); }}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === '' 
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>Tất cả</span>
            </button>
            {Object.entries(statusConfig).map(([k, v]) => {
              const Icon = v.icon;
              const isActive = statusFilter === k;
              return (
                <button
                  key={k}
                  onClick={() => { setStatusFilter(k); setPage(1); }}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : v.color}`} />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã đơn, SĐT, khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Mã đơn</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[200px]">Khách hàng</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Sản phẩm</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Tổng thanh toán</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">TT Thanh toán</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Ngày đặt</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-6 py-5">
                      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Package className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy đơn hàng nào</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm</p>
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order) => {
                  const st = statusConfig[order.orderStatus] || statusConfig.pending;
                  const paySt = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending;
                  const StIcon = st.icon;
                  const nextStKey = nextStatusMap[order.orderStatus];
                  const nextSt = nextStKey ? statusConfig[nextStKey] : null;

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 font-black text-primary-600 dark:text-primary-400 text-xs">
                        #{order.orderCode}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-black text-xs flex items-center justify-center shrink-0 uppercase shadow-inner">
                            {order.shippingAddress?.name?.charAt(0) || order.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {order.shippingAddress?.name || order.user?.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              {order.shippingAddress?.phone || order.user?.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
                            {order.items?.length || 0} sản phẩm
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap shadow-2xs ${paySt.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${paySt.dot || 'bg-current'}`} />
                          <span>{paySt.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap shadow-2xs border ${st.badge}`}>
                          <StIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{st.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all font-bold text-xs flex items-center gap-1"
                            title="Xem chi tiết đơn hàng"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Chi tiết</span>
                          </button>

                          {nextSt && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, nextStKey)}
                              disabled={updating}
                              className="px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                              title={`Chuyển sang: ${nextSt.label}`}
                            >
                              <span>{nextSt.label}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Trang <strong className="text-slate-900 dark:text-white">{page}</strong> / {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════
          ORDER DETAIL & TIMELINE MODAL
      ════════════════════════════════ */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8 animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-sm">
                  #{selectedOrder.orderCode?.slice(-4)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Đơn hàng #{selectedOrder.orderCode}
                    </h2>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border whitespace-nowrap shadow-2xs ${statusConfig[selectedOrder.orderStatus]?.badge}`}>
                      {statusConfig[selectedOrder.orderStatus]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Đặt lúc: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedOrder(null); setShowCancelModal(false); }}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
              
              {/* 1. TIMELINE WORKFLOW */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/60">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  <span>Quy trình tiến độ đơn hàng</span>
                </h3>

                {selectedOrder.orderStatus === 'cancelled' ? (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3">
                    <Ban className="w-6 h-6 text-rose-500 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Đơn hàng này đã bị hủy</p>
                      {selectedOrder.cancelReason && (
                        <p className="text-xs text-rose-600 dark:text-rose-300 mt-0.5">Lý do: {selectedOrder.cancelReason}</p>
                      )}
                    </div>
                  </div>
                ) : selectedOrder.orderStatus === 'delivered' ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Đơn hàng đã giao thành công (Hoàn tất)</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-0.5">Quy trình xử lý đơn hàng đã hoàn tất. Không thể thay đổi trạng thái.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Progress Bar background */}
                    <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-700 hidden sm:block z-0" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                      {workflowSteps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const currentIdx = workflowSteps.findIndex(s => s.key === selectedOrder.orderStatus);
                        const isCompleted = currentIdx >= idx;
                        const isCurrent = currentIdx === idx;

                        return (
                          <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:text-center">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                              isCurrent
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-110 ring-4 ring-primary-100 dark:ring-primary-900/40'
                                : isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}>
                              <StepIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold ${isCurrent ? 'text-primary-600 dark:text-primary-400' : isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <span className="inline-block text-[10px] font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full mt-1">
                                  Hiện tại
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. CUSTOMER & SHIPPING DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-500" />
                    <span>Thông tin người nhận</span>
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{selectedOrder.shippingAddress?.name || selectedOrder.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone}</span>
                    </div>
                    {selectedOrder.shippingAddress?.email && (
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{selectedOrder.shippingAddress?.email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300 pt-1">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        {[
                          selectedOrder.shippingAddress?.street,
                          selectedOrder.shippingAddress?.ward,
                          selectedOrder.shippingAddress?.district,
                          selectedOrder.shippingAddress?.city
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary-500" />
                    <span>Thanh toán & Ghi chú</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Phương thức TT:</span>
                      <span className="font-bold text-slate-900 dark:text-white uppercase bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-xl">
                        {selectedOrder.paymentMethod || 'COD'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Trạng thái TT:</span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs whitespace-nowrap shadow-2xs ${paymentStatusConfig[selectedOrder.paymentStatus]?.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${paymentStatusConfig[selectedOrder.paymentStatus]?.dot || 'bg-current'}`} />
                        <span>{paymentStatusConfig[selectedOrder.paymentStatus]?.label}</span>
                      </span>
                    </div>
                    {selectedOrder.note && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-slate-400 block mb-1">Ghi chú từ khách:</span>
                        <p className="italic text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                          "{selectedOrder.note}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. ORDER ITEMS LIST */}
              <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-700 font-black text-xs text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Sản phẩm đã đặt ({selectedOrder.items?.length || 0})</span>
                  <span>Thành tiền</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {selectedOrder.items?.map((item) => (
                    <div key={item._id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80'}
                          alt={item.name}
                          className="w-14 h-14 rounded-2xl object-cover bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shrink-0 shadow-sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {item.color && <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">Màu: {item.color}</span>}
                            {item.size && <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">ROM: {item.size}</span>}
                            <span className="font-bold text-slate-700 dark:text-slate-300">x{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatPrice(item.price)} / sp</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Financial Summary */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tổng tiền hàng:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(selectedOrder.itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Phí vận chuyển:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(selectedOrder.shippingFee)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Voucher giảm giá:</span>
                      <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-rose-600 dark:text-rose-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Tổng thanh toán:</span>
                    <span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* 4. MANAGEMENT CONTROLS (PAYMENT & ORDER STATUS) */}
              {selectedOrder.orderStatus !== 'cancelled' && selectedOrder.orderStatus !== 'delivered' && (
                <div className="bg-slate-100 dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-primary-600" />
                    <span>Bảng điều khiển trạng thái (Dành cho Quản trị viên & Nhân viên)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment Status Control */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Trạng thái thanh toán:
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={selectedPaymentStatus}
                          onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                          className="flex-1 px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="pending">Chờ thanh toán</option>
                          <option value="paid">Đã thanh toán (Paid)</option>
                          <option value="failed">Thất bại (Failed)</option>
                          <option value="refunded">Đã hoàn tiền (Refunded)</option>
                        </select>
                        <button
                          onClick={() => handleUpdatePaymentStatus(selectedOrder._id, selectedPaymentStatus)}
                          disabled={updating || selectedPaymentStatus === selectedOrder.paymentStatus}
                          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-40"
                        >
                          Lưu TT
                        </button>
                      </div>
                    </div>

                    {/* Order Status Control */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Chuyển trạng thái đơn hàng:
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="flex-1 px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {Object.entries(statusConfig).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, selectedStatus, updateNote)}
                          disabled={updating || selectedStatus === selectedOrder.orderStatus}
                          className="px-4 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-40"
                        >
                          Cập nhật
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Step Buttons & Note Input */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                    <input
                      type="text"
                      placeholder="Ghi chú nội bộ cho thao tác này (tùy chọn)..."
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex gap-2">
                        {prevStatusMap[selectedOrder.orderStatus] && (
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder._id, prevStatusMap[selectedOrder.orderStatus], updateNote || 'Quay lại bước trước')}
                            disabled={updating}
                            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold text-xs flex items-center gap-1.5 transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Quay lại: {statusConfig[prevStatusMap[selectedOrder.orderStatus]]?.label}</span>
                          </button>
                        )}

                        {nextStatusMap[selectedOrder.orderStatus] && (
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder._id, nextStatusMap[selectedOrder.orderStatus], updateNote || 'Chuyển bước tiếp theo')}
                            disabled={updating}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                          >
                            <span>Bước tiếp: {statusConfig[nextStatusMap[selectedOrder.orderStatus]]?.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Hủy đơn hàng này</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end">
              <button
                onClick={() => { setSelectedOrder(null); setShowCancelModal(false); }}
                className="px-6 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          CANCEL ORDER CONFIRMATION MODAL
      ════════════════════════════════ */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Xác nhận hủy đơn hàng</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">#{selectedOrder.orderCode}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Hành động này sẽ hủy đơn hàng và hoàn lại số lượng tồn kho sản phẩm (nếu có). Vui lòng nhập lý do hủy đơn:
            </p>

            <textarea
              rows={3}
              placeholder="Ví dụ: Khách yêu cầu hủy / Hết hàng / Sai địa chỉ..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            />

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Không hủy nữa
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={updating || !cancelReason.trim()}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg shadow-rose-500/30 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác nhận Hủy Đơn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
