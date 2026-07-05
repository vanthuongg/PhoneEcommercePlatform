import React, { useState, useEffect, useMemo } from 'react';
import { bannerAPI } from '../../services/api';
import { 
  Plus, Edit2, Trash2, Loader2, Image as ImageIcon, 
  Sparkles, ExternalLink, Eye, EyeOff, ToggleLeft, ToggleRight, 
  CheckCircle2, XCircle, RefreshCw, Layers, Monitor, Smartphone, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', link: '', isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await bannerAPI.getAllAdmin();
      setBanners(res.data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách banner quảng cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setFormData({ title: '', link: '', isActive: true });
    setImagePreview(null);
    setImageFile(null);
    setModal('create');
  };

  const openEdit = (banner) => {
    setEditId(banner._id);
    setFormData({ title: banner.title || '', link: banner.link || '', isActive: banner.isActive !== false });
    setImagePreview(banner.imageUrl || banner.image || '');
    setImageFile(null);
    setModal('edit');
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn banner "${title || 'Không tiêu đề'}"?`)) return;
    try {
      await bannerAPI.delete(id);
      setBanners(banners.filter(b => b._id !== id));
      toast.success('Đã xóa banner khỏi chiến dịch');
    } catch (err) {
      toast.error('Không thể xóa banner');
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      const fd = new FormData();
      fd.append('title', banner.title || '');
      fd.append('link', banner.link || '');
      fd.append('isActive', !banner.isActive);
      
      const res = await bannerAPI.update(banner._id, fd);
      setBanners(banners.map(b => b._id === banner._id ? res.data : b));
      toast.success(res.data.isActive ? 'Đã bật hiển thị banner trên trang chủ' : 'Đã ẩn banner khỏi trang chủ');
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId && !imageFile) {
      toast.error('Vui lòng chọn tệp hình ảnh cho banner');
      return;
    }
    
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('link', formData.link.trim());
      fd.append('isActive', formData.isActive);
      if (imageFile) fd.append('image', imageFile);

      if (editId) {
        const res = await bannerAPI.update(editId, fd);
        setBanners(banners.map(b => b._id === editId ? res.data : b));
        toast.success('✨ Đã cập nhật chiến dịch banner!');
      } else {
        const res = await bannerAPI.create(fd);
        setBanners([res.data, ...banners]);
        toast.success('🎉 Đã thêm banner mới vào chiến dịch!');
      }
      
      setModal(null);
    } catch (err) {
      toast.error(err.message || 'Lỗi khi lưu banner');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const total = banners.length;
    const active = banners.filter(b => b.isActive !== false).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [banners]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display">
              Quản Trị Banner & Chiến Dịch Marketing
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-12">
            Cấu hình slider trang chủ, banner quảng cáo khuyến mãi và điều hướng chiến dịch bán hàng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBanners}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-pink-600' : ''}`} />
          </button>
          
          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs shadow-lg shadow-pink-500/30 active:scale-95 transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Banner Quảng Cáo</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0 font-black">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng banner hiện có</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.active}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đang hiển thị trang chủ</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-500/10 text-slate-500 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.inactive}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đang ẩn / Lưu trữ</p>
          </div>
        </div>
      </div>

      {/* Preview Mode Switch Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-pink-600" />
          <span>Chế độ kiểm tra hiển thị (Live Preview Aspect Ratio):</span>
        </span>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              previewMode === 'desktop' ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop (21:9)</span>
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              previewMode === 'mobile' ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (16:9)</span>
          </button>
        </div>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse p-5" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <ImageIcon className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có banner nào trong chiến dịch</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bấm nút "Thêm Banner Quảng Cáo" ở trên để bắt đầu tải lên hình ảnh chiến dịch marketing đầu tiên.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => {
            const imgUrl = banner.imageUrl || banner.image || '';
            const isActive = banner.isActive !== false;
            const aspectClass = previewMode === 'desktop' ? 'aspect-[21/9]' : 'aspect-[16/9]';
            
            return (
              <div
                key={banner._id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                {/* Image Container */}
                <div className={`${aspectClass} relative bg-slate-100 dark:bg-slate-800 overflow-hidden`}>
                  <img
                    src={imgUrl && imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`}
                    alt={banner.title || 'Banner'}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                      !isActive ? 'opacity-40 grayscale' : ''
                    }`}
                  />

                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${
                      isActive 
                        ? 'bg-emerald-500/90 text-white' 
                        : 'bg-slate-900/80 text-slate-300'
                    }`}>
                      {isActive ? '● Đang hiển thị' : '○ Đã ẩn'}
                    </span>
                  </div>

                  {/* Quick Action Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-xs">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className={`p-3 rounded-2xl transition-transform active:scale-90 shadow-lg ${
                        isActive ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                      title={isActive ? 'Ẩn banner này' : 'Bật hiển thị banner'}
                    >
                      {isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => openEdit(banner)}
                      className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl backdrop-blur-md transition-transform active:scale-90 shadow-lg"
                      title="Chỉnh sửa banner"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(banner._id, banner.title)}
                      className="p-3 bg-rose-500/80 hover:bg-rose-500 text-white rounded-2xl backdrop-blur-md transition-transform active:scale-90 shadow-lg"
                      title="Xóa banner"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Card Info Footer */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-sm truncate group-hover:text-pink-600 transition-colors">
                      {banner.title || 'Chiến dịch không có tiêu đề'}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-xs truncate">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate font-mono">{banner.link || 'Không có liên kết đích (No Link)'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                      <span>{isActive ? 'Đang bật' : 'Đang tắt'}</span>
                    </button>

                    <span className="font-mono text-slate-400">
                      ID: {banner._id?.slice(-4).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-scale-up">
            
            <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-600 flex items-center justify-center font-black">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {modal === 'create' ? '✨ Thêm Banner Quảng Cáo Mới' : '✏️ Chỉnh Sửa Banner'}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Tải lên hình ảnh khuyến mãi cho slider trang chủ
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

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Tiêu đề chiến dịch quảng cáo
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Siêu Sale Mùa Hè - Giảm đến 50%..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Đường dẫn liên kết đích (LinkURL)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="Ví dụ: /products?category=apple hoặc https://..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Hình ảnh Banner (Bắt buộc *)
                </label>
                
                {/* Preview Box */}
                <div className="aspect-[21/9] w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 flex items-center justify-center mb-3 relative group shadow-inner">
                  {imagePreview ? (
                    <img
                      src={typeof imagePreview === 'string' && (imagePreview.startsWith('http') || imagePreview.startsWith('blob:')) ? imagePreview : `http://localhost:5000${imagePreview}`}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center space-y-1 p-4">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-500">Chưa chọn ảnh banner</p>
                      <p className="text-[10px] text-slate-400">Khuyến nghị tỉ lệ 21:9 hoặc 16:9 chất lượng cao</p>
                    </div>
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
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-pink-500/10 file:text-pink-600 cursor-pointer"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Cho phép hiển thị trên Slider Trang chủ</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Banner sẽ ngay lập tức xuất hiện trong luồng quảng cáo</span>
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
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs shadow-lg shadow-pink-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 flex-1 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{modal === 'create' ? 'Tạo Banner' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
