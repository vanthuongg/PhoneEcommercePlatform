import React, { useState, useEffect } from 'react';
import { brandAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, Tag, CheckCircle, XCircle, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', logo: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await brandAPI.getAllAdmin();
      setBrands(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const openAdd = () => {
    setEditingBrand(null);
    setFormData({ name: '', description: '', logo: '', isActive: true });
    setModalOpen(true);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name || '', description: brand.description || '', logo: brand.logo || '', isActive: brand.isActive !== false });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Vui lòng nhập tên thương hiệu'); return; }
    setSubmitting(true);
    try {
      if (editingBrand) {
        await brandAPI.update(editingBrand._id, formData);
        toast.success('Cập nhật thương hiệu thành công');
      } else {
        await brandAPI.create(formData);
        toast.success('Thêm thương hiệu mới thành công');
      }
      setModalOpen(false);
      fetchBrands();
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (brand) => {
    try {
      await brandAPI.update(brand._id, { ...brand, isActive: !brand.isActive });
      toast.success(brand.isActive ? 'Đã ẩn thương hiệu' : 'Đã hiển thị thương hiệu');
      fetchBrands();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa thương hiệu "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await brandAPI.delete(id);
      toast.success('Đã xóa thương hiệu');
      fetchBrands();
    } catch (err) {
      toast.error(err.message || 'Không thể xóa thương hiệu');
    }
  };

  const filtered = brands.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="w-7 h-7 text-primary" /> Quản lý Thương hiệu
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {brands.length} thương hiệu · {brands.filter(b => b.isActive).length} đang hoạt động
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
        >
          <Plus className="w-5 h-5" /> Thêm Thương hiệu
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative max-w-md mb-6">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Chưa có thương hiệu nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Thương hiệu</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-extrabold text-primary overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
                          {b.logo && (b.logo.startsWith('http') || b.logo.startsWith('/')) ? (
                            <img src={b.logo} alt={b.name} className="w-7 h-7 object-contain" />
                          ) : (
                            <span className="text-xl">{b.logo && b.logo.length <= 6 ? b.logo : b.name?.[0]}</span>
                          )}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{b.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-500 font-mono text-xs">{b.slug}</td>
                    <td className="py-4 px-4 text-gray-500 max-w-[200px] truncate text-xs">{b.description || '—'}</td>
                    <td className="py-4 px-4">
                      {b.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <XCircle className="w-3.5 h-3.5" /> Đã ẩn
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(b)}
                          className={`p-2 rounded-xl transition-colors ${b.isActive ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          title={b.isActive ? 'Ẩn thương hiệu' : 'Hiển thị thương hiệu'}
                        >
                          {b.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleEdit(b)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id, b.name)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
              {editingBrand ? '✏️ Cập nhật Thương hiệu' : '➕ Thêm Thương hiệu mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tên thương hiệu *</label>
                <input
                  type="text" required
                  placeholder="Ví dụ: Apple, Samsung, Xiaomi..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Logo (URL hoặc Emoji)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 🍏, 📱, hoặc link https://..."
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
                {formData.logo && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>Xem trước:</span>
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {formData.logo.startsWith('http') || formData.logo.startsWith('/') ? (
                        <img src={formData.logo} alt="" className="w-6 h-6 object-contain" />
                      ) : <span>{formData.logo}</span>}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mô tả</label>
                <textarea
                  rows="3"
                  placeholder="Mô tả ngắn gọn về thương hiệu..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox" checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Hiển thị thương hiệu</p>
                  <p className="text-xs text-gray-500">Thương hiệu sẽ xuất hiện trong bộ lọc sản phẩm</p>
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
                  {submitting ? 'Đang lưu...' : editingBrand ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;
