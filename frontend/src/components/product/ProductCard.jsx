import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import RatingStars from '../ui/RatingStars';
import { Heart, ShoppingCart, Zap, Sparkles, Scale, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const navigate = useNavigate();
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!product) return null;

  const price = product.salePrice > 0 ? product.salePrice : product.price;
  const oldPrice = product.oldPrice > 0 ? product.oldPrice : (product.salePrice > 0 ? product.price : 0);
  const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const isWishlisted = isInWishlist(product._id || product.id);
  const isCompared = isInCompare(product._id || product.id);

  // Check if product is new (created in last 30 days or tagged new)
  const isNew = product.tags?.includes('new') || (product.createdAt && new Date() - new Date(product.createdAt) < 30 * 24 * 60 * 60 * 1000);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('Sản phẩm tạm hết hàng!');
      return;
    }
    // Nếu sản phẩm có variants, chuyển đến trang chi tiết để chọn màu/dung lượng
    if (product.variants && product.variants.length > 0) {
      navigate(`/product/${product._id || product.id}`);
      return;
    }
    const defaultStorage = '128GB';
    const defaultColor = 'Mặc định';
    
    const startX = e.clientX || window.innerWidth / 2;
    const startY = e.clientY || window.innerHeight / 2;

    const res = await addToCart(product._id || product.id, 1, defaultStorage, defaultColor, {
      name: product.name,
      image: product.images?.[0],
      price: price,
      startX,
      startY
    });

    if (res?.success !== false) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1800);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
  };

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product._id || product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <Link
      to={`/product/${product._id || product.id}`}
      className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-all duration-300 hover:shadow-premium-hover dark:hover:shadow-premium-hover-dark hover:-translate-y-2 hover:border-primary-500/60 dark:hover:border-primary-500/60 relative z-10"
    >
      {/* Shimmer sweep effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 dark:via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none z-20" />

      {/* Badges góc trên trái */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 items-start">
        {discountPercent > 0 && (
          <span className="bg-gradient-to-r from-red-600 via-accent-600 to-orange-500 text-white font-black text-[10px] px-2.5 py-1 rounded-xl shadow-lg uppercase tracking-wider flex items-center gap-1 animate-pulse">
            <Zap size={11} className="fill-white animate-bounce-subtle" /> -{discountPercent}%
          </span>
        )}
        {isNew && (
          <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-xl shadow-lg uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} className="animate-spin-slow" /> Mới
          </span>
        )}
        {!isNew && product.isFeatured && (
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-xl shadow-lg uppercase tracking-wider">
            Nổi bật
          </span>
        )}
      </div>

      {/* Action floating bar bên phải */}
      <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isWishlisted
              ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/40 animate-bounce-subtle'
              : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-400 hover:text-red-500 hover:scale-110 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
          }`}
          title="Yêu thích"
        >
          <Heart size={17} className={isWishlisted ? 'fill-white' : 'group-hover:scale-110 transition-transform'} />
        </button>

        <button
          type="button"
          onClick={handleToggleCompare}
          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isCompared
              ? 'bg-primary-600 text-white scale-110 shadow-lg shadow-primary-500/40'
              : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-400 hover:text-primary-600 hover:scale-110 shadow-sm border border-slate-200/60 dark:border-slate-700/60 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0'
          }`}
          title={isCompared ? "Bỏ so sánh" : "Thêm vào so sánh"}
        >
          {isCompared ? <Check size={17} className="stroke-[3]" /> : <Scale size={17} />}
        </button>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-slate-50/80 via-slate-50/40 to-white dark:from-slate-800/40 dark:via-slate-800/20 dark:to-slate-900 p-7 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400?text=Phone'}
          alt={product.name}
          className="w-full h-full object-contain object-center group-hover:scale-115 transition-all duration-500 drop-shadow-md group-hover:drop-shadow-xl"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-20 animate-fade-in">
            <span className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-xs px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-2xl border border-slate-200 dark:border-slate-700">
              Tạm hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-white dark:bg-slate-900 transition-colors">
        <div>
          <div className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] truncate mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 inline-block" />
            {product.brand || 'Điện thoại'}
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        <div className="mt-auto pt-2 space-y-3.5">
          {/* Rating & Sold */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <RatingStars rating={product.rating || 5} size={13} />
              <span className="font-bold text-slate-700 dark:text-slate-300 ml-0.5">({product.rating || 5.0})</span>
            </div>
            <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
              Đã bán {product.sold > 1000 ? `${(product.sold / 1000).toFixed(1)}k` : (product.sold || 12)}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl text-red-600 dark:text-red-400 leading-none tracking-tight">
                {formatPrice(price)}
              </span>
              {oldPrice > price && (
                <span className="text-xs text-slate-400 line-through mt-1 font-medium">
                  {formatPrice(oldPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-300 shadow-md active:scale-95 ${
              addedSuccess
                ? 'bg-emerald-500 text-white shadow-emerald-500/40 animate-pulse-glow'
                : 'btn-primary group/btn'
            }`}
            title="Thêm vào giỏ hàng"
          >
            {addedSuccess ? (
              <>
                <Check size={18} className="animate-bounce" />
                <span>Đã vào giỏ! ✨</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} className="group-hover/btn:scale-125 group-hover/btn:rotate-6 transition-transform duration-300" />
                <span>{product.variants && product.variants.length > 0 ? 'Chọn phiên bản' : 'Chọn mua'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
