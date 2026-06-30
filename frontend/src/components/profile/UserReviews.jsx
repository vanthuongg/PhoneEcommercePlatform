import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../../services/api';
import { Star, Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await reviewAPI.getMy();
      setReviews(res.data || []);
    } catch (err) {
      toast.error('Lỗi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await reviewAPI.delete(id);
      setReviews(reviews.filter(r => r._id !== id));
      toast.success('Đã xóa đánh giá');
    } catch (err) {
      toast.error('Lỗi khi xóa đánh giá');
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Star size={20} className="text-primary" /> Đánh giá của tôi
          </h2>
          <p className="text-xs text-gray-500 mt-1">Quản lý các nhận xét bạn đã viết cho sản phẩm</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
            <Star size={28} />
          </div>
          <p className="font-bold text-gray-600 dark:text-gray-400">Bạn chưa có đánh giá nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-800 p-2 flex-shrink-0">
                <img src={r.product?.images?.[0] || 'https://placehold.co/60x60'} alt={r.product?.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/product/${r.product?._id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors text-sm truncate">
                      {r.product?.name || 'Sản phẩm không xác định'}
                    </Link>
                    <div className="flex text-amber-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < r.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'} />
                      ))}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(r._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{r.comment}</p>
                <p className="text-[10px] text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserReviews;
