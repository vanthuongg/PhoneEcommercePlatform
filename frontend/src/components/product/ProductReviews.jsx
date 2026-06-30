import React, { useState, useRef, useEffect, useCallback } from 'react';
import RatingStars from '../ui/RatingStars';
import Button from '../ui/Button';
import { reviewAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Image as ImageIcon,
  Trash2,
  Pencil,
  X,
  CheckCircle,
  Camera,
  ZoomIn,
} from 'lucide-react';

/* ─────────────── helpers ─────────────── */
const ratingLabel = (r) =>
  r === 5 ? 'Tuyệt vời' : r === 4 ? 'Hài lòng' : r === 3 ? 'Bình thường' : r === 2 ? 'Không hài lòng' : 'Tệ';

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

/* ─────────────── Image lightbox ─────────────── */
const Lightbox = ({ src, onClose }) => (
  <div
    className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center"
    onClick={onClose}
  >
    <button
      className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/40 rounded-full p-2 transition"
      onClick={onClose}
    >
      <X size={22} />
    </button>
    <img
      src={src}
      alt="preview"
      className="max-w-[92vw] max-h-[88vh] rounded-2xl shadow-2xl object-contain"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

/* ─────────────── Image upload strip ─────────────── */
const ImageUploadStrip = ({ images, onChange, max = 5 }) => {
  const inputRef = useRef();
  const [lightbox, setLightbox] = useState(null);

  const handleFiles = async (files) => {
    const remaining = max - images.length;
    const picked = Array.from(files).slice(0, remaining);
    const b64s = await Promise.all(picked.map(toBase64));
    onChange([...images, ...b64s]);
  };

  const remove = (i) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {images.map((src, i) => (
        <div
          key={i}
          className="relative group w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => setLightbox(src)}
              className="text-white p-1 hover:scale-110 transition-transform"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-white p-1 hover:scale-110 transition-transform"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}

      {images.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:border-primary hover:text-primary transition-colors"
        >
          <Camera size={18} />
          <span className="text-[9px] font-bold">Thêm ảnh</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
};

/* ─────────────── Review form (new / edit) ─────────────── */
const ReviewForm = ({ productId, existingReview, onSubmitted, onCancel }) => {
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [images, setImages] = useState(existingReview?.images ?? []);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    try {
      setLoading(true);
      const res = await reviewAPI.create({ productId, rating, comment, images });
      toast.success(existingReview ? 'Đã cập nhật đánh giá!' : 'Đánh giá của bạn đã được đăng!');
      // DEBUG: log API response to diagnose shape
      console.log('[ReviewAPI] create response:', JSON.stringify(res?.data));
      // Extract saved review from API response (handles multiple response shapes)
      // Backend returns: { success, message, data: reviewObj }
      // Axios wraps as: res.data = { success, message, data: reviewObj }
      const raw = res?.data;
      const savedReview = (raw?.data && (raw.data._id || raw.data.id))
        ? raw.data
        : (raw && (raw._id || raw.id))
          ? raw
          : null;
      console.log('[ReviewAPI] savedReview parsed:', savedReview?._id || savedReview?.id || 'NULL - will use fallback fetch');
      // Reset form if creating new
      if (!existingReview) {
        setRating(5);
        setComment('');
        setImages([]);
      }
      onSubmitted(savedReview);
    } catch (err) {
      toast.error(err.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm"
    >
      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
        <MessageSquare size={18} className="text-primary" />
        {existingReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá trải nghiệm mua hàng'}
      </h4>

      {/* Rating stars */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Chất lượng sản phẩm:
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              className="p-0.5 hover:scale-125 transition-transform"
            >
              <Star
                size={26}
                className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-700'}
              />
            </button>
          ))}
        </div>
        <span className="text-xs font-extrabold text-primary">{ratingLabel(rating)}</span>
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="Xin mời chia sẻ trải nghiệm sử dụng sản phẩm, thời lượng pin, camera hoặc tốc độ giao hàng..."
        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none text-sm text-gray-900 dark:text-white resize-none"
      />

      {/* Image upload */}
      <div>
        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1">
          <ImageIcon size={14} className="text-blue-500" />
          Đính kèm ảnh thực tế (tối đa 5 ảnh)
        </span>
        <ImageUploadStrip images={images} onChange={setImages} max={5} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Hủy
          </button>
        )}
        <Button type="submit" loading={loading} className="px-6 py-2.5 rounded-xl font-bold text-sm">
          {existingReview ? 'Lưu thay đổi' : 'Gửi đánh giá'}
        </Button>
      </div>
    </form>
  );
};

/* ─────────────── Single review card ─────────────── */
const ReviewCard = ({ rev, currentUserId, isAdmin, isManager, onDelete, onEdit }) => {
  const [lightbox, setLightbox] = useState(null);
  const isOwner = currentUserId && (rev.user?._id || rev.user?.id) === currentUserId;
  const canDelete = isOwner || isAdmin || isManager;
  const canEdit = isOwner;

  return (
    <div className="pt-6 flex gap-4 group animate-fadeIn">
      <img
        src={
          rev.user?.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.name || 'Khách')}&background=2563EB&color=fff`
        }
        alt={rev.user?.name}
        className="w-11 h-11 rounded-2xl object-cover shrink-0 shadow-sm border border-gray-200 dark:border-gray-700"
      />

      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-sm text-gray-900 dark:text-white">
              {rev.user?.name || 'Khách hàng'}
            </span>
            {rev.isVerifiedPurchase && (
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={10} /> Đã mua hàng
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-gray-400">
              {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
            </span>
            {canEdit && (
              <button
                onClick={() => onEdit(rev)}
                className="text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-primary/10"
                title="Sửa đánh giá"
              >
                <Pencil size={14} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(rev._id || rev.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title={isOwner ? 'Xóa đánh giá của bạn' : 'Xóa vi phạm (Admin)'}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <RatingStars rating={rev.rating} size={15} />
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rev.comment}</p>

        {/* Images */}
        {rev.images && rev.images.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {rev.images.map((imgUrl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(imgUrl)}
                className="w-20 h-20 rounded-xl overflow-hidden border dark:border-gray-700 shadow-sm hover:scale-105 transition-transform relative group/img"
              >
                <img src={imgUrl} alt="Review" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn size={18} className="text-white" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Likes */}
        <div className="flex items-center gap-4 pt-1 text-xs text-gray-400">
          <button className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium">
            <ThumbsUp size={13} /> Hữu ích ({rev.likes || 0})
          </button>
        </div>
      </div>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
};

/* ─────────────── Main component ─────────────── */
const ProductReviews = ({ productId }) => {
  const { user, isAuthenticated, isAdmin, isManager } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [filterRating, setFilterRating] = useState(0);
  const [editingReview, setEditingReview] = useState(null);

  /* fetch reviews - initial load shows spinner, silent=true just updates data */
  const fetchReviews = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoadingReviews(true);
      const res = await reviewAPI.getByProduct(productId);
      const list = res.data?.data || res.data || [];
      setReviews(Array.isArray(list) ? list : []);
    } catch {
      /* ignore silent errors */
    } finally {
      if (!silent) setLoadingReviews(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) fetchReviews(false);
  }, [productId, fetchReviews]);

  const filteredReviews =
    filterRating === 0 ? reviews : reviews.filter((r) => Math.floor(r.rating) === filterRating);

  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 5;

  const myReview =
    isAuthenticated && user
      ? reviews.find((r) => (r.user?._id || r.user?.id) === (user._id || user.id))
      : null;

  // After ReviewForm submits successfully
  const handleSubmitted = (savedReview) => {
    setEditingReview(null);
    if (savedReview && (savedReview._id || savedReview.id)) {
      // Pure optimistic update - show instantly, no re-fetch
      setReviews(prev => {
        const id = savedReview._id || savedReview.id;
        const exists = prev.find(r => (r._id || r.id) === id);
        if (exists) {
          return prev.map(r => (r._id || r.id) === id ? savedReview : r);
        }
        return [savedReview, ...prev];
      });
    } else {
      // savedReview could not be parsed - fetch after a short delay
      setTimeout(() => fetchReviews(true), 800);
    }
  };

  const handleDelete = async (reviewId) => {
    const rev = reviews.find((r) => (r._id || r.id) === reviewId);
    const isOwn = rev && user && (rev.user?._id || rev.user?.id) === (user._id || user.id);
    const msg = isOwn
      ? 'Bạn có chắc muốn xóa đánh giá của mình không?'
      : 'Quản trị viên: Xóa bài đánh giá vi phạm?';
    if (!window.confirm(msg)) return;
    try {
      await reviewAPI.delete(reviewId);
      toast.success('Đã xóa đánh giá');
      // Pure optimistic removal
      setReviews(prev => prev.filter(r => (r._id || r.id) !== reviewId));
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa');
    }
  };

  if (loadingReviews) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Rating overview ── */}
      <div className="bg-primary/5 dark:bg-gray-800/50 rounded-3xl p-6 sm:p-8 border border-primary/20 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="text-center md:text-left shrink-0 md:pr-6 md:border-r border-gray-200 dark:border-gray-700">
          <div className="text-4xl sm:text-5xl font-black text-primary">
            {avgRating.toFixed(1)}
            <span className="text-lg text-gray-400 font-normal"> / 5</span>
          </div>
          <div className="mt-1 flex justify-center md:justify-start">
            <RatingStars rating={avgRating} size={20} />
          </div>
          <p className="text-xs font-bold text-gray-500 mt-1.5">
            Dựa trên {reviews.length} đánh giá xác thực
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1 justify-center md:justify-start">
          <button
            onClick={() => setFilterRating(0)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filterRating === 0
                ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary'
            }`}
          >
            Tất cả ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => Math.floor(r.rating) === star).length;
            return (
              <button
                key={star}
                onClick={() => setFilterRating(star)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterRating === star
                    ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary'
                }`}
              >
                {star} <Star size={13} className="fill-current text-amber-400" /> ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Write / Edit form ── */}
      {isAuthenticated && (
        <>
          {editingReview ? (
            <ReviewForm
              productId={productId}
              existingReview={editingReview}
              onSubmitted={handleSubmitted}
              onCancel={() => setEditingReview(null)}
            />
          ) : myReview ? (
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Bạn đã đánh giá sản phẩm này
                  </p>
                  <RatingStars rating={myReview.rating} size={13} />
                </div>
              </div>
              <button
                onClick={() => setEditingReview(myReview)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-blue-600 transition-colors"
              >
                <Pencil size={13} /> Sửa đánh giá
              </button>
            </div>
          ) : (
            <ReviewForm
              productId={productId}
              existingReview={null}
              onSubmitted={handleSubmitted}
            />
          )}
        </>
      )}

      {/* ── Review list ── */}
      <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => (
            <ReviewCard
              key={rev._id || rev.id}
              rev={rev}
              currentUserId={user?._id || user?.id}
              isAdmin={isAdmin}
              isManager={isManager}
              onDelete={handleDelete}
              onEdit={(r) => setEditingReview(r)}
            />
          ))
        ) : (
          <div className="text-center py-16 text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/40 rounded-3xl">
            Chưa có đánh giá nào cho bộ lọc này. Hãy là người đầu tiên đánh giá sản phẩm!
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.35s ease both; }
      `}</style>
    </div>
  );
};

export default ProductReviews;
