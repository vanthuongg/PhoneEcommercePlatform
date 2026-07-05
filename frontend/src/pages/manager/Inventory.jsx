import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { productAPI, categoryAPI, inventoryAPI, notificationAPI } from '../../services/api';
import {
  Package, Search, AlertTriangle, Edit, X, Loader2, History,
  ArrowDownLeft, ArrowUpRight, Plus, Sparkles, Filter, CheckCircle2,
  TrendingUp, TrendingDown, DollarSign, RefreshCw, FileText, Building2,
  HelpCircle, ArrowRight, Layers, Bell, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const Inventory = () => {
  const { user } = useAuth();
  const roleLabel = { admin: 'Quản trị viên', manager: 'Quản lý', staff: 'Nhân viên kho' };

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0, totalStock: 0, totalValue: 0,
    lowStock: 0, outOfStock: 0, monthImportQty: 0, monthExportQty: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'import' | 'export' | 'ledger'

  // Stock Balance tab filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all | low | out
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);

  // Quick adjust modal
  const [editStock, setEditStock] = useState(null); // { product, isVariant, variantsState }
  const [saving, setSaving] = useState(false);

  // Staff Stock Request modal state
  const [requestModal, setRequestModal] = useState(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Stock In / Out form state
  const [formType, setFormType] = useState('import'); // 'import' | 'export'
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [qtyInput, setQtyInput] = useState('');
  const [unitPriceInput, setUnitPriceInput] = useState('');
  const [supplierInput, setSupplierInput] = useState('Apple Vietnam');
  const [reasonInput, setReasonInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [submittingTx, setSubmittingTx] = useState(false);

  // Ledger / History tab states
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [ledgerType, setLedgerType] = useState('all');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPagination, setLedgerPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Fetch initial data & stats
  const fetchStats = async () => {
    try {
      const res = await inventoryAPI.getStats();
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Error fetching inventory stats:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, search, category: categoryFilter, showAll: true };
      if (stockFilter === 'low') { params.maxStock = 10; params.minStock = 1; }
      if (stockFilter === 'out') { params.maxStock = 0; params.minStock = 0; }
      const res = await productAPI.getAll(params);
      setProducts(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      toast.error('Lỗi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await inventoryAPI.getLogs({
        page: ledgerPage,
        limit: 20,
        type: ledgerType === 'all' ? undefined : ledgerType,
        search: ledgerSearch || undefined
      });
      setLogs(res.data || []);
      setLedgerPagination(res.pagination || {});
    } catch (err) {
      toast.error('Lỗi tải thẻ kho / lịch sử');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data || []));
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'stock' || activeTab === 'import' || activeTab === 'export') {
      fetchProducts();
    }
  }, [page, search, categoryFilter, stockFilter, activeTab]);

  useEffect(() => {
    if (activeTab === 'ledger') {
      fetchLogs();
    }
  }, [ledgerPage, ledgerType, ledgerSearch, activeTab]);

  // When tab changes to import/export, reset form
  useEffect(() => {
    if (activeTab === 'import') {
      setFormType('import');
      setReasonInput('Nhập hàng từ nhà cung cấp');
      setSupplierInput('Apple Vietnam');
    } else if (activeTab === 'export') {
      setFormType('export');
      setReasonInput('Xuất chuyển chi nhánh HCM');
      setSupplierInput('');
    }
  }, [activeTab]);

  // Selected product object for form
  const selectedProductObj = products.find(p => p._id === selectedProductId);

  // When product changes in form, auto select first variant and set price
  useEffect(() => {
    if (selectedProductObj) {
      if (selectedProductObj.variants && selectedProductObj.variants.length > 0) {
        setSelectedVariantId(selectedProductObj.variants[0]._id || selectedProductObj.variants[0].id);
      } else if (selectedProductObj.colors && selectedProductObj.colors.length > 0) {
        setSelectedVariantId(selectedProductObj.colors[0]._id || selectedProductObj.colors[0].id);
      } else {
        setSelectedVariantId('');
      }
      setUnitPriceInput(selectedProductObj.price || 0);
    } else {
      setSelectedVariantId('');
      setUnitPriceInput('');
    }
  }, [selectedProductId]);

  // Get current stock of selected item in form
  const getCurrentSelectedStock = () => {
    if (!selectedProductObj) return 0;
    if (selectedVariantId) {
      const v = selectedProductObj.variants?.find(x => (x._id || x.id) === selectedVariantId);
      if (v) return Number(v.stock || 0);
      const c = selectedProductObj.colors?.find(x => (x._id || x.id) === selectedVariantId);
      if (c) return Number(c.stock || 0);
    }
    return Number(selectedProductObj.stock || 0);
  };

  // Submit Stock In / Out transaction
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }
    const qtyNum = Number(qtyInput);
    if (!qtyNum || qtyNum <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }
    if (formType === 'export' && qtyNum > getCurrentSelectedStock()) {
      toast.error(`Kho chỉ còn ${getCurrentSelectedStock()} sản phẩm, không đủ để xuất!`);
      return;
    }

    setSubmittingTx(true);
    try {
      const payload = {
        type: formType,
        productId: selectedProductId,
        variantId: selectedVariantId || undefined,
        quantity: qtyNum,
        unitPrice: Number(unitPriceInput || 0),
        reason: reasonInput,
        supplier: formType === 'import' ? supplierInput : undefined,
        note: noteInput,
      };

      const res = await inventoryAPI.createTransaction(payload);
      toast.success(res.message || 'Giao dịch kho thành công!');
      
      // Refresh stats & products
      fetchStats();
      fetchProducts();
      
      // Reset form fields
      setQtyInput('');
      setNoteInput('');
      
      // Switch to ledger tab after 1.5s to see log
      setTimeout(() => {
        setActiveTab('ledger');
      }, 1200);
    } catch (err) {
      toast.error(err.message || 'Giao dịch kho thất bại');
    } finally {
      setSubmittingTx(false);
    }
  };

  // Quick adjust stock in Modal
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (editStock.isVariant) {
      toast.error('Vui lòng lưu từng biến thể ở bảng dưới');
      return;
    }
    if (editStock.newStock < 0) { toast.error('Tồn kho không thể âm'); return; }
    setSaving(true);
    try {
      await inventoryAPI.createTransaction({
        type: 'adjust',
        productId: editStock.product._id,
        quantity: Number(editStock.newStock),
        reason: editStock.note || 'Điều chỉnh kiểm kê nhanh',
      });
      toast.success('Cập nhật tồn kho thành công!');
      fetchStats();
      fetchProducts();
      setEditStock(null);
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVariantStock = async (variantId, newStock) => {
    if (newStock < 0) { toast.error('Tồn kho không thể âm'); return; }
    try {
      await inventoryAPI.createTransaction({
        type: 'adjust',
        productId: editStock.product._id,
        variantId: variantId,
        quantity: Number(newStock),
        reason: 'Điều chỉnh kiểm kê biến thể',
      });
      toast.success('Cập nhật biến thể thành công!');
      fetchStats();
      fetchProducts();
      
      // Update modal state
      const updatedP = await productAPI.getById(editStock.product._id);
      if (updatedP.data) {
        setEditStock({ ...editStock, product: updatedP.data, variantsState: updatedP.data.variants });
      }
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    }
  };

  // Handle Staff submitting stock request
  const handleSendStockRequest = async (e) => {
    e.preventDefault();
    if (!requestModal.qty || Number(requestModal.qty) <= 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ!');
      return;
    }
    setSubmittingRequest(true);
    try {
      const p = requestModal.product;
      const typeLabel = requestModal.type === 'import' ? 'Nhập thêm' : 'Xuất bớt';
      const priorityLabel = requestModal.priority === 'high' ? '🔴 Khẩn cấp' : requestModal.priority === 'medium' ? '🟡 Trung bình' : '🟢 Bình thường';
      
      let variantName = '';
      if (requestModal.variantId) {
        const v = p.variants?.find(x => x._id === requestModal.variantId) || p.colors?.find(x => x._id === requestModal.variantId);
        if (v) {
          variantName = `${v.color || v.name || ''} ${v.ram || ''} ${v.storage || ''}`.trim();
        }
      }

      const title = `📢 [Yêu cầu ${requestModal.type === 'import' ? 'Nhập kho' : 'Xuất kho'}] ${p.name}`;
      const message = `Nhân viên kho ${user?.name || 'Staff'} đề xuất ${typeLabel} ${requestModal.qty} SP "${p.name}"${variantName ? ` (${variantName})` : ''}.\n• Mức ưu tiên: ${priorityLabel}\n• Lý do: ${requestModal.note || 'Khôi phục cân bằng kho'}`;

      // Gửi cho Admin
      await notificationAPI.create({
        title,
        message,
        type: 'alert',
        role: 'admin',
        link: '/admin/inventory'
      });
      // Gửi cho Manager
      await notificationAPI.create({
        title,
        message,
        type: 'alert',
        role: 'manager',
        link: '/manager/inventory'
      });

      toast.success('🎉 Đã gửi thông báo đề xuất nhập/xuất kho đến Quản lý & Admin thành công!');
      setRequestModal(null);
    } catch (err) {
      toast.error(err.message || 'Gửi thông báo thất bại');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Quick badge options
  const suppliersList = ['Apple Vietnam', 'Samsung Vina', 'Xiaomi Vietnam', 'Synnex FPT', 'Digiworld', 'Đại lý phân phối Khác'];
  const exportReasonsList = ['Xuất chuyển chi nhánh HCM', 'Xuất chuyển chi nhánh Hà Nội', 'Xuất bán sỉ / Đối tác', 'Xuất bảo hành / Đổi trả', 'Xuất hủy hàng lỗi / hỏng'];

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-8 sm:p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-black uppercase tracking-wider text-amber-300">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Hệ thống Quản lý Tồn - Xuất - Nhập
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Trung Tâm Quản Lý Kho Hàng</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Kiểm soát số lượng tồn kho theo thời gian thực, lập phiếu nhập kho, xuất kho và tra cứu thẻ kho minh bạch.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/15 self-start lg:self-auto">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'stock' ? 'bg-primary text-white shadow-lg shadow-blue-500/30 scale-105' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package size={16} /> 📦 Tồn Kho
            </button>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <>
                <button
                  onClick={() => setActiveTab('import')}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                    activeTab === 'import' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ArrowDownLeft size={16} className="text-emerald-400" /> 📥 Nhập Kho
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                    activeTab === 'export' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ArrowUpRight size={16} className="text-rose-400" /> 📤 Xuất Kho
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'ledger' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <History size={16} /> 📋 Thẻ Kho
            </button>
            {user?.role === 'staff' && (
              <button
                onClick={() => setRequestModal({
                  product: products[0] || null,
                  type: 'import',
                  variantId: '',
                  qty: '20',
                  priority: 'high',
                  note: 'Kho sắp hết hàng, đề xuất bổ sung gấp.'
                })}
                className="px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-lg shadow-amber-500/30 scale-105 animate-pulse"
              >
                <Bell size={16} className="text-slate-950 animate-bounce" /> 📢 Báo Nhập / Xuất Kho
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Tổng Mặt Hàng</span>
            <Package size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{stats.totalProducts}</p>
          <span className="text-[10px] text-gray-500 mt-1">Sản phẩm trong hệ thống</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Tổng Số Lượng Tồn</span>
            <Layers size={18} className="text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.totalStock.toLocaleString()}</p>
          <span className="text-[10px] text-gray-500 mt-1">Thiết bị sẵn sàng bán</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Tổng Giá Trị Kho</span>
            <DollarSign size={18} className="text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate">{formatPrice(stats.totalValue)}</p>
          <span className="text-[10px] text-gray-500 mt-1">Tính theo giá bán niêm yết</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Sắp Hết & Hết Hàng</span>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">{stats.lowStock + stats.outOfStock}</span>
            <span className="text-xs font-bold text-gray-400">({stats.outOfStock} hết)</span>
          </div>
          <span className="text-[10px] text-rose-500 font-bold mt-1">⚠️ Cần bổ sung ngay</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Nhập/Xuất Tháng Này</span>
            <RefreshCw size={18} className="text-purple-500" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-emerald-600 flex items-center"><ArrowDownLeft size={14} /> +{stats.monthImportQty}</span>
            <span className="text-sm font-black text-rose-600 flex items-center"><ArrowUpRight size={14} /> -{stats.monthExportQty}</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1">Biến động trong tháng</span>
        </div>
      </div>

      {/* TAB 1: 📦 TỒN KHO (STOCK BALANCE) */}
      {activeTab === 'stock' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden space-y-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                📦 Danh Sách Tồn Kho Sản Phẩm
              </h3>
              <p className="text-xs text-gray-500">Tra cứu nhanh số lượng tồn kho theo từng dòng smartphone & phụ kiện</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm tên sản phẩm..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary w-full sm:w-64"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary"
              >
                <option value="all">Tất cả trạng thái kho</option>
                <option value="low">⚠️ Sắp hết hàng (≤ 10)</option>
                <option value="out">❌ Hết hàng (0)</option>
              </select>
            </div>
          </div>

          {/* Stock Table */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-bold text-gray-500">Đang tải dữ liệu tồn kho...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-2">
              <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-bold">Không tìm thấy sản phẩm phù hợp</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-black uppercase tracking-wider text-gray-400">
                    <th className="pb-3 pl-4">Sản Phẩm</th>
                    <th className="pb-3">Danh Mục / Thương Hiệu</th>
                    <th className="pb-3 text-center">Tồn Kho</th>
                    <th className="pb-3 text-right">Giá Bán</th>
                    <th className="pb-3 text-right">Tổng Giá Trị</th>
                    <th className="pb-3 text-center">Trạng Thái</th>
                    <th className="pb-3 text-right pr-4">{user?.role === 'staff' ? 'Đề Xuất' : 'Thao Tác'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {products.map((p) => {
                    const isLow = p.stock > 0 && p.stock <= 10;
                    const isOut = p.stock === 0;
                    const hasVariants = (p.variants?.length > 0) || (p.colors?.length > 0);

                    return (
                      <tr key={p._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <img src={p.images?.[0] || '/placeholder.png'} alt="" className="w-11 h-11 rounded-2xl object-cover bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700" />
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-sm hover:text-primary transition-colors">{p.name}</p>
                              {hasVariants && (
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                                  {p.variants?.length || p.colors?.length} biến thể
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="font-bold">{p.category?.name || 'Khác'}</span>
                          {p.brand?.name && <span className="text-gray-400 block text-[11px]">{p.brand.name}</span>}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-3 py-1 rounded-full font-black text-sm ${
                            isOut ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                            isLow ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                            'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                          }`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-4 text-right font-bold text-gray-900 dark:text-white">
                          {formatPrice(p.salePrice || p.price)}
                        </td>
                        <td className="py-4 text-right font-black text-indigo-600 dark:text-indigo-400">
                          {formatPrice((p.salePrice || p.price) * (p.stock || 0))}
                        </td>
                        <td className="py-4 text-center">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-red-600 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-full">
                              ❌ Hết hàng
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full">
                              ⚠️ Sắp hết
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                              ✅ Sẵn sàng
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right pr-4">
                          {(user?.role === 'admin' || user?.role === 'manager') ? (
                            <button
                              onClick={() => setEditStock({
                                product: p,
                                newStock: p.stock,
                                note: '',
                                isVariant: hasVariants,
                                variantsState: p.variants?.length > 0 ? p.variants : p.colors || []
                              })}
                              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-primary text-blue-600 dark:text-blue-300 hover:text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1"
                            >
                              <Edit size={14} /> Điều chỉnh
                            </button>
                          ) : (
                            <button
                              onClick={() => setRequestModal({
                                product: p,
                                type: isOut || isLow ? 'import' : 'export',
                                variantId: (p.variants?.[0]?._id || p.colors?.[0]?._id || ''),
                                qty: isOut ? '50' : isLow ? '30' : '15',
                                priority: isOut ? 'high' : isLow ? 'medium' : 'low',
                                note: isOut ? `Sản phẩm "${p.name}" đã hết sạch hàng trong kho, đề nghị nhập thêm gấp!` : isLow ? `Sản phẩm "${p.name}" sắp hết hàng (chỉ còn ${p.stock}), cần bổ sung.` : `Sản phẩm "${p.name}" đang tồn dư nhiều (${p.stock}), đề xuất kiểm tra xuất bán hoặc điều chuyển.`
                              })}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all inline-flex items-center gap-1.5 shadow-sm hover:scale-105 ${
                                isOut
                                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-500/30'
                                  : isLow
                                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <Bell size={13} className={isOut || isLow ? 'animate-bounce' : ''} /> {isOut || isLow ? 'Báo Nhập Gấp' : 'Báo Xuất/Dư'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2 & 3: 📥 NHẬP KHO / 📤 XUẤT KHO (STOCK IN / OUT FORMS) */}
      {(user?.role === 'admin' || user?.role === 'manager') && (activeTab === 'import' || activeTab === 'export') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Transaction Form */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                  activeTab === 'import' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                }`}>
                  {activeTab === 'import' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    {activeTab === 'import' ? '📥 Tạo Phiếu Nhập Kho Hàng' : '📤 Tạo Phiếu Xuất Kho / Phân Phối'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {activeTab === 'import'
                      ? 'Cộng trực tiếp số lượng vào kho hàng, ghi nhận nguồn gốc nhà cung cấp và giá nhập.'
                      : 'Trừ trực tiếp số lượng trong kho theo lý do xuất bán, chuyển kho hoặc hủy hàng lỗi.'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-6">
              {/* Step 1: Select Product */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                  1. Chọn Sản Phẩm Cần {activeTab === 'import' ? 'Nhập' : 'Xuất'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  <option value="">-- Chọn smartphone / phụ kiện --</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Tồn hiện tại: {p.stock}) - Giá bán: {formatPrice(p.salePrice || p.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Variant (if any) */}
              {selectedProductObj && ((selectedProductObj.variants?.length > 0) || (selectedProductObj.colors?.length > 0)) && (
                <div className="space-y-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 animate-fade-in">
                  <label className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 block">
                    2. Chọn Biến thể / Màu sắc <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    required
                    className="w-full p-3 bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  >
                    {selectedProductObj.variants?.length > 0 ? (
                      selectedProductObj.variants.map(v => (
                        <option key={v._id || v.id} value={v._id || v.id}>
                          🎨 Màu: {v.color || 'Mặc định'} | 💾 ROM: {v.storage || 'N/A'} | RAM: {v.ram || 'N/A'} -- (Tồn: {v.stock} | Giá: {formatPrice(v.price || selectedProductObj.price)})
                        </option>
                      ))
                    ) : (
                      selectedProductObj.colors.map(c => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          🎨 Màu sắc: {c.name} -- (Tồn: {c.stock})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {/* Step 3: Quantity & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                    {activeTab === 'import' ? 'Số Lượng Nhập (+)' : 'Số Lượng Xuất (-)'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max={activeTab === 'export' ? getCurrentSelectedStock() : undefined}
                      value={qtyInput}
                      onChange={(e) => setQtyInput(e.target.value)}
                      placeholder="e.g. 20"
                      required
                      className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-black text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-gray-400">
                      Sản phẩm
                    </span>
                  </div>
                  {selectedProductObj && (
                    <p className="text-[11px] font-bold text-gray-500">
                      📦 Tồn kho khả dụng hiện tại: <strong className="text-indigo-600 dark:text-indigo-400">{getCurrentSelectedStock()}</strong>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                    {activeTab === 'import' ? 'Đơn Giá Nhập Hàng (VNĐ)' : 'Đơn Giá Xuất / Bán (VNĐ)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={unitPriceInput}
                    onChange={(e) => setUnitPriceInput(e.target.value)}
                    placeholder="e.g. 25000000"
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                  {qtyInput > 0 && unitPriceInput > 0 && (
                    <p className="text-[11px] font-bold text-emerald-600">
                      💰 Tổng giá trị phiếu: <strong>{formatPrice(Number(qtyInput) * Number(unitPriceInput))}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Step 4: Supplier (for Import) or Reason (for Export) */}
              {activeTab === 'import' ? (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                    Nhà Cung Cấp / Nguồn Nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={supplierInput}
                    onChange={(e) => setSupplierInput(e.target.value)}
                    placeholder="e.g. Apple Vietnam, Synnex FPT..."
                    required
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {suppliersList.map(sup => (
                      <button
                        key={sup}
                        type="button"
                        onClick={() => setSupplierInput(sup)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          supplierInput === sup ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {sup}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                    Lý Do Xuất Kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder="e.g. Xuất chuyển chi nhánh HCM..."
                    required
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {exportReasonsList.map(rs => (
                      <button
                        key={rs}
                        type="button"
                        onClick={() => setReasonInput(rs)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          reasonInput === rs ? 'bg-rose-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {rs}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Note */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                  Ghi Chú / Mã Hóa Đơn (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Nhập số hóa đơn, tên người giao hàng hoặc thông tin thêm..."
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingTx}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-75 ${
                  activeTab === 'import'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700'
                    : 'bg-gradient-to-r from-rose-600 to-red-600 shadow-rose-500/25 hover:from-rose-700 hover:to-red-700'
                }`}
              >
                {submittingTx ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang lưu phiếu & cập nhật kho...
                  </>
                ) : activeTab === 'import' ? (
                  <>
                    <ArrowDownLeft className="w-5 h-5" /> Xác Nhận Nhập Kho (+{qtyInput || 0} sản phẩm)
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-5 h-5" /> Xác Nhận Xuất Kho (-{qtyInput || 0} sản phẩm)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar Guide & Summary Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl border border-slate-800">
              <h4 className="font-black text-base flex items-center gap-2 text-amber-400">
                <HelpCircle size={18} /> Quy Trình Kho Hàng Chuẩn
              </h4>
              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span><strong>Chọn chính xác thiết bị & màu sắc:</strong> Hệ thống tự động kiểm tra số dư tồn kho khả dụng hiện tại.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span><strong>Ghi nhận nhà cung cấp:</strong> Giúp đối soát công nợ và bảo hành chính hãng từ Apple, Samsung, Xiaomi...</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span><strong>Lưu thẻ kho tức thì:</strong> Mọi giao dịch được ghi nhận vào cơ sở dữ liệu MongoDB và không thể chỉnh sửa để đảm bảo tính minh bạch.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Người Thực Hiện</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-base">
                  {user?.name?.[0] || 'A'}
                </div>
                <div>
                  <p className="font-extrabold text-sm text-gray-900 dark:text-white">{user?.name || 'Admin VIP'}</p>
                  <span className="text-xs text-gray-500 font-semibold">{roleLabel[user?.role] || 'Quản trị viên'}</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                🕒 Thời gian ghi phiếu: <strong>{new Date().toLocaleString('vi-VN')}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 📋 THẺ KHO / LỊCH SỬ (STOCK LEDGER / HISTORY) */}
      {activeTab === 'ledger' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden space-y-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                📋 Thẻ Kho & Lịch Sử Giao Dịch
              </h3>
              <p className="text-xs text-gray-500">Toàn bộ nhật ký Nhập kho (+), Xuất kho (-) và Điều chỉnh được lưu trữ vĩnh viễn trên MongoDB</p>
            </div>

            {/* Ledger Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm tên máy, NCC, lý do..."
                  value={ledgerSearch}
                  onChange={(e) => { setLedgerSearch(e.target.value); setLedgerPage(1); }}
                  className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary w-full sm:w-64"
                />
              </div>

              <select
                value={ledgerType}
                onChange={(e) => { setLedgerType(e.target.value); setLedgerPage(1); }}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary"
              >
                <option value="all">Tất cả loại giao dịch</option>
                <option value="import">📥 Nhập kho (+)</option>
                <option value="export">📤 Xuất kho (-)</option>
                <option value="adjust">⚙️ Điều chỉnh kho</option>
              </select>

              <button
                onClick={fetchLogs}
                className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl text-gray-600 dark:text-gray-300 transition-all"
                title="Làm mới"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          {loadingLogs ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-bold text-gray-500">Đang tải thẻ kho / lịch sử...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-2">
              <History className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-bold">Chưa có giao dịch kho nào được ghi nhận</p>
              <p className="text-xs text-gray-400">Hãy chuyển sang tab Nhập Kho hoặc Xuất Kho để tạo phiếu mới</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-black uppercase tracking-wider text-gray-400">
                    <th className="pb-3 pl-4">Thời Gian & Người Tạo</th>
                    <th className="pb-3">Loại Phiếu</th>
                    <th className="pb-3">Sản Phẩm / Cấu Hình</th>
                    <th className="pb-3 text-center">Biến Động (+) / (-)</th>
                    <th className="pb-3 text-center">Tồn Trước ➔ Sau</th>
                    <th className="pb-3 text-right">Đơn Giá / Thành Tiền</th>
                    <th className="pb-3 text-left pr-4">Lý Do / NCC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {logs.map((log) => {
                    const isImp = log.type === 'import';
                    const isExp = log.type === 'export';

                    return (
                      <tr key={log._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-4 pl-4">
                          <p className="font-bold text-gray-900 dark:text-white text-xs">
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </p>
                          <span className="text-[11px] text-gray-400 block font-medium">{log.userName}</span>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[11px] ${
                            isImp ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                            isExp ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}>
                            {isImp ? <ArrowDownLeft size={12} /> : isExp ? <ArrowUpRight size={12} /> : <Edit size={12} />}
                            {isImp ? 'Nhập kho' : isExp ? 'Xuất kho' : 'Điều chỉnh'}
                          </span>
                        </td>
                        <td className="py-4 max-w-xs">
                          <p className="font-extrabold text-gray-900 dark:text-white text-sm truncate">{log.productName}</p>
                          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold block">{log.variantInfo}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`font-black font-mono text-sm px-2.5 py-1 rounded-xl ${
                            log.quantity > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50' :
                            log.quantity < 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                          </span>
                        </td>
                        <td className="py-4 text-center font-bold text-gray-600 dark:text-gray-400">
                          {log.beforeStock} ➔ <strong className="text-gray-900 dark:text-white">{log.afterStock}</strong>
                        </td>
                        <td className="py-4 text-right">
                          <p className="font-extrabold text-gray-900 dark:text-white">
                            {log.totalValue > 0 ? formatPrice(log.totalValue) : '--'}
                          </p>
                          {log.unitPrice > 0 && (
                            <span className="text-[10px] text-gray-400 block">Đơn giá: {formatPrice(log.unitPrice)}</span>
                          )}
                        </td>
                        <td className="py-4 pr-4 max-w-xs">
                          <p className="font-bold text-gray-900 dark:text-white">{log.reason}</p>
                          {log.supplier && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
                              🏢 NCC: {log.supplier}
                            </span>
                          )}
                          {log.note && <span className="text-[11px] text-gray-400 italic block truncate">"{log.note}"</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Ledger Pagination */}
          {ledgerPagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-500">
                Hiển thị trang {ledgerPagination.page} / {ledgerPagination.pages} (Tổng {ledgerPagination.total} phiếu)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={ledgerPage === 1}
                  onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-xs disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  disabled={ledgerPage >= ledgerPagination.pages}
                  onClick={() => setLedgerPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-xs disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUICK ADJUST STOCK MODAL */}
      {(user?.role === 'admin' || user?.role === 'manager') && editStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
                  <Edit size={22} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">Điều Chỉnh Tồn Kho Nhanh</h3>
                  <p className="text-xs text-gray-500">{editStock.product.name}</p>
                </div>
              </div>
              <button onClick={() => setEditStock(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {editStock.isVariant ? (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Sản phẩm này có nhiều biến thể (Màu/ROM). Vui lòng điều chỉnh trực tiếp tại từng biến thể bên dưới:
                  </p>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {editStock.variantsState.map((v) => (
                    <div key={v._id || v.id} className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold text-gray-900 dark:text-white">
                          🎨 {v.color || v.name} {v.storage ? `| 💾 ${v.storage}` : ''} {v.ram ? `(${v.ram})` : ''}
                        </p>
                        <span className="text-[10px] text-gray-400 font-bold">Tồn hiện tại: {v.stock}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          defaultValue={v.stock}
                          id={`stock-var-${v._id || v.id}`}
                          className="w-20 p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-center font-black text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = document.getElementById(`stock-var-${v._id || v.id}`).value;
                            handleUpdateVariantStock(v._id || v.id, val);
                          }}
                          className="px-3 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateStock} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                    Số lượng tồn kho mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStock.newStock}
                    onChange={(e) => setEditStock({ ...editStock, newStock: e.target.value })}
                    required
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-black text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                  <p className="text-[11px] font-bold text-gray-500">
                    Tồn kho trước điều chỉnh: <strong>{editStock.product.stock}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                    Lý do điều chỉnh (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={editStock.note}
                    onChange={(e) => setEditStock({ ...editStock, note: e.target.value })}
                    placeholder="e.g. Kiểm kê định kỳ, điều chỉnh hao hụt..."
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setEditStock(null)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Xác nhận lưu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* STAFF STOCK REQUEST MODAL (Gửi yêu cầu nhập / xuất kho) */}
      {requestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/15 rounded-2xl flex items-center justify-center text-amber-500 font-black">
                  <Bell size={24} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">📢 Gửi Đề Xuất Nhập / Xuất Kho</h3>
                  <p className="text-xs text-gray-500">Thông báo trực tiếp đến Quản lý & Quản trị viên</p>
                </div>
              </div>
              <button
                onClick={() => setRequestModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendStockRequest} className="space-y-5">
              {/* Loại yêu cầu */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                  1. Loại Yêu Cầu Đề Xuất <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestModal({ ...requestModal, type: 'import' })}
                    className={`p-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border transition-all ${
                      requestModal.type === 'import'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <ArrowDownLeft size={18} /> 📥 Yêu Cầu Nhập Kho (Máy Hết/Sắp Hết)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestModal({ ...requestModal, type: 'export' })}
                    className={`p-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border transition-all ${
                      requestModal.type === 'export'
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-600 dark:text-rose-400 shadow-md'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <ArrowUpRight size={18} /> 📤 Yêu Cầu Xuất Kho (Máy Dư/Tồn Lâu)
                  </button>
                </div>
              </div>

              {/* Chọn sản phẩm */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                  2. Sản Phẩm Cần {requestModal.type === 'import' ? 'Nhập' : 'Xuất'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={requestModal.product?._id || ''}
                  onChange={(e) => {
                    const selected = products.find(p => p._id === e.target.value);
                    setRequestModal({
                      ...requestModal,
                      product: selected || null,
                      variantId: selected?.variants?.[0]?._id || selected?.colors?.[0]?._id || ''
                    });
                  }}
                  required
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Tồn hiện tại: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chọn biến thể nếu có */}
              {requestModal.product && ((requestModal.product.variants?.length > 0) || (requestModal.product.colors?.length > 0)) && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Chọn Phân Loại / Màu Sắc / Phiên Bản
                  </label>
                  <select
                    value={requestModal.variantId}
                    onChange={(e) => setRequestModal({ ...requestModal, variantId: e.target.value })}
                    className="w-full p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl text-sm font-bold text-indigo-900 dark:text-indigo-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Tất cả phân loại --</option>
                    {(requestModal.product.variants?.length > 0 ? requestModal.product.variants : requestModal.product.colors || []).map(v => (
                      <option key={v._id} value={v._id}>
                        {v.color || v.name || 'Mặc định'} {v.ram ? `- RAM ${v.ram}` : ''} {v.storage ? `- ROM ${v.storage}` : ''} (Tồn: {v.stock || 0})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Số lượng đề xuất & Mức ưu tiên */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                    3. Số Lượng Đề Xuất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={requestModal.qty}
                    onChange={(e) => setRequestModal({ ...requestModal, qty: e.target.value })}
                    placeholder="Ví dụ: 50"
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-black text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                    4. Mức Độ Khẩn Cấp <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={requestModal.priority}
                    onChange={(e) => setRequestModal({ ...requestModal, priority: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  >
                    <option value="high">🔴 Khẩn cấp (Cần ngay lập tức)</option>
                    <option value="medium">🟡 Trung bình (Trong tuần này)</option>
                    <option value="low">🟢 Bình thường (Định kỳ)</option>
                  </select>
                </div>
              </div>

              {/* Ghi chú / Lý do */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                  5. Lý Do / Ghi Chú Chi Tiết
                </label>
                <textarea
                  rows="3"
                  value={requestModal.note}
                  onChange={(e) => setRequestModal({ ...requestModal, note: e.target.value })}
                  placeholder="Ví dụ: Khách đang hỏi mua màu Titan Tự nhiên rất nhiều, kho hiện tại đã hết sạch, đề nghị Admin nhập hàng gấp..."
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setRequestModal(null)}
                  className="px-5 py-3 rounded-2xl font-extrabold text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest || !requestModal.product}
                  className="px-6 py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2 disabled:opacity-50 hover:scale-105"
                >
                  {submittingRequest ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  <span>🚀 Gửi Yêu Cầu Đến Quản Lý & Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
