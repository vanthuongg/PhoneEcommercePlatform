import { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import { Plus, Search, Edit, Trash2, X, Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const emptyForm = { 
  name: '', description: '', price: '', salePrice: '', category: '', stock: '', brand: '', tags: '', isActive: true, isFeatured: false,
  colorsList: '', storageList: '', cpu: '', ram: '', camera: '', battery: '', screen: '' 
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [variantMatrix, setVariantMatrix] = useState([]);

  useEffect(() => {
    categoryAPI.getAll().then((res) => setCategories(res.data || []));
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ page, limit: 8, search, category: categoryFilter, showAll: true });
      setProducts(res.data || []);
      setPagination(res.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search, categoryFilter]);

  const openCreate = () => { setForm(emptyForm); setImages([]); setModal('create'); };
  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description, price: p.price, salePrice: p.salePrice || 0,
      category: p.category?._id || p.category, stock: p.stock, brand: p.brand || '',
      tags: (p.tags || []).join(', '), isActive: p.isActive, isFeatured: p.isFeatured,
      colorsList: p.colors?.map(c => typeof c === 'object' ? c.name : c).filter(Boolean).join(', ') || '',
      storageList: Array.from(new Set(p.variants?.map(v => v.storage || v.name).filter(Boolean))).join(', ') || '',
      cpu: p.specs?.cpu || '', ram: p.specs?.ram || '', camera: p.specs?.camera || '', battery: p.specs?.battery || '', screen: p.specs?.screen || '',
      _id: p._id,
    });
    setImages([]);
    setVariantMatrix(p.variants || []);
    setModal('edit');
  };

  const handleGenerateMatrix = () => {
    const colors = form.colorsList.split(',').map(c => c.trim()).filter(Boolean);
    const storages = form.storageList.split(',').map(s => s.trim()).filter(Boolean);
    
    if (colors.length > 0 && storages.length > 0) {
      const newMatrix = [];
      colors.forEach(color => {
        storages.forEach(storage => {
          const existing = variantMatrix.find(v => v.color === color && v.storage === storage);
          if (existing) newMatrix.push(existing);
          else newMatrix.push({ color, storage, stock: 10, price: form.price || 0 });
        });
      });
      setVariantMatrix(newMatrix);
    } else {
      toast.error('Vui lòng nhập Màu sắc và Dung lượng ROM trước');
    }
  };

  const updateMatrixField = (index, field, value) => {
    const newM = [...variantMatrix];
    newM[index][field] = value;
    setVariantMatrix(newM);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || (!form.stock && variantMatrix.length === 0)) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => { 
        if (k !== '_id' && !['colorsList', 'storageList', 'cpu', 'ram', 'camera', 'battery', 'screen'].includes(k)) {
          fd.append(k, form[k]); 
        }
      });
      images.forEach((img) => fd.append('images', img));

      const parsedColors = form.colorsList ? form.colorsList.split(',').map(c => ({ name: c.trim(), stock: form.stock || 10 })) : [];
      fd.append('colors', JSON.stringify(parsedColors));

      if (variantMatrix.length > 0) {
        fd.append('variants', JSON.stringify(variantMatrix));
      } else {
        const parsedVariants = form.storageList ? form.storageList.split(',').map(s => ({ storage: s.trim(), color: parsedColors[0]?.name || 'Mặc định', ram: form.ram, price: form.price, stock: form.stock || 10 })) : [];
        fd.append('variants', JSON.stringify(parsedVariants));
      }

      const parsedSpecs = {
        cpu: form.cpu, ram: form.ram, camera: form.camera, battery: form.battery, screen: form.screen,
        storage: form.storageList ? form.storageList.split(',')[0].trim() : ''
      };
      fd.append('specs', JSON.stringify(parsedSpecs));

      if (modal === 'create') {
        const res = await productAPI.create(fd);
        setProducts([res.data, ...products]);
        toast.success('Tạo sản phẩm thành công');
      } else {
        const res = await productAPI.update(form._id, fd);
        setProducts(products.map(p => p._id === form._id ? res.data : p));
        toast.success('Cập nhật sản phẩm thành công');
      }
      setModal(null);
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    try {
      await productAPI.delete(id);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Đã xóa sản phẩm');
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{pagination.total} sản phẩm</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <input placeholder="Tìm kiếm..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-9 text-sm" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400">
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b">
              <tr>
                {['Sản phẩm', 'Danh mục', 'Giá', 'Tồn kho', 'Đã bán', 'Trạng thái', 'Hành động'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>)
              ) : products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || 'https://placehold.co/60x60/e5e7eb/9ca3af?text=?'} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-48">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.category?.name}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-primary-600">{formatPrice(p.salePrice > 0 ? p.salePrice : p.price)}</p>
                    {p.salePrice > 0 && <p className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${p.stock <= 5 ? 'text-red-600' : p.stock <= 20 ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.sold}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.isActive ? 'badge-success' : 'badge-gray'}`}>{p.isActive ? 'Hoạt động' : 'Ẩn'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Trang {page}/{pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Trước</button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{modal === 'create' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tên sản phẩm *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="iPhone 15 Pro..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Danh mục *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Thương hiệu</label>
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-field" placeholder="Apple, Samsung..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Giá gốc (VNĐ) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Giá khuyến mãi (VNĐ)</label>
                  <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tồn kho tổng *</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" placeholder="Để trống nếu tạo ma trận" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (phân cách bằng dấu phẩy)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="iphone, apple, 5G" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mô tả *</label>
                  <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hình ảnh</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} className="input-field" />
                </div>
                
                <div className="sm:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Phân loại & Cấu hình (Tùy chọn)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Màu sắc (cách nhau dấu phẩy)</label>
                      <input value={form.colorsList} onChange={(e) => setForm({ ...form, colorsList: e.target.value })} className="input-field" placeholder="Đen, Trắng, Titan..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dung lượng ROM (cách nhau dấu phẩy)</label>
                      <input value={form.storageList} onChange={(e) => setForm({ ...form, storageList: e.target.value })} className="input-field" placeholder="128GB, 256GB..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">RAM</label>
                      <input value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })} className="input-field" placeholder="8GB" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Màn hình</label>
                      <input value={form.screen} onChange={(e) => setForm({ ...form, screen: e.target.value })} className="input-field" placeholder="6.7 inch OLED" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Vi xử lý (CPU)</label>
                      <input value={form.cpu} onChange={(e) => setForm({ ...form, cpu: e.target.value })} className="input-field" placeholder="Apple A17 Pro" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Camera</label>
                      <input value={form.camera} onChange={(e) => setForm({ ...form, camera: e.target.value })} className="input-field" placeholder="48MP + 12MP" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pin & Sạc</label>
                      <input value={form.battery} onChange={(e) => setForm({ ...form, battery: e.target.value })} className="input-field" placeholder="4422 mAh, 30W" />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-4">
                    <button type="button" onClick={handleGenerateMatrix} className="btn-secondary text-xs">
                      Tạo Bảng Mã Trận Biến Thể (SKU)
                    </button>
                    <span className="text-xs text-gray-500">Bấm để tạo tổ hợp Màu sắc x Dung lượng</span>
                  </div>

                  {variantMatrix.length > 0 && (
                    <div className="mt-4 overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="p-2">Màu sắc</th>
                            <th className="p-2">Dung lượng</th>
                            <th className="p-2">Giá bán (VNĐ)</th>
                            <th className="p-2">Tồn kho</th>
                            <th className="p-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {variantMatrix.map((v, i) => (
                            <tr key={i}>
                              <td className="p-2 font-bold">{v.color}</td>
                              <td className="p-2 font-bold">{v.storage}</td>
                              <td className="p-2"><input type="number" value={v.price} onChange={(e) => updateMatrixField(i, 'price', e.target.value)} className="w-24 p-1 border rounded" /></td>
                              <td className="p-2"><input type="number" value={v.stock} onChange={(e) => updateMatrixField(i, 'stock', e.target.value)} className="w-20 p-1 border rounded" /></td>
                              <td className="p-2 text-right">
                                <button type="button" onClick={() => setVariantMatrix(variantMatrix.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><X size={14} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Hiển thị</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Nổi bật</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 spinner" />}
                  {modal === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
