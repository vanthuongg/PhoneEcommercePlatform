import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderAPI, productAPI } from '../../services/api';
import { 
  Bell, Check, Loader2, ChevronLeft, ChevronRight, Package, 
  ShoppingBag, Gift, ExternalLink, X, Clock, AlertCircle, 
  Sparkles, Tag, ArrowRight, ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  processing: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' },
  shipping: { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  delivered: { label: 'Giao thành công', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  cancelled: { label: 'Đã hủy đơn', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};

const NotificationList = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCustomerOrGuest = !user || user.role === 'customer';
  const [filterType, setFilterType] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    if (isCustomerOrGuest || filterType === 'all') return true;
    const title = (n.title || '').toLowerCase();
    if (filterType === 'order') return n.type === 'order' || title.includes('đơn hàng');
    if (filterType === 'alert') return n.type === 'alert' || title.includes('tồn kho') || title.includes('cảnh báo');
    if (filterType === 'ticket') return n.type === 'user' || title.includes('ticket') || title.includes('hỗ trợ');
    if (filterType === 'general') return n.type !== 'order' && n.type !== 'alert' && n.type !== 'user';
    return true;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  // Detail Modal state
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [itemDetail, setItemDetail] = useState(null);
  const [itemType, setItemType] = useState(null); // 'order', 'product', 'voucher', 'general'

  // Reset page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredNotifications.length, currentPage, totalPages]);

  // Fetch item details when notification modal opens
  useEffect(() => {
    if (!selectedNotif) {
      setItemDetail(null);
      setItemType(null);
      return;
    }

    const fetchDetail = async () => {
      setDetailLoading(true);
      setItemDetail(null);
      try {
        const link = selectedNotif.link || '';
        const title = selectedNotif.title || '';
        const message = selectedNotif.message || '';
        const type = selectedNotif.type || '';

        // 1. Check if order notification
        if (link.includes('/orders/') || type === 'order' || title.toLowerCase().includes('đơn hàng') || title.includes('#')) {
          setItemType('order');
          let orderId = null;
          if (link.includes('/orders/')) {
            orderId = link.split('/orders/')[1]?.split('?')[0];
          }
          if (orderId && /^[0-9a-fA-F]{24}$/.test(orderId)) {
            const res = await orderAPI.getById(orderId).catch(() => null);
            if (res?.data) {
              setItemDetail(res.data);
              setDetailLoading(false);
              return;
            }
          }
          const codeMatch = title.match(/#([A-Za-z0-9]+)/);
          if (codeMatch && codeMatch[1]) {
            const code = codeMatch[1];
            const ordersRes = await orderAPI.getAll({ limit: 50 }).catch(() => null);
            const foundOrder = ordersRes?.data?.find(o => 
              o.orderCode?.toUpperCase() === code.toUpperCase() || o._id === code
            );
            if (foundOrder) {
              const detailRes = await orderAPI.getById(foundOrder._id).catch(() => null);
              setItemDetail(detailRes?.data || foundOrder);
              setDetailLoading(false);
              return;
            }
          }
        }

        // 2. Check if product notification
        if (link.includes('/product/') || link.includes('/products/')) {
          setItemType('product');
          const productId = link.split('/product/')[1]?.split('?')[0] || link.split('/products/')[1]?.split('?')[0];
          if (productId && /^[0-9a-fA-F]{24}$/.test(productId)) {
            const res = await productAPI.getById(productId).catch(() => null);
            if (res?.data) {
              setItemDetail(res.data);
              setDetailLoading(false);
              return;
            }
          }
        }

        // 3. Check if voucher / promo
        if (type === 'promo' || link.includes('/vouchers') || title.toLowerCase().includes('giảm giá') || title.toLowerCase().includes('voucher')) {
          setItemType('voucher');
          setDetailLoading(false);
          return;
        }

        setItemType('general');
      } catch (err) {
        console.error('Failed to load detail:', err);
        setItemType('general');
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedNotif]);

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      markAsRead(n.id || n._id);
    }
    setSelectedNotif(n);
  };

  const handleMarkAsReadBtn = (e, id) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const getNotifIcon = (type, title = '') => {
    if (type === 'order' || title.includes('đơn hàng')) return <Package className="w-5 h-5 text-blue-500" />;
    if (type === 'promo' || title.includes('Giảm Giá') || title.includes('Mã')) return <Gift className="w-5 h-5 text-amber-500" />;
    if (type === 'alert') return <AlertCircle className="w-5 h-5 text-red-500" />;
    return <Bell className="w-5 h-5 text-primary-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <Bell size={22} className={isCustomerOrGuest ? "text-primary-600 animate-pulse" : "text-indigo-600 animate-pulse"} />
            <span>{isCustomerOrGuest ? 'Thông báo của bạn' : `Trung Tâm Thông Báo Quản Trị (${user?.role})`}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isCustomerOrGuest 
              ? 'Cập nhật trạng thái đơn hàng, ưu đãi đặc biệt và tin tức mới nhất từ hệ thống'
              : 'Theo dõi hoạt động kinh doanh, đơn hàng từ khách hàng, cảnh báo tồn kho và các yêu cầu hỗ trợ'}
          </p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            className={`self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs ${
              isCustomerOrGuest 
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50'
                : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
            }`}
          >
            <Check size={14} />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </div>

      {!isCustomerOrGuest && (
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'order', label: '📦 Đơn hàng & Giao dịch' },
            { key: 'alert', label: '⚠️ Cảnh báo & Tồn kho' },
            { key: 'ticket', label: '🎧 Hỗ trợ & Ticket' },
            { key: 'general', label: '📢 Thông báo chung' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => { setFilterType(f.key); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === f.key
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4 shadow-inner">
            <Bell size={28} />
          </div>
          <p className="font-bold text-slate-700 dark:text-slate-300 text-base">Bạn chưa có thông báo nào</p>
          <p className="text-xs text-slate-400 mt-1">
            {isCustomerOrGuest 
              ? 'Các thông báo về đơn hàng và khuyến mãi sẽ xuất hiện tại đây'
              : 'Các thông báo quản trị, đơn hàng mới và cảnh báo hệ thống sẽ hiển thị tại đây'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedNotifications.map(n => {
              const id = n.id || n._id;
              return (
                <div 
                  key={id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer group hover:shadow-md hover:-translate-y-0.5 ${
                    n.isRead 
                      ? 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700' 
                      : (isCustomerOrGuest 
                          ? 'bg-gradient-to-r from-blue-50/80 to-primary-50/40 dark:from-blue-950/20 dark:to-primary-950/10 border-blue-200/80 dark:border-blue-800/50 hover:border-primary-400 dark:hover:border-primary-600 shadow-sm'
                          : 'bg-gradient-to-r from-slate-900/5 via-indigo-950/10 to-purple-950/10 dark:from-slate-800/80 dark:to-indigo-950/40 border-indigo-500/40 hover:border-indigo-500 shadow-sm border-l-4 border-l-indigo-600')
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110 ${
                      n.isRead 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' 
                        : (isCustomerOrGuest ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm border border-blue-100 dark:border-blue-900/30' : 'bg-indigo-600 text-white shadow-sm')
                    }`}>
                      {getNotifIcon(n.type, n.title)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {!isCustomerOrGuest && (
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-1">
                          {n.type === 'order' ? 'Quản lý đơn hàng' : n.type === 'alert' ? 'Cảnh báo hệ thống' : 'Thông báo nội bộ'}
                        </span>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-bold leading-snug ${
                          n.isRead ? 'text-slate-900 dark:text-slate-100 font-semibold' : (isCustomerOrGuest ? 'text-primary-700 dark:text-primary-300 font-extrabold' : 'text-indigo-950 dark:text-indigo-200 font-black')
                        }`}>
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <button 
                            onClick={(e) => handleMarkAsReadBtn(e, id)} 
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all shrink-0" 
                            title="Đánh dấu đã đọc"
                          >
                            <Check size={15} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                      
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(n.createdAt || n.time || Date.now()).toLocaleString('vi-VN')}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 group-hover:underline">
                          Xem chi tiết <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Hiển thị <strong className="text-slate-900 dark:text-white font-bold">{startIndex + 1}</strong> -{' '}
                <strong className="text-slate-900 dark:text-white font-bold">{Math.min(startIndex + itemsPerPage, filteredNotifications.length)}</strong> trong tổng số{' '}
                <strong className="text-slate-900 dark:text-white font-bold">{filteredNotifications.length}</strong> thông báo
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold shadow-2xs"
                  title="Trang trước"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all ${
                      currentPage === page
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25 scale-105'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold shadow-2xs"
                  title="Trang sau"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal / Dialog */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-premium dark:shadow-premium-dark border border-slate-200/80 dark:border-slate-800 animate-scale-in relative overflow-hidden space-y-5 max-h-[90vh] flex flex-col">
            {/* Ambient Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-600 via-blue-500 to-accent-500" />
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pt-1 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 shadow-inner border border-primary-100 dark:border-primary-800/50">
                  {getNotifIcon(selectedNotif.type, selectedNotif.title)}
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-1">
                    {itemType === 'order' ? 'Thông báo đơn hàng' : itemType === 'product' ? 'Sản phẩm mới' : itemType === 'voucher' ? 'Khuyến mãi & Ưu đãi' : 'Thông báo hệ thống'}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display leading-snug">
                    {selectedNotif.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <Clock size={12} /> {new Date(selectedNotif.createdAt || selectedNotif.time || Date.now()).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNotif(null)} 
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto custom-scrollbar pr-1 flex-1 space-y-4">
              {/* Message Content */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                {selectedNotif.message}
              </div>

              {/* Dynamic Detail Content (Product / Order / Voucher) */}
              {detailLoading ? (
                <div className="py-8 flex flex-col items-center justify-center text-center text-slate-500 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                  <span className="text-xs font-bold">Đang tải chi tiết sản phẩm / đơn hàng...</span>
                </div>
              ) : (
                <>
                  {/* ORDER DETAIL SUMMARY */}
                  {itemType === 'order' && itemDetail && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mã đơn hàng</span>
                          <span className="text-sm font-mono font-black text-slate-900 dark:text-white">
                            #{itemDetail.orderCode || itemDetail._id?.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide border shadow-2xs ${statusConfig[itemDetail.orderStatus]?.color || 'bg-slate-100 text-slate-700'}`}>
                          {statusConfig[itemDetail.orderStatus]?.label || itemDetail.orderStatus}
                        </span>
                      </div>

                      {/* Items inside Order */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Sản phẩm trong đơn:</span>
                        {itemDetail.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50">
                            <img 
                              src={item.image || item.product?.images?.[0] || 'https://via.placeholder.com/50'} 
                              alt={item.name} 
                              className="w-11 h-11 object-contain rounded-lg bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 shrink-0" 
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name || item.product?.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {item.color && <span>Màu: <strong className="text-slate-700 dark:text-slate-300">{item.color}</strong></span>}
                                {item.size && <span className="ml-2">Bản: <strong className="text-slate-700 dark:text-slate-300">{item.size}</strong></span>}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">
                                {formatPrice(item.price || 0)}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold">x{item.quantity || 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">Tổng thanh toán:</span>
                        <span className="text-base font-mono font-extrabold text-accent-600 dark:text-accent-400">
                          {formatPrice(itemDetail.totalAmount || itemDetail.totalPrice || 0)}
                        </span>
                      </div>

                      <button 
                        onClick={() => { setSelectedNotif(null); if (isCustomerOrGuest) navigate('/orders/' + itemDetail._id); else navigate(`/${user?.role}/orders`); }}
                        className={`w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 active:scale-98 ${
                          isCustomerOrGuest ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/25' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                        }`}
                      >
                        <span>{isCustomerOrGuest ? 'Xem chi tiết đầy đủ đơn hàng' : `⚡ Xử lý đơn hàng trên Trang Quản Trị (${user?.role})`}</span>
                        <ExternalLink size={15} />
                      </button>
                    </div>
                  )}

                  {/* PRODUCT DETAIL SUMMARY */}
                  {itemType === 'product' && itemDetail && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs space-y-3">
                      <div className="flex items-center gap-4">
                        <img 
                          src={itemDetail.images?.[0] || 'https://via.placeholder.com/80'} 
                          alt={itemDetail.name} 
                          className="w-20 h-20 object-contain rounded-xl bg-slate-50 dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-1">
                            {itemDetail.brand || 'Sản phẩm chính hãng'}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{itemDetail.name}</h4>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-base font-mono font-extrabold text-accent-600 dark:text-accent-400">
                              {formatPrice(itemDetail.salePrice > 0 ? itemDetail.salePrice : itemDetail.price)}
                            </span>
                            {itemDetail.salePrice > 0 && itemDetail.price > itemDetail.salePrice && (
                              <span className="text-xs font-mono text-slate-400 line-through">
                                {formatPrice(itemDetail.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => { setSelectedNotif(null); if (isCustomerOrGuest) navigate('/product/' + itemDetail._id); else navigate(`/${user?.role}/products`); }}
                        className={`w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 active:scale-98 ${
                          isCustomerOrGuest ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/25' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                        }`}
                      >
                        <span>{isCustomerOrGuest ? 'Xem chi tiết sản phẩm' : `🛠️ Quản lý sản phẩm & Tồn kho (${user?.role})`}</span>
                        <ExternalLink size={15} />
                      </button>
                    </div>
                  )}

                  {/* VOUCHER / PROMO SUMMARY */}
                  {itemType === 'voucher' && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-2xs space-y-3">
                      <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300 font-extrabold text-sm">
                        <Gift className="w-5 h-5 text-amber-500 animate-bounce" />
                        <span>{isCustomerOrGuest ? 'Khuyến mãi đặc biệt dành riêng cho bạn' : 'Chiến dịch Khuyến Mãi / Voucher Hệ Thống'}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {isCustomerOrGuest 
                          ? 'Khám phá kho voucher giảm giá, ưu đãi Freeship và nhiều quà tặng giá trị tại ví khuyến mãi TechPhone Wallet.'
                          : 'Quản lý, tạo mới và theo dõi hiệu quả các mã giảm giá và chương trình khuyến mãi trong hệ thống.'}
                      </p>
                      <button 
                        onClick={() => { setSelectedNotif(null); if (isCustomerOrGuest) navigate(selectedNotif.link || '/vouchers'); else navigate(`/${user?.role}/vouchers`); }}
                        className={`w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 active:scale-98 ${
                          isCustomerOrGuest ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                        }`}
                      >
                        <span>{isCustomerOrGuest ? 'Xem danh sách Mã Giảm Giá' : '🏷️ Quản lý chiến dịch Khuyến Mãi'}</span>
                        <ExternalLink size={15} />
                      </button>
                    </div>
                  )}

                  {/* GENERAL / DEFAULT LINK BUTTON */}
                  {itemType === 'general' && selectedNotif.link && (
                    <button 
                      onClick={() => { setSelectedNotif(null); if (isCustomerOrGuest) navigate(selectedNotif.link); else { if (!selectedNotif.link.startsWith('/profile')) navigate(selectedNotif.link); else navigate(`/${user?.role}`); } }}
                      className={`w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 active:scale-98 ${
                        isCustomerOrGuest ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/25' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                      }`}
                    >
                      <span>{isCustomerOrGuest ? 'Đi tới trang liên quan' : `🛡️ Vào Bảng điều khiển Quản trị (${user?.role})`}</span>
                      <ExternalLink size={15} />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-all active:scale-95"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationList;

