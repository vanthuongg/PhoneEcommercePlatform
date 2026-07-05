import { useState, useEffect } from 'react';
import { bannerAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', link: '', isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await bannerAPI.getAllAdmin(); // assuming bannerAPI.getAllAdmin exists or just getAll
      setBanners(res.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setEditId(banner._id);
    setFormData({ title: banner.title || '', link: banner.link || '', isActive: banner.isActive });
    setImagePreview(banner.imageUrl || banner.image || '');
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa banner này?')) return;
    try {
      await bannerAPI.delete(id);
      setBanners(banners.filter(b => b._id !== id));
      toast.success('Xóa banner thành công');
    } catch (err) {
      toast.error('Lỗi khi xóa banner');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId && !imageFile) {
      toast.error('Vui lòng chọn hình ảnh banner');
      return;
    }
    
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('link', formData.link);
      fd.append('isActive', formData.isActive);
      if (imageFile) fd.append('image', imageFile);

      if (editId) {
        await bannerAPI.update(editId, fd);
        toast.success('Cập nhật banner thành công');
      } else {
        await bannerAPI.create(fd);
        toast.success('Thêm banner thành công');
      }
      
      setShowForm(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi lưu banner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý Banner</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cấu hình banner quảng cáo trang chủ</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => {
              setEditId(null);
              setFormData({ title: '', link: '', isActive: true });
              setImagePreview(null);
              setImageFile(null);
              setShowForm(true);
            }} 
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm Banner mới
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card p-6 max-w-2xl">
          <h2 className="text-lg font-bold mb-4">{editId ? 'Sửa Banner' : 'Thêm Banner Mới'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề (Không bắt buộc)</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                className="input-field" 
                placeholder="VD: Khuyến mãi mùa hè..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Đường dẫn khi click (Link)</label>
              <input 
                type="text" 
                value={formData.link} 
                onChange={(e) => setFormData({...formData, link: e.target.value})} 
                className="input-field" 
                placeholder="VD: /shop?category=sale"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Hình ảnh *</label>
              <div className="mt-1 flex items-center gap-4">
                <div className="w-40 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={typeof imagePreview === 'string' && (imagePreview.startsWith('http') || imagePreview.startsWith('blob:')) ? imagePreview : `http://localhost:5000${imagePreview}`} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                      setImagePreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-medium">Hiển thị (Active)</label>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy bỏ</button>
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Lưu Banner
              </button>
            </div>
          </form>
        </div>
      ) : loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">Chưa có banner nào trong hệ thống</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => {
            const imgUrl = banner.imageUrl || banner.image || '';
            return (
            <div key={banner._id} className="card overflow-hidden group">
              <div className="aspect-[21/9] relative bg-gray-100 dark:bg-gray-800">
                <img 
                  src={imgUrl && imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`} 
                  alt={banner.title} 
                  className={`w-full h-full object-cover transition-opacity ${!banner.isActive ? 'opacity-50 grayscale' : ''}`}
                />
                {!banner.isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Đã Ẩn</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => handleEdit(banner)} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(banner._id)} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{banner.title || 'Không có tiêu đề'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">Link: {banner.link || 'Không có'}</p>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Banners;
