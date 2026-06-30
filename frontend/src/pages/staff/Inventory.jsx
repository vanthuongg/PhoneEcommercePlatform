import { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import { Search, AlertTriangle, Package } from 'lucide-react';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Staff can only VIEW inventory, not edit (editing is manager's job)
const StaffInventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data || []));
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ page, limit: 20, search, category: categoryFilter });
      setProducts(res.data || []);
      setPagination(res.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search, categoryFilter]);

  const filteredProducts = products.filter(p => {
    if (stockFilter === 'low') return p.stock > 0 && p.stock <= 10;
    if (stockFilter === 'out') return p.stock === 0;
    return true;
  });

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kiểm tra tồn kho</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Xem tình trạng hàng tồn kho (chỉ đọc)</p>
      </div>

      {/* Alert banners */}
      {outOfStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            <strong>{outOfStockCount} sản phẩm</strong> đã hết hàng. Hãy thông báo Manager để nhập hàng.
          </p>
        </div>
      )}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">
            <strong>{lowStockCount} sản phẩm</strong> sắp hết hàng (tồn kho ≤ 10).
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{pagination.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tổng sản phẩm</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStockFilter('low')}>
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-amber-600">{lowStockCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sắp hết (≤10)</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStockFilter('out')}>
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-red-600">{outOfStockCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hết hàng</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <input placeholder="Tìm sản phẩm..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-9 text-sm" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400">
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
          {[{ v: 'all', l: 'Tất cả' }, { v: 'low', l: 'Sắp hết' }, { v: 'out', l: 'Hết hàng' }].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setStockFilter(v)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${stockFilter === v ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b">
              <tr>
                {['Sản phẩm', 'Danh mục', 'Giá bán', 'Tồn kho', 'Đã bán', 'Trạng thái'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                [...Array(8)].map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>)
              ) : filteredProducts.map((p) => (
                <tr key={p._id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${p.stock === 0 ? 'bg-red-50/40' : p.stock <= 10 ? 'bg-amber-50/40' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || 'https://placehold.co/60x60/e5e7eb/9ca3af?text=?'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-40">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.category?.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary-600">{formatPrice(p.salePrice > 0 ? p.salePrice : p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-600' : p.stock <= 10 ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.sold}</td>
                  <td className="px-4 py-3">
                    {p.stock === 0 ? (
                      <span className="badge badge-danger">Hết hàng</span>
                    ) : p.stock <= 10 ? (
                      <span className="badge badge-warning">Sắp hết</span>
                    ) : (
                      <span className="badge badge-success">Còn hàng</span>
                    )}
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
    </div>
  );
};

export default StaffInventory;
