import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, Search, Edit, Trash2, X, Loader2, Package, Tag, 
  DollarSign, Layers, Image as ImageIcon, Sparkles, CheckCircle2, 
  AlertTriangle, Ban, RefreshCw, Filter, Cpu, Smartphone, 
  Battery, Camera, Shield, Check, Eye, HelpCircle, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const emptyForm = { 
  name: '', description: '', price: '', salePrice: '', category: '', stock: '', brand: '', tags: '', isActive: true, isFeatured: false,
  colorsList: '', storageList: '', cpu: '', ram: '', camera: '', battery: '', screen: '' 
};

const Products = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const roleTitle = isAdmin ? 'Quản Trị Catalog Sản Phẩm' : 'Quản Lý Sản Phẩm & Kho';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'

  // Modal states
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'specs' | 'variants' | 'images'
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [variantMatrix, setVariantMatrix] = useState([]);

  useEffect(() => {
    categoryAPI.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ 
        page, 
        limit: 12, 
        search: searchQuery.trim() || undefined, 
        category: categoryFilter || undefined, 
        showAll: true 
      });
      setProducts(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      toast.error(err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, categoryFilter]);

  useEffect(() => { 
    fetchProducts(); 
  }, [fetchProducts]);

  const openCreate = () => { 
    setForm(emptyForm); 
    setImages([]); 
    setVariantMatrix([]);
    setActiveTab('general');
    setModal('create'); 
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price || '',
      salePrice: p.salePrice || 0,
      category: p.category?._id || p.category || '',
      stock: p.stock !== undefined ? p.stock : '',
      brand: p.brand || '',
      tags: (p.tags || []).join(', '),
      isActive: p.isActive !== false,
      isFeatured: !!p.isFeatured,
      colorsList: p.colors?.map(c => typeof c === 'object' ? c.name : c).filter(Boolean).join(', ') || '',
      storageList: Array.from(new Set(p.variants?.map(v => v.storage || v.name).filter(Boolean))).join(', ') || '',
      cpu: p.specs?.cpu || '',
      ram: p.specs?.ram || '',
      camera: p.specs?.camera || '',
      battery: p.specs?.battery || '',
      screen: p.specs?.screen || '',
      _id: p._id,
      existingImages: p.images || []
    });
    setImages([]);
    setVariantMatrix(p.variants || []);
    setActiveTab('general');
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
          if (existing) {
            newMatrix.push(existing);
          } else {
            newMatrix.push({ color, storage, stock: 10, price: form.price || 0 });
          }
        });
      });
      setVariantMatrix(newMatrix);
      toast.success(`Đã tự động tạo ${newMatrix.length} tổ hợp biến thể SKU!`);
    } else {
      toast.error('Vui lòng nhập ít nhất 1 Màu sắc và 1 Dung lượng ROM');
    }
  };

  const updateMatrixField = (index, field, value) => {
    const newM = [...variantMatrix];
    newM[index][field] = value;
    setVariantMatrix(newM);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category || (form.stock === '' && variantMatrix.length === 0)) {
      toast.error('Vui lòng điền đầy đủ Thông tin chung bắt buộc (*) ');
      setActiveTab('general');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => { 
        if (!['_id', 'existingImages', 'colorsList', 'storageList', 'cpu', 'ram', 'camera', 'battery', 'screen'].includes(k)) {
          fd.append(k, form[k]); 
        }
      });
      
      images.forEach((img) => fd.append('images', img));

      const parsedColors = form.colorsList 
        ? form.colorsList.split(',').map(c => ({ name: c.trim(), stock: form.stock || 10 })).filter(c => c.name) 
        : [];
      fd.append('colors', JSON.stringify(parsedColors));

      if (variantMatrix.length > 0) {
        fd.append('variants', JSON.stringify(variantMatrix));
      } else {
        const parsedVariants = form.storageList 
          ? form.storageList.split(',').map(s => ({ 
              storage: s.trim(), 
              color: parsedColors[0]?.name || 'Mặc định', 
              ram: form.ram, 
              price: form.price, 
              stock: form.stock || 10 
            })).filter(v => v.storage) 
          : [];
        fd.append('variants', JSON.stringify(parsedVariants));
      }

      const parsedSpecs = {
        cpu: form.cpu,
        ram: form.ram,
        camera: form.camera,
        battery: form.battery,
        screen: form.screen,
        storage: form.storageList ? form.storageList.split(',')[0].trim() : ''
      };
      fd.append('specs', JSON.stringify(parsedSpecs));

      if (modal === 'create') {
        const res = await productAPI.create(fd);
        setProducts([res.data, ...products]);
        toast.success('🎉 Đã thêm sản phẩm mới vào catalog!');
      } else {
        const res = await productAPI.update(form._id, fd);
        setProducts(products.map(p => p._id === form._id ? res.data : p));
        toast.success('✨ Đã cập nhật thông tin sản phẩm!');
      }
      setModal(null);
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn sản phẩm "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await productAPI.delete(id);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Đã xóa sản phẩm khỏi hệ thống');
    } catch (err) {
      toast.error(err.message || 'Xóa sản phẩm thất bại');
    }
  };

  // Filtered locally by stockFilter
  const displayedProducts = useMemo(() => {
    return products.filter(p => {
      if (stockFilter === 'in_stock') return p.stock > 5;
      if (stockFilter === 'low_stock') return p.stock > 0 && p.stock <= 5;
      if (stockFilter === 'out_of_stock') return p.stock <= 0;
      return true;
    });
  }, [products, stockFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = pagination.total || products.length;
    const inStock = products.filter(p => p.stock > 5).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter(p => p.stock <= 0).length;
    return { total, inStock, lowStock, outOfStock };
  }, [products, pagination.total]);

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
            Quản lý catalog, thông số kỹ thuật, biến thể SKU và tình trạng tồn kho • Tổng: <strong className="text-primary-600 font-bold">{stats.total}</strong> sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-600' : ''}`} />
          </button>
          
          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs shadow-lg shadow-primary-500/30 active:scale-95 transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.inStock}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sẵn hàng (&gt; 5)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.lowStock}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sắp hết hàng (1-5)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.outOfStock}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hết hàng (0)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng catalog</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Stock status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'in_stock', label: 'Sẵn hàng', color: 'text-emerald-500' },
              { key: 'low_stock', label: 'Sắp hết', color: 'text-amber-500' },
              { key: 'out_of_stock', label: 'Hết hàng', color: 'text-rose-500' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStockFilter(tab.key)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  stockFilter === tab.key
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search & Category Select */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-48 px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            >
              <option value="">📁 Tất cả danh mục</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên sản phẩm, thương hiệu..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
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
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sản phẩm & Thương hiệu</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Định giá bán</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kho hàng</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đã bán</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-5">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Package className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy sản phẩm nào</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác</p>
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= 5;
                  const isOut = p.stock <= 0;
                  
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80'}
                            alt={p.name}
                            className="w-12 h-12 rounded-2xl object-cover bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-xs">{p.name}</p>
                              {p.isFeatured && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black shrink-0">
                                  ★ Nổi bật
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                              {p.brand || 'No Brand'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                          <Tag className="w-3 h-3 text-primary-500" />
                          <span>{p.category?.name || 'Chưa phân loại'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-xs font-black text-primary-600 dark:text-primary-400">
                            {formatPrice(p.salePrice > 0 ? p.salePrice : p.price)}
                          </p>
                          {p.salePrice > 0 && (
                            <p className="text-[10px] text-slate-400 line-through">
                              {formatPrice(p.price)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${
                          isOut
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : isLow
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <span>{p.stock} {isOut ? '(Hết)' : isLow ? '(Sắp hết)' : ''}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-xs text-slate-600 dark:text-slate-400">
                        {p.sold || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black ${
                          p.isActive 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {p.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all font-bold text-xs flex items-center gap-1"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sửa</span>
                          </button>

                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
          ADD / EDIT PRODUCT MODAL
      ════════════════════════════════ */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8 animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-primary-500/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {modal === 'create' ? '✨ Thêm Sản Phẩm Mới Vào Catalog' : '⚙️ Chỉnh Sửa Sản Phẩm'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Cấu hình chi tiết thông số, định giá, hình ảnh và phân loại SKU
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModal(null)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex border-b border-slate-200/80 dark:border-slate-800 px-6 bg-slate-50/40 dark:bg-slate-900/40 overflow-x-auto hide-scrollbar">
              {[
                { key: 'general', label: '1. Thông tin chung & Giá', icon: Tag },
                { key: 'specs', label: '2. Thông số kỹ thuật', icon: Cpu },
                { key: 'variants', label: `3. Mã trận SKU (${variantMatrix.length})`, icon: Layers },
                { key: 'images', label: `4. Thư viện hình ảnh (${images.length || form.existingImages?.length || 0})`, icon: ImageIcon },
              ].map((t) => {
                const TabIcon = t.icon;
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`py-4 px-4 font-black text-xs flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* TAB 1: GENERAL INFO */}
              {activeTab === 'general' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Tên sản phẩm (Bắt buộc *)
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Ví dụ: iPhone 16 Pro Max 256GB Chính hãng VN/A..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Danh mục phân loại *
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="">Chọn danh mục phù hợp</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Thương hiệu
                      </label>
                      <input
                        type="text"
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        placeholder="Apple, Samsung, Xiaomi..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Giá bán gốc (VNĐ) *
                      </label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="32990000"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Giá khuyến mãi (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={form.salePrice}
                        onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                        placeholder="30990000 (Để 0 nếu không giảm)"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Tồn kho tổng *
                      </label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        placeholder="50 (Nếu có Mã trận SKU sẽ tự tính tổng)"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Tags (Phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        placeholder="iphone, apple, 5g, flagship"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Mô tả chi tiết sản phẩm *
                      </label>
                      <textarea
                        rows={5}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Nhập mô tả tính năng nổi bật, thiết kế, hiệu năng..."
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none leading-relaxed"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-6">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Cho phép hiển thị trên cửa hàng (Active)</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isFeatured}
                          onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Đánh dấu Sản phẩm Nổi bật (Featured ★)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TECHNICAL SPECS */}
              {activeTab === 'specs' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl border border-primary-200/60 dark:border-primary-800/40 text-primary-800 dark:text-primary-200 text-xs flex items-center gap-3">
                    <Cpu className="w-6 h-6 shrink-0 text-primary-600" />
                    <span>
                      Thông số kỹ thuật giúp khách hàng dễ dàng so sánh và đưa ra quyết định mua sắm. Điền chính xác cấu hình phần cứng bên dưới.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-primary-500" />
                        <span>Vi xử lý (CPU / Chipset)</span>
                      </label>
                      <input
                        type="text"
                        value={form.cpu}
                        onChange={(e) => setForm({ ...form, cpu: e.target.value })}
                        placeholder="Apple A18 Pro 6 nhân / Snapdragon 8 Gen 3..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary-500" />
                        <span>Bộ nhớ RAM</span>
                      </label>
                      <input
                        type="text"
                        value={form.ram}
                        onChange={(e) => setForm({ ...form, ram: e.target.value })}
                        placeholder="8GB / 12GB LPDDR5X..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-primary-500" />
                        <span>Màn hình (Screen)</span>
                      </label>
                      <input
                        type="text"
                        value={form.screen}
                        onChange={(e) => setForm({ ...form, screen: e.target.value })}
                        placeholder="6.9 inch Super Retina XDR OLED 120Hz..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                        <Camera className="w-4 h-4 text-primary-500" />
                        <span>Hệ thống Camera</span>
                      </label>
                      <input
                        type="text"
                        value={form.camera}
                        onChange={(e) => setForm({ ...form, camera: e.target.value })}
                        placeholder="Chính 48MP + Góc siêu rộng 48MP + Tele 12MP..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                        <Battery className="w-4 h-4 text-primary-500" />
                        <span>Pin & Công nghệ Sạc</span>
                      </label>
                      <input
                        type="text"
                        value={form.battery}
                        onChange={(e) => setForm({ ...form, battery: e.target.value })}
                        placeholder="4685 mAh, Sạc nhanh MagSafe 25W, Type-C PD..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VARIANT SKU MATRIX */}
              {activeTab === 'variants' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-600" />
                      <span>Trình Tạo Bảng Mã Trận SKU Tự Động (Variant Generator)</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Danh sách Màu sắc (cách nhau dấu phẩy):
                        </label>
                        <input
                          type="text"
                          value={form.colorsList}
                          onChange={(e) => setForm({ ...form, colorsList: e.target.value })}
                          placeholder="Titan Sa Mạc, Titan Tự Nhiên, Titan Đen..."
                          className="w-full px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Danh sách Dung lượng ROM (cách nhau dấu phẩy):
                        </label>
                        <input
                          type="text"
                          value={form.storageList}
                          onChange={(e) => setForm({ ...form, storageList: e.target.value })}
                          placeholder="256GB, 512GB, 1TB..."
                          className="w-full px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleGenerateMatrix}
                        className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Layers className="w-4 h-4" />
                        <span>Tự Động Sinh Mã Trận SKU</span>
                      </button>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                        Hệ thống sẽ tự tính tổ hợp (Màu x ROM)
                      </span>
                    </div>
                  </div>

                  {variantMatrix.length > 0 ? (
                    <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/80 dark:border-slate-700 overflow-hidden">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-700 font-black text-xs text-slate-700 dark:text-slate-300 flex justify-between">
                        <span>Bảng Biến Thể Chi Tiết ({variantMatrix.length} SKU)</span>
                        <button
                          type="button"
                          onClick={() => setVariantMatrix([])}
                          className="text-rose-600 dark:text-rose-400 hover:underline text-[11px]"
                        >
                          Xóa toàn bộ ma trận
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700/60 text-slate-500 font-bold uppercase">
                            <tr>
                              <th className="p-3.5">Màu sắc</th>
                              <th className="p-3.5">Dung lượng</th>
                              <th className="p-3.5">Giá bán riêng (VNĐ)</th>
                              <th className="p-3.5">Số lượng kho</th>
                              <th className="p-3.5 text-right">Xóa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                            {variantMatrix.map((v, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                                  <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700">
                                    {v.color}
                                  </span>
                                </td>
                                <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                                  <span className="inline-block px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                    {v.storage}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <input
                                    type="number"
                                    value={v.price}
                                    onChange={(e) => updateMatrixField(idx, 'price', e.target.value)}
                                    className="w-36 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                  />
                                </td>
                                <td className="p-3.5">
                                  <input
                                    type="number"
                                    value={v.stock}
                                    onChange={(e) => updateMatrixField(idx, 'stock', e.target.value)}
                                    className="w-24 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                  />
                                </td>
                                <td className="p-3.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setVariantMatrix(variantMatrix.filter((_, i) => i !== idx))}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                      <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Chưa có mã trận biến thể SKU nào được tạo</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Nhập Màu sắc và Dung lượng ROM ở trên rồi bấm nút tự động sinh</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: IMAGES GALLERY */}
              {activeTab === 'images' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary-600" />
                      <span>Tải Lên Thư Viện Hình Ảnh Sản Phẩm</span>
                    </h3>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImages(Array.from(e.target.files))}
                      className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Có thể tải lên tối đa 5 hình ảnh cùng lúc (định dạng JPG, PNG, WEBP). Hình đầu tiên sẽ là ảnh đại diện (Thumbnail).
                    </p>
                  </div>

                  {/* Preview Selected Uploads */}
                  {images.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Hình ảnh mới chuẩn bị tải lên ({images.length}):
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {images.map((file, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`preview-${idx}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                              Ảnh #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Images when Editing */}
                  {modal === 'edit' && form.existingImages && form.existingImages.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Hình ảnh hiện tại đang có trên hệ thống ({form.existingImages.length}):
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {form.existingImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <img
                              src={imgUrl}
                              alt={`existing-${idx}`}
                              className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-primary-600 text-white text-[10px] font-black shadow">
                                Ảnh chính
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-6 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Hủy bỏ
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs shadow-lg shadow-primary-500/30 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{modal === 'create' ? 'Tạo Sản Phẩm' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
