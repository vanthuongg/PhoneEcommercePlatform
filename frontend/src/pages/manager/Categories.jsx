import { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Categories = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', isActive: true });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryAPI.getAll().then(res => { setCategories(res.data || []); setLoading(false); });
  }, []);

  const openCreate = () => { setForm({ name: '', description: '', isActive: true }); setImage(null); setModal('create'); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description, isActive: c.isActive, _id: c._id }); setImage(null); setModal('edit'); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('isActive', form.isActive);
      if (image) fd.append('image', image);
      if (modal === 'create') {
        const res = await categoryAPI.create(fd);
        setCategories([res.data, ...categories]);
        toast.success('Tạo danh mục thành công');
      } else {
        const res = await categoryAPI.update(form._id, fd);
        setCategories(categories.map(c => c._id === form._id ? res.data : c));
        toast.success('Cập nhật thành công');
      }
      setModal(null);
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try {
      await categoryAPI.delete(id);
      setCategories(categories.filter(c => c._id !== id));
      toast.success('Đã xóa danh mục');
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý danh mục</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{categories.length} danh mục</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-32 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                  {isAdmin && (
                    <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{cat.description || 'Không có mô tả'}</p>
              <span className={`badge mt-2 ${cat.isActive ? 'badge-success' : 'badge-gray'}`}>{cat.isActive ? 'Hoạt động' : 'Ẩn'}</span>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{modal === 'create' ? 'Thêm danh mục' : 'Chỉnh sửa danh mục'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tên danh mục *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mô tả</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hình ảnh</label>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="input-field" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Hiển thị danh mục</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 spinner" />}
                  {modal === 'create' ? 'Tạo' : 'Lưu'}
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
