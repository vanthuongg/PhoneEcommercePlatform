import { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import { Search, AlertTriangle, Package, Edit, X, Loader2, History, ArrowDownLeft, ArrowUpRight, Plus, Sparkles, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const initialHistory = [
  { id: 1, type: 'import', product: 'iPhone 15 Pro Max 256GB - Titan Tự Nhiên', qty: 50, note: 'Nhập lô hàng mới từ Apple VN', date: '2026-06-25 14:30', user: 'Admin VIP' },
  { id: 2, type: 'export', product: 'Samsung Galaxy S24 Ultra - Đọc Băng', qty: -2, note: 'Xuất kho giao đơn đặt hàng #ORD892', date: '2026-06-26 09:15', user: 'Hệ thống tự động' },
  { id: 3, type: 'import', product: 'Xiaomi 14 Ultra 512GB - Đen', qty: 20, note: 'Bổ sung kho chi nhánh HCM', date: '2026-06-26 16:45', user: 'Manager' },
  { id: 4, type: 'export', product: 'OPPO Find X7 Ultra - Nâu', qty: -1, note: 'Xuất kho giao đơn đặt hàng #ORD905', date: '2026-06-27 08:20', user: 'Hệ thống tự động' },
];

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'history'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all | low | out
  const [editStock, setEditStock] = useState(null); // { product, isVariant, variantsState }
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);

  // Simulated history list stored in state
  const [historyList, setHistoryList] = useState(() => {
    const saved = localStorage.getItem('inventory_history');
    return saved ? JSON.parse(saved) : initialHistory;
  });

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data || []));
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, search, category: categoryFilter };
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

  useEffect(() => { fetchProducts(); }, [page, search, categoryFilter, stockFilter]);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (editStock.isVariant) {
      toast.error('Vui lòng lưu từng biến thể ở bảng dưới');
      return;
    }
    if (editStock.newStock < 0) { toast.error('Tồn kho không thể âm'); return; }
    setSaving(true);
    try {
      const diff = Number(editStock.newStock) - editStock.product.stock;
      const res = await productAPI.updateStock(editStock.product._id, Number(editStock.newStock));
      setProducts(products.map(p => p._id === editStock.product._id ? res.data : p));

      if (diff !== 0) {
        const newLog = {
          id: Date.now(),
          type: diff > 0 ? 'import' : 'export',
          product: `${editStock.product.name} (Tất cả)`,
          qty: diff,
          note: editStock.note || (diff > 0 ? 'Nhập bổ sung' : 'Điều chỉnh giảm'),
          date: new Date().toLocaleString('vi-VN').slice(0, 16),
          user: 'Quản trị viên',
        };
        const updatedHistory = [newLog, ...historyList];
        setHistoryList(updatedHistory);
        localStorage.setItem('inventory_history', JSON.stringify(updatedHistory));
      }

      setEditStock(null);
      toast.success('Cập nhật tồn kho thành công!');
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVariantStock = async (variantId, newStock) => {
    if (newStock < 0) { toast.error('Tồn kho không thể âm'); return; }
    try {
      const res = await productAPI.updateStock(editStock.product._id, Number(newStock), variantId);
      setProducts(products.map(p => p._id === editStock.product._id ? res.data : p));
      toast.success('Cập nhật biến thể thành công!');
      
      // Update local state to reflect change in modal without closing
      const updatedProduct = res.data;
      setEditStock({ ...editStock, product: updatedProduct, variantsState: updatedProduct.variants });
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    }
  };

  const totalProducts = pagination.total || products.length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Package className="text-amber-400 animate-bounce" size={24} />
            <h1 className="text-2xl sm:text-3xl font-black">Quản Lý Tồn Kho & Phân Phối</h1>
          </div>
          <p className="text-gray-300 text-xs sm:text-sm mt-1">Theo dõi chi tiết số lượng smartphone theo bộ nhớ/màu sắc, cảnh báo hết hàng và lịch sử xuất nhập</p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md self-start sm:self-auto border border-white/15">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'stock' ? 'bg-primary text-white shadow-lg' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Package size={16} /> Kho Sản Phẩm
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'history' ? 'bg-primary text-white shadow-lg' : 'text-gray-300 hover:text-white'
            }`}
          >
            <History size={16} /> Lịch Sử Xuất/Nhập ({historyList.length})
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
            <Package size={26} />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{totalProducts}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Mã Sản Phẩm Đang Bán</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0 animate-pulse">
            <AlertTriangle size={26} />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{lowStock}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Sắp Hết Hàng (≤ 10 máy)</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={26} />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">{outOfStock}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Cháy Hàng (Tồn = 0)</p>
          </div>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative w-full sm:w-80">
              <input
                placeholder="Tìm điện thoại theo tên, mã..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>

              <div className="flex rounded-2xl bg-gray-50 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
                {[{ v: 'all', l: 'Tất cả' }, { v: 'low', l: '⚠️ Sắp hết' }, { v: 'out', l: '❌ Hết hàng' }].map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => { setStockFilter(v); setPage(1); }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${stockFilter === v ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-black uppercase text-gray-400">
                  <th className="pb-3">Sản Phẩm & Biến Thể</th>
                  <th className="pb-3">Thương Hiệu</th>
                  <th className="pb-3">Giá Niêm Yết</th>
                  <th className="pb-3">Tồn Kho (Tổng)</th>
                  <th className="pb-3">Phân Bổ Biến Thể</th>
                  <th className="pb-3">Trạng Thái</th>
                  <th className="pb-3 text-right">Điều Chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}><td colSpan={7} className="py-6"><div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" /></td></tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 font-bold">Không tìm thấy mẫu điện thoại nào phù hợp bộ lọc</td>
                  </tr>
                ) : products.map((p) => (
                  <tr key={p._id} className={`hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors ${p.stock === 0 ? 'bg-red-50/20 dark:bg-red-950/10' : p.stock <= 10 ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''}`}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80'} alt="" className="w-12 h-12 rounded-2xl object-cover bg-gray-50 border shrink-0" />
                        <div>
                          <p className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                          <div className="flex gap-1 mt-1">
                            {p.colors?.slice(0, 3).map((col, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-400 font-bold">{col}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-gray-700 dark:text-gray-300">{p.brand?.name || p.brand || 'Smartphone'}</td>
                    <td className="py-4 font-black text-primary">{formatPrice(p.salePrice > 0 ? p.salePrice : p.price)}</td>
                    <td className="py-4">
                      <span className={`text-base font-black ${p.stock === 0 ? 'text-red-600' : p.stock <= 10 ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`}>
                        {p.stock} máy
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="text-[11px] text-gray-500 space-y-0.5">
                        <div>Dung lượng: <strong className="text-gray-800 dark:text-gray-200">{p.storage?.join(', ') || '256GB, 512GB'}</strong></div>
                        <div>Đã bán: <strong className="text-primary">{p.sold || 0}</strong> máy</div>
                      </div>
                    </td>
                    <td className="py-4">
                      {p.stock === 0 ? (
                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-black text-[10px] uppercase">Cháy hàng</span>
                      ) : p.stock <= 10 ? (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] uppercase">⚠️ Sắp hết</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase">✓ Sẵn kho</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setEditStock({ 
                          product: p, 
                          newStock: p.stock, 
                          note: '', 
                          isVariant: p.variants && p.variants.length > 0,
                          variantsState: p.variants || []
                        })}
                        className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white rounded-2xl transition-all shadow-sm active:scale-95 text-gray-700 dark:text-gray-300 inline-flex items-center gap-1.5 font-bold"
                      >
                        <Edit size={15} /> Sửa Tồn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-500">Trang {page} / {pagination.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700">Trang Trước</button>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700">Trang Sau</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">📜 Nhật Ký Lịch Sử Xuất & Nhập Kho</h2>
              <p className="text-xs text-gray-500">Ghi nhận mọi biến động số lượng máy trong hệ thống</p>
            </div>
            <button
              onClick={() => { setHistoryList(initialHistory); localStorage.removeItem('inventory_history'); toast.success('Đã khôi phục dữ liệu mẫu'); }}
              className="text-xs font-bold text-primary hover:underline"
            >
              Khôi phục mẫu mặc định
            </button>
          </div>

          <div className="space-y-4">
            {historyList.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black ${
                    log.type === 'import' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {log.type === 'import' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${log.type === 'import' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                        {log.type === 'import' ? '+ Nhập kho' : '- Xuất kho'}
                      </span>
                      <span className="text-xs text-gray-400">{log.date}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{log.product}</p>
                    <p className="text-xs text-gray-500 italic mt-0.5">Ghi chú: {log.note} • <span className="font-semibold text-gray-700 dark:text-gray-300">Thực hiện: {log.user}</span></p>
                  </div>
                </div>
                <div className="text-right self-end sm:self-center">
                  <span className={`text-lg font-black ${log.type === 'import' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {log.qty > 0 ? `+${log.qty}` : log.qty} máy
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit stock modal */}
      {editStock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary to-blue-600 text-white">
              <h2 className="text-lg font-black flex items-center gap-2">
                <Edit size={20} /> Cập Nhật Tồn Kho Máy
              </h2>
              <button onClick={() => setEditStock(null)} className="p-1 rounded-full hover:bg-white/20 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdateStock} className="p-6 space-y-5">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
                <img src={editStock.product.images?.[0] || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80'} alt="" className="w-14 h-14 rounded-2xl object-cover border bg-white" />
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">{editStock.product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tồn kho hiện tại: <strong className="text-primary font-black text-sm">{editStock.product.stock}</strong> máy</p>
                </div>
              </div>

              {editStock.isVariant ? (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="p-2">Màu sắc</th>
                        <th className="p-2">Dung lượng</th>
                        <th className="p-2">Tồn kho</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {editStock.variantsState.map((v, i) => (
                        <tr key={v._id || i}>
                          <td className="p-2 font-bold">{v.color}</td>
                          <td className="p-2 font-bold">{v.storage}</td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              value={v.stock} 
                              onChange={(e) => {
                                const newV = [...editStock.variantsState];
                                newV[i].stock = e.target.value;
                                setEditStock({ ...editStock, variantsState: newV });
                              }}
                              className="w-20 p-1 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:border-gray-700"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <button 
                              type="button" 
                              onClick={() => handleUpdateVariantStock(v._id, v.stock)}
                              className="px-3 py-1 bg-primary text-white rounded font-bold"
                            >
                              Lưu
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[10px] text-amber-500 mt-2">* Tổng tồn kho sẽ được tự động tính từ các biến thể</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Số lượng tồn mới sau kiểm kê <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min={0}
                      value={editStock.newStock}
                      onChange={(e) => setEditStock({ ...editStock, newStock: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Lý do / Ghi chú thay đổi (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="VD: Nhập thêm hàng từ kho tổng, lỗi hỏng hóc..."
                      value={editStock.note}
                      onChange={(e) => setEditStock({ ...editStock, note: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditStock(null)} className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 font-bold text-xs hover:bg-gray-200 text-gray-700 dark:text-gray-300">Hủy bỏ</button>
                {!editStock.isVariant && (
                  <button type="submit" disabled={saving} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Lưu Cập Nhật
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
