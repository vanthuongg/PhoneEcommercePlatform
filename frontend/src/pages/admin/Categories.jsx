import React, { useState, useEffect, useMemo } from 'react';
import { categoryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, Edit, Trash2, X, Loader2, FolderTree, Search, 
  CheckCircle2, XCircle, Sparkles, Package, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Categories = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const roleTitle = isAdmin ? 'Quản Trị Danh Mục & Phân Loại' : 'Quản Lý Danh Mục Sản Phẩm';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Modal states
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState({ name: '', description: '', isActive: true });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => { 
    setForm({ name: '', description: '', isActive: true }); 
    setImage(null); 
    setModal('create'); 
  };

  const openEdit = (c) => { 
    setForm({ name: c.name || '', description: c.description || '', isActive: c.isActive !== false, _id: c._id }); 
    setImage(null); 
    setModal('edit'); 
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('isActive', form.isActive);
      if (image) fd.append('image', image);

      if (modal === 'create') {
        const res = await categoryAPI.create(fd);
        setCategories([res.data, ...categories]);
        toast.success('🎉 Đã tạo danh mục mới!');
      } else {
        const res = await categoryAPI.update(form._id, fd);
        setCategories(categories.map(c => c._id === form._id ? res.data : c));
        toast.success('✨ Đã cập nhật thông tin danh mục!');
      }
      setModal(null);
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn danh mục "${name}"? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.`)) return;
    try {
      await categoryAPI.delete(id);
      setCategories(categories.filter(c => c._id !== id));
      toast.success('Đã xóa danh mục');
    } catch (err) {
      toast.error(err.message || 'Không thể xóa danh mục này');
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const fd = new FormData();
      fd.append('name', cat.name);
      fd.append('description', cat.description || '');
      fd.append('isActive', !cat.isActive);
      
      const res = await categoryAPI.update(cat._id, fd);
      setCategories(categories.map(c => c._id === cat._id ? res.data : c));
      toast.success(res.data.isActive ? 'Đã bật hiển thị danh mục' : 'Đã ẩn danh mục khỏi cửa hàng');
    } catch {
      toast.error('Không thể đổi trạng thái');
    }
  };

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (statusFilter === 'active') return c.isActive !== false;
      if (statusFilter === 'inactive') return c.isActive === false;
      return true;
    });
  }, [categories, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter(c => c.isActive !== false).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [categories]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <FolderTree className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display">
              {roleTitle}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-12">
            Phân loại catalog, tổ chức nhóm sản phẩm và quản lý trạng thái hiển thị cửa hàng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          
          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Danh Mục</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 font-black">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng số danh mục</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.active}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đang hiển thị</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-500/10 text-slate-500 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.inactive}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đang ẩn</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'active', label: 'Đang hoạt động', color: 'text-emerald-500' },
            { key: 'inactive', label: 'Đã ẩn', color: 'text-slate-500' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.key
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse p-5" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FolderTree className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy danh mục nào</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Thêm Danh Mục" để bắt đầu tạo mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${cat.isActive ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-slate-300 dark:bg-slate-700'}`} />

              <div className="space-y-4 pt-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-extrabold shrink-0 border border-amber-500/20 overflow-hidden">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleStatus(cat)}
                      className={`p-2 rounded-xl transition-colors ${
                        cat.isActive 
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' 
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={cat.isActive ? 'Bấm để ẩn danh mục' : 'Bấm để hiển thị danh mục'}
                    >
                      {cat.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-amber-500 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {cat.description || 'Chưa có mô tả chi tiết cho danh mục này.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  cat.isActive 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span>{cat.isActive ? 'Đang hoạt động' : 'Đã ẩn'}</span>
                </span>

                <span className="text-[10px] font-bold text-slate-400">
                  ID: {cat._id?.slice(-4).toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-scale-up">
            
            <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {modal === 'create' ? '✨ Thêm Danh Mục Mới' : '✏️ Chỉnh Sửa Danh Mục'}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Tổ chức phân loại sản phẩm trong hệ thống
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

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Điện thoại, Máy tính bảng, Phụ kiện..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả ngắn gọn về nhóm danh mục này..."
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Hình ảnh đại diện (Icon / Banner)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500/10 file:text-amber-600 cursor-pointer"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Cho phép hiển thị trên cửa hàng</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Danh mục sẽ xuất hiện trên menu navigation</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 flex-1 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{modal === 'create' ? 'Tạo Danh Mục' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
