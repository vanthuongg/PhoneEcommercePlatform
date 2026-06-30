import React, { useState, useEffect } from 'react';
import { brandAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, Tag, CheckCircle, XCircle } from 'lucide-react';

const ManagerBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', logo: '', isActive: true });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await brandAPI.getAllAdmin();
      setBrands(res.data || []);
    } catch (err) {
      // Nếu API lỗi hoặc chưa có auth admin thì fallback về getAll
      try {
        const resPublic = await brandAPI.getAll();
        setBrands(resPublic.data || []);
      } catch {
        toast.error('Không thể tải danh sách thương hiệu');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên thương hiệu');
      return;
    }
    try {
      if (editingBrand) {
        await brandAPI.update(editingBrand._id, formData);
        toast.success('Cập nhật thương hiệu thành công');
      } else {
        await brandAPI.create(formData);
        toast.success('Thêm thương hiệu mới thành công');
      }
      setModalOpen(false);
      setEditingBrand(null);
      setFormData({ name: '', description: '', logo: '', isActive: true });
      fetchBrands();
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      description: brand.description || '',
      logo: brand.logo || '',
      isActive: brand.isActive !== undefined ? brand.isActive : true,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return;
    try {
      await brandAPI.delete(id);
      toast.success('Đã xóa thương hiệu');
      fetchBrands();
    } catch (err) {
      toast.error(err.message || 'Không thể xóa thương hiệu');
    }
  };

  const filteredBrands = brands.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="w-7 h-7 text-primary" /> Quản lý Thương hiệu
          </h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý các hãng điện thoại: Apple, Samsung, Xiaomi, Oppo, Vivo...</p>
        </div>
        <button
          onClick={() => {
            setEditingBrand(null);
            setFormData({ name: '', description: '', logo: '', isActive: true });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
        >
          <Plus className="w-5 h-5" /> Thêm Thương hiệu
        </button>
      </div>

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
          <div className="py-12 text-center text-gray-500">Đang tải danh sách thương hiệu...</div>
        ) : filteredBrands.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Chưa có thương hiệu nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Tên thương hiệu</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {filteredBrands.map((b) => (
                  <tr key={b._id || b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-extrabold text-primary overflow-hidden shrink-0">
                        {(b.logo && (b.logo.startsWith('http') || b.logo.startsWith('/'))) ? (
                          <img src={b.logo} alt={b.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{b.logo && b.logo.length <= 6 ? b.logo : b.name?.[0]}</span>
                        )}
                      </div>
                      {b.name}
                    </td>
                    <td className="py-4 px-4 text-gray-500 font-mono text-xs">{b.slug}</td>
                    <td className="py-4 px-4 text-gray-500 max-w-xs truncate">{b.description || '—'}</td>
                    <td className="py-4 px-4">
                      {b.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <XCircle className="w-3.5 h-3.5" /> Ẩn
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(b)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id || b.id)}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingBrand ? 'Cập nhật Thương hiệu' : 'Thêm Thương hiệu mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tên thương hiệu *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Apple, Samsung..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Logo URL hoặc biểu tượng (Emoji)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 🍏, 📱, hoặc link ảnh https://..."
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                <textarea
                  rows="3"
                  placeholder="Mô tả ngắn gọn về thương hiệu..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Hoạt động hiển thị</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-sm transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-blue-600 transition-colors shadow-md text-sm"
                >
                  Lưu thương hiệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerBrands;
