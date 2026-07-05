import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI, categoryAPI, brandAPI } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight, Star, Filter, Check, Smartphone, Cpu, HardDrive, Sparkles, Zap, ArrowRightLeft } from 'lucide-react';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    ram: searchParams.get('ram') || '',
    storage: searchParams.get('storage') || '',
    color: searchParams.get('color') || '',
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') || '',
    isSale: searchParams.get('isSale') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    const isSaleParam = searchParams.get('isSale') || '';
    if (isSaleParam !== filters.isSale) {
      setFilters(prev => ({ ...prev, isSale: isSaleParam, page: 1 }));
    }
  }, [searchParams]);

  useEffect(() => {
    categoryAPI.getAll({ isActive: true }).then((res) => setCategories(res.data || [])).catch(() => { });
    brandAPI.getAll().then((res) => setBrands(res.data || [])).catch(() => { });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 12, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await productAPI.getAll(params);
      let fetched = res.data || [];

      // Frontend filter for phone specific attributes if backend doesn't support them natively yet
      if (filters.brand) {
        fetched = fetched.filter(p => p.brand?.toLowerCase() === filters.brand.toLowerCase() || p.name?.toLowerCase().includes(filters.brand.toLowerCase()));
      }
      if (filters.ram) {
        fetched = fetched.filter(p => p.specs?.ram?.includes(filters.ram) || p.variants?.some(v => v.ram === filters.ram) || p.description?.includes(filters.ram) || p.name?.includes(filters.ram));
      }
      if (filters.storage) {
        fetched = fetched.filter(p => p.specs?.storage?.includes(filters.storage) || p.variants?.some(v => v.storage === filters.storage) || p.name?.includes(filters.storage));
      }
      if (filters.color) {
        fetched = fetched.filter(p => p.colors?.some(c => c.name?.toLowerCase().includes(filters.color.toLowerCase())) || p.variants?.some(v => v.color?.toLowerCase().includes(filters.color.toLowerCase())) || p.name?.toLowerCase().includes(filters.color.toLowerCase()));
      }
      if (filters.rating) {
        fetched = fetched.filter(p => (p.rating || 5) >= Number(filters.rating));
      }

      setProducts(fetched);
      setPagination(res.pagination || { page: 1, pages: Math.ceil(fetched.length / 12) || 1, total: fetched.length });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, page: 1, [key]: value };
    setFilters(newFilters);
    const params = {};
    Object.keys(newFilters).forEach((k) => { if (newFilters[k]) params[k] = newFilters[k]; });
    setSearchParams(params);
  };

  const updateFiltersMultiple = (updates) => {
    const newFilters = { ...filters, page: 1, ...updates };
    setFilters(newFilters);
    const params = {};
    Object.keys(newFilters).forEach((k) => { if (newFilters[k]) params[k] = newFilters[k]; });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const reset = { search: '', category: '', brand: '', minPrice: '', maxPrice: '', ram: '', storage: '', color: '', rating: '', inStock: '', isSale: '', sort: '-createdAt', page: 1 };
    setFilters(reset);
    setSearchParams({});
  };

  const hasActiveFilters = filters.search || filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.ram || filters.storage || filters.color || filters.rating || filters.inStock || filters.isSale;

  const sortOptions = [
    { value: '-createdAt', label: 'Mới nhất' },
    { value: '-sold', label: 'Bán chạy' },
    { value: 'price', label: 'Giá tăng dần' },
    { value: '-price', label: 'Giá giảm dần' },
    { value: '-rating', label: 'Đánh giá cao nhất' },
  ];

  const pricePresets = [
    { label: 'Dưới 5 Triệu', min: '', max: '5000000' },
    { label: '5 - 10 Triệu', min: '5000000', max: '10000000' },
    { label: '10 - 20 Triệu', min: '10000000', max: '20000000' },
    { label: 'Trên 20 Triệu', min: '20000000', max: '' },
  ];

  const brandOptions = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme'];
  const ramOptions = ['4GB', '6GB', '8GB', '12GB', '16GB'];
  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const colorOptions = ['Đen', 'Trắng', 'Xanh', 'Tím', 'Titan', 'Vàng', 'Bạc'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Khám phá Điện thoại & Phụ kiện' }]} />

        {/* Header & Sort Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {filters.isSale === 'true' || filters.isSale === true ? 'Siêu Phẩm Flash Sale Giá Sốc' : 'Hệ Thống Điện Thoại Chính Hãng'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Hiển thị <strong className="text-primary font-semibold">{products.length}</strong> sản phẩm đang kinh doanh</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${filterOpen || hasActiveFilters
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
            >
              <Filter size={15} /> Bộ lọc {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 shrink-0">Sắp xếp:</span>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer pr-2"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Filter Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase mr-1">Đang lọc:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-primary text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">
                Từ khóa: "{filters.search}" <X size={13} className="cursor-pointer hover:scale-125" onClick={() => updateFilter('search', '')} />
              </span>
            )}
            {(filters.isSale === 'true' || filters.isSale === true) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full border border-red-200 dark:border-red-800">
                🔥 Đang giảm giá Flash Sale <X size={13} className="cursor-pointer hover:scale-125" onClick={() => updateFilter('isSale', '')} />
              </span>
            )}
            {filters.brand && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold rounded-full border border-purple-200 dark:border-purple-800">
                Hãng: {filters.brand} <X size={13} className="cursor-pointer hover:scale-125" onClick={() => updateFilter('brand', '')} />
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800">
                Danh mục: {(categories.find(c => c._id === filters.category)?.name || filters.category).replace(/điện thoại/i, '').trim() || (categories.find(c => c._id === filters.category)?.name || filters.category)} <X size={13} className="cursor-pointer hover:scale-125" onClick={() => updateFilter('category', '')} />
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                Giá: {filters.minPrice ? `${(Number(filters.minPrice) / 1000000).toFixed(0)}tr` : '0'} - {filters.maxPrice ? `${(Number(filters.maxPrice) / 1000000).toFixed(0)}tr` : 'MAX'} <X size={13} className="cursor-pointer hover:scale-125" onClick={() => updateFiltersMultiple({ minPrice: '', maxPrice: '' })} />
              </span>
            )}
            {filters.ram && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 text-xs font-bold rounded-full border border-sky-200 dark:border-sky-800">
                RAM: {filters.ram} <X size={13} className="cursor-pointer hover:scale-125" onClick={() => updateFilter('ram', '')} />
              </span>
            )}
            {filters.storage && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-full border border-indigo-200 dark:border-indigo-800">
                ROM: {filters.storage} <X size={13} className="cursor-pointer hover:scale-125" onClick={() => updateFilter('storage', '')} />
              </span>
            )}
            {filters.color && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 text-xs font-bold rounded-full border border-pink-200 dark:border-pink-800">
                Màu: {filters.color} <X size={13} className="cursor-pointer hover:scale-125" onClick={() => updateFilter('color', '')} />
              </span>
            )}
            {filters.rating && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-bold rounded-full border border-yellow-200 dark:border-yellow-800">
                ⭐ Từ {filters.rating} sao <X size={13} className="cursor-pointer hover:scale-125" onClick={() => updateFilter('rating', '')} />
              </span>
            )}
            <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:underline ml-2">Xóa tất cả</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8 items-start">
          {/* Sidebar Filter Panel */}
          <aside className={`${filterOpen ? 'block' : 'hidden'} lg:block lg:col-span-1 space-y-6 bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm`}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-primary" /> BỘ LỌC
              </h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:underline">
                  Đặt lại
                </button>
              )}
            </div>

            {/* Search Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tìm theo từ khóa</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tên máy, model, mã SKU..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full p-3 pr-9 rounded-2xl bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary text-xs font-medium text-gray-900 dark:text-white"
                />
                <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Categories Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2"><Smartphone size={16} className="text-blue-500"/> DANH MỤC</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`w-full text-center px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    !filters.category ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => updateFilter('category', filters.category === c._id ? '' : c._id)}
                    className={`w-full text-center px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border truncate ${
                      filters.category === c._id ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    title={c.name.replace(/điện thoại/i, '').trim() || c.name}
                  >
                    {c.name.replace(/điện thoại/i, '').trim() || c.name}
                  </button>
                ))}
              </div>
            </div>              {/* Brands Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2"><Sparkles size={16} className="text-purple-500"/> THƯƠNG HIỆU</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => updateFilter('brand', '')}
                  className={`w-full text-center px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    !filters.brand ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  Tất cả
                </button>
                {(brands.length > 0 ? brands.map(b => b.name) : brandOptions).map((b) => (
                  <button
                    key={b}
                    onClick={() => updateFilter('brand', filters.brand === b ? '' : b)}
                    className={`w-full text-center px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border truncate ${
                      filters.brand === b ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    title={b}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Presets & Inputs */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2"><Zap size={16} className="text-amber-500"/> MỨC GIÁ</label>
              <div className="grid grid-cols-2 gap-1.5">
                {pricePresets.map((preset, idx) => {
                  const isActive = filters.minPrice === preset.min && filters.maxPrice === preset.max;
                  return (
                    <button
                      key={idx}
                      onClick={() => updateFiltersMultiple({ minPrice: preset.min, maxPrice: preset.max })}
                      className={`w-full text-center px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border truncate ${
                        isActive
                          ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                          : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      title={preset.label}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RAM Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2"><Cpu size={16} className="text-blue-500" /> RAM</label>
              <div className="grid grid-cols-3 gap-1.5">
                {ramOptions.map((r) => (
                  <button
                    key={r}
                    onClick={() => updateFilter('ram', filters.ram === r ? '' : r)}
                    className={`w-full text-center px-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      filters.ram === r ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2"><HardDrive size={16} className="text-purple-500" /> BỘ NHỚ</label>
              <div className="grid grid-cols-3 gap-1.5">
                {storageOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateFilter('storage', filters.storage === s ? '' : s)}
                    className={`w-full text-center px-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      filters.storage === s ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">🎨 MÀU SẮC</label>
              <div className="grid grid-cols-2 gap-1.5">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateFilter('color', filters.color === c ? '' : c)}
                    className={`w-full text-center px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      filters.color === c ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white shadow-sm' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2"><Star size={16} className="text-yellow-500"/> ĐÁNH GIÁ</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[4, 3].map((star) => (
                  <button
                    key={star}
                    onClick={() => updateFilter('rating', filters.rating === String(star) ? '' : String(star))}
                    className={`w-full text-center px-1 py-1.5 rounded-lg text-xs font-semibold transition-all border flex justify-center items-center gap-1 ${
                      filters.rating === String(star) ? 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Từ {star} <Star size={12} className="fill-current text-yellow-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Stock filter */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(filters.inStock)}
                  onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Chỉ hiện máy sẵn kho</span>
              </label>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3 xl:col-span-4 space-y-6">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-5 border dark:border-gray-800 animate-pulse space-y-4">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm">
                <div className="text-6xl animate-bounce">📱</div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Không tìm thấy điện thoại phù hợp</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">Vui lòng thử chọn lại hãng khác, điều chỉnh lại mức giá hoặc xóa bớt các bộ lọc hiện tại.</p>
                <button onClick={clearFilters} className="px-6 py-3 bg-primary text-white rounded-2xl font-bold inline-flex items-center gap-2 text-xs shadow-md">
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((p) => (
                    <ProductCard key={p._id || p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8">
                    <button
                      onClick={() => updateFilter('page', filters.page - 1)}
                      disabled={filters.page <= 1}
                      className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 disabled:opacity-40 hover:bg-gray-50"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => updateFilter('page', i + 1)}
                        className={`w-11 h-11 rounded-2xl text-xs font-extrabold transition-all ${filters.page === i + 1
                            ? 'bg-primary text-white shadow-md shadow-blue-500/20 scale-105'
                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => updateFilter('page', filters.page + 1)}
                      disabled={filters.page >= pagination.pages}
                      className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 disabled:opacity-40 hover:bg-gray-50"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          PROMO & ARTICLES AT BOTTOM (Full Width)
      ════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left mb-8 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-green-800 dark:text-green-400 font-semibold text-base">Bạn chưa biết chọn máy nào? — Dùng công cụ so sánh của chúng tôi</p>
          <Link 
            to="/compare" 
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            So sánh điện thoại <ArrowRightLeft size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link to="/blog/review-iphone-17" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center hover:shadow-lg hover:border-primary/30 transition-all group">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors text-base">Review iPhone 17 Pro Max</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Camera đỉnh, pin 30 giờ?</p>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-500">
              <Star size={14} className="fill-amber-500" /> 4.9 <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">- 2.400 lượt xem</span>
            </div>
          </Link>
          <Link to="/blog/top-5-tam-trung" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center hover:shadow-lg hover:border-primary/30 transition-all group">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors text-base">Top 5 máy tầm trung 2026</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Hiệu năng — Pin — Thiết kế</p>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-500">
              <Star size={14} className="fill-amber-500" /> 4.8 <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">- 1.800 lượt xem</span>
            </div>
          </Link>
          <Link to="/blog/samsung-vs-iphone" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center hover:shadow-lg hover:border-primary/30 transition-all group">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors text-base">Nên mua Samsung hay iPhone?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">So sánh chi tiết năm 2026</p>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-500">
              <Star size={14} className="fill-amber-500" /> 4.7 <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">- 3.100 lượt xem</span>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Shop;
