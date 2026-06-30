import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useCompare } from '../../contexts/CompareContext';
import RatingStars from '../ui/RatingStars';
import { Heart, ShoppingCart, Zap, Sparkles, Scale } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useNotification();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const navigate = useNavigate();

  if (!product) return null;

  const price = product.salePrice > 0 ? product.salePrice : product.price;
  const oldPrice = product.oldPrice > 0 ? product.oldPrice : (product.salePrice > 0 ? product.price : 0);
  const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const isWishlisted = isInWishlist(product._id || product.id);

  // Check if product is new (created in last 30 days or tagged new)
  const isNew = product.tags?.includes('new') || (product.createdAt && new Date() - new Date(product.createdAt) < 30 * 24 * 60 * 60 * 1000);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      addToast('Sản phẩm tạm hết hàng!', 'warning');
      return;
    }
    // Nếu sản phẩm có variants, chuyển đến trang chi tiết để chọn màu/dung lượng
    if (product.variants && product.variants.length > 0) {
      navigate(`/product/${product._id || product.id}`);
      return;
    }
    const defaultStorage = '128GB';
    const defaultColor = 'Mặc định';
    const res = await addToCart(product._id || product.id, 1, defaultStorage, defaultColor);
    if (res?.success !== false) {
      addToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
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
    if (isInCompare(product._id || product.id)) {
      removeFromCompare(product._id || product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <Link
      to={`/product/${product._id || product.id}`}
      className="group flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 relative"
    >
      {/* Badges góc trên trái */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discountPercent > 0 && (
          <span className="bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 animate-pulse">
            <Zap size={12} className="fill-white" /> -{discountPercent}%
          </span>
        )}
        {isNew && (
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
            <Sparkles size={12} /> NEW
          </span>
        )}
        {!isNew && product.isFeatured && (
          <span className="bg-amber-500 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-xl shadow-md">
            HOT
          </span>
        )}
      </div>

      {/* Wishlist button góc trên phải */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
          isWishlisted
            ? 'bg-red-50 dark:bg-red-900/40 text-red-500 scale-110 shadow-md'
            : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-400 hover:text-red-500 hover:scale-110 shadow-sm'
        }`}
        title="Yêu thích"
      >
        <Heart size={18} className={isWishlisted ? 'fill-red-500' : ''} />
      </button>

      {/* Compare button */}
      <button
        type="button"
        onClick={handleToggleCompare}
        className={`absolute top-14 right-3 z-10 w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
          isInCompare(product._id || product.id)
            ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-500 scale-110 shadow-md'
            : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-400 hover:text-blue-500 hover:scale-110 shadow-sm opacity-0 group-hover:opacity-100'
        }`}
        title={isInCompare(product._id || product.id) ? "Bỏ so sánh" : "Thêm vào so sánh"}
      >
        <Scale size={18} className={isInCompare(product._id || product.id) ? 'stroke-[2.5]' : ''} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50/50 dark:bg-gray-700/20 p-6 flex items-center justify-center">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400?text=Phone'}
          alt={product.name}
          className="w-full h-full object-contain object-center group-hover:scale-110 transition-transform duration-500"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 font-black text-xs px-4 py-2 rounded-2xl uppercase tracking-wider shadow-2xl">
              Tạm hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-primary uppercase tracking-wider truncate mb-1">
            {product.brand || 'Điện thoại'}
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Rating & Sold */}
          <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <RatingStars rating={product.rating || 5} size={14} />
              <span className="font-bold text-gray-700 dark:text-gray-300">({product.rating || 5.0})</span>
            </div>
            <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-[11px]">
              Đã bán {product.sold > 1000 ? `${(product.sold / 1000).toFixed(1)}k` : (product.sold || 12)}
            </span>
          </div>

          {/* Price & Action Button */}
          <div className="flex items-end justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col">
              <span className="font-black text-lg text-red-600 dark:text-red-400 leading-none">
                {formatPrice(price)}
              </span>
              {oldPrice > price && (
                <span className="text-xs text-gray-400 line-through mt-1">
                  {formatPrice(oldPrice)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="px-3.5 py-2.5 rounded-2xl bg-primary hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart size={16} className="group-hover/btn:scale-110 transition-transform" />
              <span className="hidden sm:inline">Chọn mua</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
