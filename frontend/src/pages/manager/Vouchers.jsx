import React, { useState, useEffect } from 'react';
import { voucherAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, Search, Ticket, CheckCircle, XCircle,
  ToggleLeft, ToggleRight, RefreshCw, Calendar, Tag, DollarSign,
  Percent, Truck, ChevronDown, Bell, Gift, CreditCard, ShieldAlert, Store, Clock, Zap
} from 'lucide-react';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Giảm theo %', icon: Percent },
  { value: 'fixed', label: 'Giảm số tiền cố định', icon: DollarSign },
  { value: 'freeship', label: 'Miễn phí vận chuyển', icon: Truck },
];

const SCOPE_OPTIONS = [
  { value: 'platform_discount', label: 'Mã Giảm Giá Hệ Thống', icon: Tag, color: 'primary' },
  { value: 'platform_freeship', label: 'Miễn Phí Vận Chuyển Xtra', icon: Truck, color: 'emerald' },
  { value: 'shop_discount', label: 'Mã Thương Hiệu / Shop', icon: Store, color: 'indigo' },
];

const PAYMENT_RESTRICTION_OPTIONS = [
  { value: 'all', label: 'Tất cả phương thức thanh toán' },
  { value: 'cod', label: 'Tiền mặt khi nhận hàng (COD)' },
  { value: 'bank_transfer', label: 'Chuyển khoản QR Bank 24/7' },
  { value: 'momo', label: 'Ví điện tử MoMo' },
  { value: 'vnpay', label: 'Cổng thanh toán VNPay' },
];

const BRAND_OPTIONS = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Google Pixel', 'Honor', 'Nokia', 'Asus ROG'];

