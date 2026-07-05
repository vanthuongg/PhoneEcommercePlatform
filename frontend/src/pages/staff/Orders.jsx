import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { Eye, X, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const statusConfig = {
  pending: { label: 'Chờ xác nhận', badge: 'badge-warning' },
  confirmed: { label: 'Đã xác nhận', badge: 'badge-info' },
  processing: { label: 'Đang xử lý', badge: 'badge-info' },
  shipping: { label: 'Đang giao', badge: 'badge-info' },
  delivered: { label: 'Đã giao', badge: 'badge-success' },
  cancelled: { label: 'Đã hủy', badge: 'badge-danger' },
};

// Staff can only move through these transitions
const nextStatus = {
  pending: 'confirmed',
  confirmed: 'processing',
  processing: 'shipping',
  shipping: 'delivered',
};

const prevStatus = {
  confirmed: 'pending',
  processing: 'confirmed',
  shipping: 'processing',
  delivered: 'shipping',
};

const getAllowedStatuses = (current) => {
  const allowed = new Set([current]);
  if (prevStatus[current]) allowed.add(prevStatus[current]);
  if (nextStatus[current]) allowed.add(nextStatus[current]);
  const order = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];
  return order.filter(s => allowed.has(s));
};

const StaffOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateNote, setUpdateNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAll({ page, limit: 15, status: statusFilter, search });
      setOrders(res.data || []);
      setPagination(res.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter, search]);

  useEffect(() => {
    if (selectedOrder) {
      setSelectedStatus(selectedOrder.orderStatus);
      setUpdateNote('');
    }
  }, [selectedOrder]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const res = await orderAPI.updateStatus(orderId, newStatus, updateNote);
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
      if (selectedOrder?._id === orderId) setSelectedOrder(res.data);
      toast.success('Cập nhật trạng thái thành công');
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Xử lý đơn hàng</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{pagination.total} đơn hàng</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <input
          placeholder="Tìm mã đơn, tên khách..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 text-sm"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Quick action tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', 'pending', 'confirmed', 'processing', 'shipping'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            {s === '' ? 'Tất cả' : statusConfig[s]?.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b">
              <tr>
                {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Trạng thái', 'Ngày đặt', 'Hành động'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                [...Array(8)].map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>)
              ) : orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">#{order.orderCode}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.shippingAddress?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{order.items?.length} sản phẩm</td>
                  <td className="px-4 py-3 text-sm font-bold text-primary-600">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusConfig[order.orderStatus]?.badge}`}>{statusConfig[order.orderStatus]?.label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {nextStatus[order.orderStatus] && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, nextStatus[order.orderStatus])}
                          disabled={updating}
                          className="text-xs px-2 py-1 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {statusConfig[nextStatus[order.orderStatus]]?.label}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500 dark:text-gray-400">Trang {page}/{pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Trước</button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white dark:bg-gray-800">
              <div>
                <h2 className="text-lg font-bold">#{selectedOrder.orderCode}</h2>
                <span className={`badge ${statusConfig[selectedOrder.orderStatus]?.badge} mt-1`}>{statusConfig[selectedOrder.orderStatus]?.label}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Địa chỉ giao hàng</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-sm space-y-1">
                  <p><span className="text-gray-500 dark:text-gray-400">Tên:</span> <span className="font-medium">{selectedOrder.shippingAddress?.name}</span></p>
                  <p><span className="text-gray-500 dark:text-gray-400">Email:</span> <span className="font-medium">{selectedOrder.shippingAddress?.email}</span></p>
                  <p><span className="text-gray-500 dark:text-gray-400">SĐT:</span> <span className="font-medium">{selectedOrder.shippingAddress?.phone}</span></p>
                  <p><span className="text-gray-500 dark:text-gray-400">Địa chỉ:</span> <span className="font-medium">{[selectedOrder.shippingAddress?.street, selectedOrder.shippingAddress?.ward, selectedOrder.shippingAddress?.district, selectedOrder.shippingAddress?.city].filter(Boolean).join(', ')}</span></p>
                </div>
              </div>
              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Sản phẩm ({selectedOrder.items?.length})</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item._id} className="flex gap-3 items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <img src={item.image || 'https://placehold.co/60x60/e5e7eb/9ca3af?text=?'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Total */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between font-bold text-primary-600 text-base"><span>Tổng cộng</span><span>{formatPrice(selectedOrder.totalAmount)}</span></div>
              </div>
              {/* Action */}
              <div className="border-t pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Cập nhật trạng thái</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="input-field py-2 text-sm"
                  >
                    {getAllowedStatuses(selectedOrder.orderStatus).map((k) => (
                      <option key={k} value={k}>{statusConfig[k].label}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Ghi chú thao tác..." 
                    value={updateNote} 
                    onChange={(e) => setUpdateNote(e.target.value)}
                    className="input-field py-2 text-sm"
                  />
                </div>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder._id, selectedStatus)}
                  disabled={updating || selectedStatus === selectedOrder.orderStatus}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {updating && <Loader2 className="w-4 h-4 spinner" />}
                  Cập nhật trạng thái mới
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOrders;
