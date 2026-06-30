import React, { useState, useEffect } from 'react';
import { voucherAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, Search, Ticket, CheckCircle, XCircle,
  ToggleLeft, ToggleRight, RefreshCw, Calendar, Tag, DollarSign,
  Percent, Truck, ChevronDown, Bell
} from 'lucide-react';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Giảm theo %', icon: Percent },
  { value: 'fixed', label: 'Giảm số tiền cố định', icon: DollarSign },
  { value: 'freeship', label: 'Miễn phí vận chuyển', icon: Truck },
];

const SCOPE_OPTIONS = [
  { value: 'all', label: 'Toàn bộ cửa hàng' },
  { value: 'brand', label: 'Theo thương hiệu' },
  { value: 'category', label: 'Theo danh mục' },
];

const BRAND_OPTIONS = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Google Pixel', 'Honor', 'Nokia', 'Asus ROG'];

const emptyForm = {
  code: '',
  title: '',
  description: '',
  discountType: 'fixed',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderValue: '',
  usageLimit: 100,
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
      discountType: v.discountType || 'fixed',
      discountValue: v.discountValue || '',
      maxDiscountAmount: v.maxDiscountAmount || '',
      minOrderValue: v.minOrderValue || '',
      usageLimit: v.usageLimit || 100,
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

    const payload = {
      ...form,
      code: form.code.toUpperCase(),
      discountValue: Number(form.discountValue),
      maxDiscountAmount: Number(form.maxDiscountAmount) || 0,
      minOrderValue: Number(form.minOrderValue) || 0,
      usageLimit: Number(form.usageLimit) || 100,
    };

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
    if (!window.confirm('Bạn có chắc muốn làm mới lượt dùng của TẤT CẢ voucher đang hoạt động về 0?')) return;
    setLoading(true);
    try {
      await voucherAPI.resetDaily();
      toast.success('Đã làm mới toàn bộ voucher');
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
    if (v.discountType === 'freeship') return 'Freeship';
    return `-${formatPrice(v.discountValue)}`;
  };

  const filtered = vouchers.filter(v =>
    v.code?.toLowerCase().includes(search.toLowerCase()) ||
    v.title?.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-7 h-7 text-primary" /> Quản lý Voucher & Khuyến mãi
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {vouchers.length} voucher · {vouchers.filter(v => v.isActive && !isExpired(v)).length} đang hoạt động
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleResetDaily}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-sm"
          >
            <RefreshCw className="w-5 h-5" /> Làm mới hằng ngày
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
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
          { label: 'Đã hết hạn', value: vouchers.filter(isExpired).length, color: 'red', icon: XCircle },
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

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative max-w-md mb-6">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Tìm kiếm voucher..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Chưa có voucher nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Voucher</th>
                  <th className="py-3 px-4">Giảm giá</th>
                  <th className="py-3 px-4">Điều kiện</th>
                  <th className="py-3 px-4">Sử dụng</th>
                  <th className="py-3 px-4">Hiệu lực</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {filtered.map((v) => {
                  const status = getStatusInfo(v);
                  return (
                    <tr key={v._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-mono font-black text-primary text-base">{v.code}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{v.title}</p>
                          {v.applicableTo === 'brand' && v.applicableBrands?.length > 0 && (
                            <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                              {v.applicableBrands.join(', ')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-black text-green-600 dark:text-green-400 text-sm">{getDiscountLabel(v)}</span>
                        {v.discountType === 'percentage' && v.maxDiscountAmount > 0 && (
                          <p className="text-[10px] text-gray-400">Tối đa {formatPrice(v.maxDiscountAmount)}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        {v.minOrderValue > 0 ? `Từ ${formatPrice(v.minOrderValue)}` : 'Không yêu cầu'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <span className="font-bold text-gray-800 dark:text-gray-200">{v.usedCount || 0}</span>
                          <span className="text-gray-400"> / {v.usageLimit}</span>
                        </div>
                        <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(100, ((v.usedCount || 0) / v.usageLimit) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Calendar className="w-3 h-3" /> {formatDate(v.startDate)}
                        </div>
                        <div className="flex items-center gap-1 text-red-500 dark:text-red-400 font-medium">
                          <Calendar className="w-3 h-3" /> {formatDate(v.endDate)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleNotify(v._id, v.code)}
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
                            title="Push Thông báo nhanh"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-700 my-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
              {editing ? '✏️ Cập nhật Voucher' : '🎫 Tạo Voucher mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mã Voucher *</label>
                <div className="flex gap-2">
                  <input
                    type="text" required
                    placeholder="VD: GIAM10, FREESHIP..."
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className={`${inputCls} font-mono font-bold flex-1`}
                    disabled={!!editing}
                  />
                  {!editing && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, code: generateCode() })}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap"
                    >
                      <RefreshCw className="w-4 h-4" /> Tạo ngẫu nhiên
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tên Voucher *</label>
                <input
                  type="text" required
                  placeholder="VD: Giảm 10% Toàn Bộ Đơn Hàng"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Loại giảm giá *</label>
                <div className="grid grid-cols-3 gap-2">
                  {DISCOUNT_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value} type="button"
                      onClick={() => setForm({ ...form, discountType: value })}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${form.discountType === value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Value */}
              <div className="grid grid-cols-2 gap-4">
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

              {/* Min Order & Usage */}
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Số lượt sử dụng tối đa</label>
                  <input
                    type="number" min="1" required
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Ngày bắt đầu</label>
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

              {/* Scope */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Phạm vi áp dụng</label>
                <div className="flex gap-2 flex-wrap">
                  {SCOPE_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value} type="button"
                      onClick={() => setForm({ ...form, applicableTo: value, applicableBrands: [] })}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${form.applicableTo === value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {form.applicableTo === 'brand' && (
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Chọn thương hiệu áp dụng:</p>
                    <div className="flex flex-wrap gap-2">
                      {BRAND_OPTIONS.map(brand => (
                        <button
                          key={brand} type="button"
                          onClick={() => toggleBrand(brand)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${form.applicableBrands.includes(brand) ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary'}`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mô tả (tùy chọn)</label>
                <textarea
                  rows="2"
                  placeholder="Mô tả điều kiện áp dụng..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Active */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Kích hoạt voucher ngay</p>
                  <p className="text-xs text-gray-500">Voucher sẽ có thể sử dụng ngay sau khi lưu</p>
                </div>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button" onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-sm transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-blue-600 transition-colors shadow-md text-sm disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo voucher'}
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