const emptyForm = {
  code: '',
  title: '',
  description: '',
  scope: 'platform_discount',
  badgeText: 'Ưu Đãi',
  discountType: 'fixed',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderValue: '',
  usageLimit: 100,
  paymentMethodRestriction: 'all',
  isDaily: false,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  applicableTo: 'all',
  applicableBrands: [],
  isActive: true,
};

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const ManagerVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await voucherAPI.getAllAdmin();
      setVouchers(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      code: v.code || '',
      title: v.title || '',
      description: v.description || '',
      scope: v.scope || (v.discountType === 'freeship' ? 'platform_freeship' : v.applicableTo === 'brand' ? 'shop_discount' : 'platform_discount'),
      badgeText: v.badgeText || 'Ưu Đãi',
      discountType: v.discountType || 'fixed',
      discountValue: v.discountValue || '',
      maxDiscountAmount: v.maxDiscountAmount || '',
      minOrderValue: v.minOrderValue || '',
      usageLimit: v.usageLimit || 100,
      paymentMethodRestriction: v.paymentMethodRestriction || 'all',
      isDaily: v.isDaily || false,
      startDate: v.startDate ? v.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: v.endDate ? v.endDate.split('T')[0] : '',
      applicableTo: v.applicableTo || 'all',
      applicableBrands: v.applicableBrands || [],
      isActive: v.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error('Vui lòng nhập mã voucher'); return; }
    if (!form.title.trim()) { toast.error('Vui lòng nhập tên voucher'); return; }
    if (!form.discountValue || Number(form.discountValue) <= 0) { toast.error('Vui lòng nhập giá trị giảm hợp lệ'); return; }
    if (!form.endDate) { toast.error('Vui lòng chọn ngày kết thúc'); return; }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    const payload = {
      ...form,
      code: form.code.toUpperCase(),
      discountValue: Number(form.discountValue),
      maxDiscountAmount: Number(form.maxDiscountAmount) || 0,
      minOrderValue: Number(form.minOrderValue) || 0,
      usageLimit: Number(form.usageLimit) || 100,
    };

    // Sync applicableTo nếu scope là shop_discount
    if (payload.scope === 'shop_discount' && payload.applicableTo === 'all') {
      payload.applicableTo = 'brand';
    }

    setSubmitting(true);
    try {
      if (editing) {
        await voucherAPI.update(editing._id, payload);
        toast.success('Cập nhật voucher thành công');
      } else {
        await voucherAPI.create(payload);
        toast.success('Tạo voucher mới thành công');
      }
      setModalOpen(false);
      fetchVouchers();
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (v) => {
    try {
      await voucherAPI.update(v._id, { isActive: !v.isActive });
      toast.success(v.isActive ? 'Đã tắt voucher' : 'Đã bật voucher');
      fetchVouchers();
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Xóa voucher "${code}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await voucherAPI.delete(id);
      toast.success('Đã xóa voucher');
      fetchVouchers();
    } catch (err) {
      toast.error(err.message || 'Không thể xóa voucher');
    }
  };

  const handleResetDaily = async () => {
    if (!window.confirm('Bạn có chắc muốn làm mới lượt dùng của TẤT CẢ voucher đang hoạt động về 0? (Cơ chế 00:00 hàng ngày)')) return;
    setLoading(true);
    try {
      await voucherAPI.resetDaily();
      toast.success('🎉 Đã làm mới lượt dùng toàn bộ voucher về 0!');
      fetchVouchers();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi làm mới voucher');
      setLoading(false);
    }
  };

  const handleNotify = async (id, code) => {
    if (!window.confirm(`Gửi thông báo Push đến tất cả khách hàng về voucher "${code}"?`)) return;
    try {
      await voucherAPI.notifyUsers(id);
      toast.success(`Đã gửi thông báo voucher ${code} thành công!`);
    } catch (err) {
      toast.error(err.message || 'Lỗi khi gửi thông báo');
    }
  };

  const toggleBrand = (brand) => {
    setForm(prev => ({
      ...prev,
      applicableBrands: prev.applicableBrands.includes(brand)
        ? prev.applicableBrands.filter(b => b !== brand)
        : [...prev.applicableBrands, brand]
    }));
  };

  const isExpired = (v) => new Date(v.endDate) < new Date();
  const isExhausted = (v) => v.usedCount >= v.usageLimit;

  const getStatusInfo = (v) => {
    if (!v.isActive) return { label: 'Đã tắt', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' };
    if (isExpired(v)) return { label: 'Hết hạn', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    if (isExhausted(v)) return { label: 'Hết lượt', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
    return { label: 'Đang hoạt động', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  };

  const getDiscountLabel = (v) => {
    if (v.discountType === 'percentage') return `-${v.discountValue}%`;
    if (v.discountType === 'freeship') return 'Freeship Xtra';
    return `-${formatPrice(v.discountValue)}`;
  };

  const getScopeBadge = (scope, type) => {
    if (scope === 'platform_freeship' || type === 'freeship') {
      return { label: 'Freeship Xtra', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' };
    }
    if (scope === 'shop_discount') {
      return { label: 'Mã Shop / Brand', cls: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800' };
    }
    return { label: 'Hệ Thống TechPhone', cls: 'bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-300 border border-primary-300 dark:border-primary-800' };
  };

  const filtered = vouchers.filter(v => {
    const matchSearch = v.code?.toLowerCase().includes(search.toLowerCase()) || v.title?.toLowerCase().includes(search.toLowerCase());
    const matchScope =
      scopeFilter === 'all' ||
      v.scope === scopeFilter ||
      (scopeFilter === 'platform_freeship' && v.discountType === 'freeship') ||
      (scopeFilter === 'shop_discount' && v.applicableTo === 'brand');
    return matchSearch && matchScope;
  });

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Gift className="w-7 h-7 text-primary-600" /> Quản lý Voucher TechPhone (Combo 3 Tầng)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {vouchers.length} voucher · {vouchers.filter(v => v.isActive && !isExpired(v)).length} đang hoạt động · Hỗ trợ cộng gộp 3 tầng ưu đãi
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleResetDaily}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-sm"
            title="Làm mới lượt sử dụng hàng ngày về 0 lúc 00:00"
          >
            <RefreshCw className="w-5 h-5" /> Làm mới Daily (00:00)
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white font-black transition-all shadow-lg shadow-primary/20 active:scale-95 text-sm"
          >
            <Plus className="w-5 h-5" /> Tạo Voucher mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng voucher', value: vouchers.length, color: 'blue', icon: Ticket },
          { label: 'Đang hoạt động', value: vouchers.filter(v => v.isActive && !isExpired(v) && !isExhausted(v)).length, color: 'green', icon: CheckCircle },
          { label: 'Freeship Xtra', value: vouchers.filter(v => v.scope === 'platform_freeship' || v.discountType === 'freeship').length, color: 'emerald', icon: Truck },
          { label: 'Đã sử dụng', value: vouchers.reduce((s, v) => s + (v.usedCount || 0), 0), color: 'orange', icon: Tag },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table & Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Tìm kiếm theo mã, tên voucher..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-medium"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {[
              { value: 'all', label: 'Tất cả tầng' },
              { value: 'platform_freeship', label: '🚚 Freeship Xtra' },
              { value: 'platform_discount', label: '🏷️ Hệ Thống TechPhone' },
              { value: 'shop_discount', label: '🏬 Mã Shop / Brand' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setScopeFilter(tab.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  scopeFilter === tab.value
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Chưa có voucher nào khớp với điều kiện tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Tầng / Mã Voucher</th>
                  <th className="py-3 px-4">Giảm giá & Điều kiện</th>
                  <th className="py-3 px-4">Thanh toán & Nhãn</th>
                  <th className="py-3 px-4">Sử dụng (Daily)</th>
                  <th className="py-3 px-4">Hiệu lực</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {filtered.map((v) => {
                  const status = getStatusInfo(v);
                  const scopeBadge = getScopeBadge(v.scope, v.discountType);
                  return (
                    <tr key={v._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-orange-600 dark:text-orange-400 text-base">{v.code}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${scopeBadge.cls}`}>
                              {scopeBadge.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{v.title}</p>
                          {v.applicableTo === 'brand' && v.applicableBrands?.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {v.applicableBrands.map(b => (
                                <span key={b} className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                                  {b}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-black text-red-600 dark:text-red-400 text-sm">{getDiscountLabel(v)}</div>
                        {v.discountType === 'percentage' && v.maxDiscountAmount > 0 && (
                          <div className="text-[11px] text-gray-500">Tối đa {formatPrice(v.maxDiscountAmount)}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-0.5">
                          {v.minOrderValue > 0 ? `Đơn từ ${formatPrice(v.minOrderValue)}` : 'Đơn từ 0đ'}
                        </div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg text-xs font-bold">
                          <CreditCard size={13} />
                          <span>
                            {v.paymentMethodRestriction === 'cod' ? 'Chỉ COD' :
                             v.paymentMethodRestriction === 'momo' ? 'Chỉ MoMo' :
                             v.paymentMethodRestriction === 'vnpay' ? 'Chỉ VNPay' :
                             v.paymentMethodRestriction === 'bank_transfer' ? 'Chỉ QR Bank' : 'Tất cả TT'}
                          </span>
                        </div>
                        <div className="flex gap-1.5 items-center">
                          {v.badgeText && (
                            <span className="bg-red-500/10 text-red-600 text-[10px] font-black px-2 py-0.5 rounded">
                              {v.badgeText}
                            </span>
                          )}
                          {v.isDaily && (
                            <span className="bg-amber-500/10 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-0.5" title="Làm mới 00:00 hằng ngày">
                              <Clock size={11} /> Daily
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <span className="font-bold text-gray-800 dark:text-gray-200">{v.usedCount || 0}</span>
                          <span className="text-gray-400"> / {v.usageLimit}</span>
                        </div>
                        <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, ((v.usedCount || 0) / v.usageLimit) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" /> {formatDate(v.startDate)}
                        </div>
                        <div className="flex items-center gap-1 text-red-500 dark:text-red-400 font-bold">
                          <Calendar className="w-3.5 h-3.5" /> {formatDate(v.endDate)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleNotify(v._id, v.code)}
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
                            title="Push Thông báo nhanh cho toàn bộ User"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(v)}
                            className={`p-2 rounded-xl transition-colors ${v.isActive ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title={v.isActive ? 'Tắt voucher' : 'Bật voucher'}
                          >
                            {v.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button onClick={() => openEdit(v)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors" title="Sửa">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(v._id, v.code)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Voucher */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-gray-100 dark:border-gray-700 my-8">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Gift className="text-primary-600 w-6 h-6" />
              {editing ? '✏️ Cập nhật Voucher TechPhone' : '🎫 Tạo Combo Voucher 3 Tầng'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tầng Voucher (Scope) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Tầng áp dụng (Cộng gộp 3 tầng) *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SCOPE_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value} type="button"
                      onClick={() => {
                        const newDiscountType = value === 'platform_freeship' ? 'freeship' : form.discountType === 'freeship' ? 'fixed' : form.discountType;
                        setForm({ ...form, scope: value, discountType: newDiscountType });
                      }}
                      className={`flex items-center gap-2.5 p-3.5 rounded-2xl border-2 text-xs font-black transition-all ${
                        form.scope === value
                          ? 'border-primary bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-300 shadow-md scale-[1.02]'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mã Voucher *</label>
                  <div className="flex gap-2">
                    <input
                      type="text" required
                      placeholder="VD: TECHFREESHIP30, TECHPHONE100..."
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className={`${inputCls} font-mono font-black text-primary-600`}
                      disabled={!!editing}
                    />
                    {!editing && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, code: generateCode() })}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 font-bold text-xs flex items-center gap-1 shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Tạo
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nhãn hiển thị ngắn (Badge) *</label>
                  <input
                    type="text" required
                    placeholder="VD: Xtra, Sàn, Độc quyền, VIP..."
                    value={form.badgeText}
                    onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tên Voucher (Tên chương trình) *</label>
                <input
                  type="text" required
                  placeholder="VD: Miễn phí vận chuyển Xtra giảm 50k cho đơn từ 300k"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Loại giảm giá *</label>
                <div className="grid grid-cols-3 gap-3">
                  {DISCOUNT_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value} type="button"
                      onClick={() => setForm({ ...form, discountType: value })}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                        form.discountType === value
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Giá trị giảm * {form.discountType === 'percentage' ? '(%)' : '(VNĐ)'}
                  </label>
                  <input
                    type="number" required min="1"
                    placeholder={form.discountType === 'percentage' ? 'VD: 10' : 'VD: 50000'}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className={inputCls}
                  />
                </div>
                {form.discountType === 'percentage' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Giảm tối đa (VNĐ)</label>
                    <input
                      type="number" min="0"
                      placeholder="0 = không giới hạn"
                      value={form.maxDiscountAmount}
                      onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              {/* Min Order & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number" min="0"
                    placeholder="0 = không yêu cầu"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Số lượt sử dụng tối đa *</label>
                  <input
                    type="number" min="1" required
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Payment Restriction & Daily */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Điều kiện phương thức thanh toán</label>
                  <select
                    value={form.paymentMethodRestriction}
                    onChange={(e) => setForm({ ...form, paymentMethodRestriction: e.target.value })}
                    className={inputCls}
                  >
                    {PAYMENT_RESTRICTION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 w-full">
                    <input
                      type="checkbox" checked={form.isDaily}
                      onChange={(e) => setForm({ ...form, isDaily: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <p className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <Clock size={14} /> Voucher Daily (00:00)
                      </p>
                      <p className="text-[10px] text-amber-700/80 dark:text-amber-400">Tự động làm mới lượt dùng về 0 mỗi nửa đêm</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Ngày bắt đầu *</label>
                  <input
                    type="date" required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Ngày kết thúc *</label>
                  <input
                    type="date" required
                    min={form.startDate}
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Applicable Brands if Scope is shop_discount */}
              {form.scope === 'shop_discount' && (
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <Store size={15} /> Chọn các thương hiệu áp dụng mã này:
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, applicableBrands: BRAND_OPTIONS })}
                      className="text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      Chọn tất cả
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {BRAND_OPTIONS.map(brand => (
                      <button
                        key={brand} type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          form.applicableBrands.includes(brand)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                  {form.applicableBrands.length === 0 && (
                    <p className="text-[11px] text-amber-600 font-semibold">💡 Nếu không chọn thương hiệu nào, mã sẽ áp dụng cho tất cả sản phẩm của Shop</p>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mô tả chi tiết thể lệ chương trình</label>
                <textarea
                  rows="2"
                  placeholder="Mô tả điều kiện áp dụng, hướng dẫn sử dụng voucher..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Active Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Kích hoạt Voucher ngay</p>
                  <p className="text-xs text-gray-500">Người dùng có thể tìm thấy và lưu mã này vào Ví Voucher</p>
                </div>
              </label>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button" onClick={() => setModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 font-bold text-sm transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Đang lưu...' : editing ? 'Lưu Cập Nhật' : 'Tạo Voucher TechPhone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerVouchers;
