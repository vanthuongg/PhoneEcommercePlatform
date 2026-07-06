import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import { useAuth } from '../../contexts/AuthContext';
import RatingStars from '../ui/RatingStars';
import { Heart, ShoppingCart, Zap, Sparkles, Scale, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { user } = useAuth();
  const isCustomerOrGuest = !user || user.role === 'customer';
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
      className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden transition-all duration-250 hover:shadow-premium hover:-translate-y-1 hover:border-primary-500/30 dark:hover:border-primary-500/30 relative z-10"
    >
      {/* Badges góc trên trái */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 items-start">
        {discountPercent > 0 && (
          <span className="bg-red-600 text-white font-semibold text-[9px] px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider flex items-center gap-1">
            <Zap size={10} className="fill-white" /> -{discountPercent}%
          </span>
        )}
        {isNew && (
          <span className="bg-primary-600 text-white font-semibold text-[9px] px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={10} /> Mới
          </span>
        )}
        {!isNew && product.isFeatured && (
          <span className="bg-accent-600 text-white font-semibold text-[9px] px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
            Nổi bật
          </span>
        )}
      </div>

      {/* Action floating bar bên phải */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        {isCustomerOrGuest && (
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-250 ${
              isWishlisted
                ? 'bg-red-500 text-white scale-105 shadow-sm'
                : 'bg-white/90 dark:bg-slate-850/90 backdrop-blur-md text-slate-400 hover:text-red-500 shadow-xs border border-slate-200/40 dark:border-slate-800/40'
            }`}
            title="Yêu thích"
          >
            <Heart size={15} className={isWishlisted ? 'fill-white' : ''} />
          </button>
        )}

        <button
          type="button"
          onClick={handleToggleCompare}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-250 ${
            isCompared
              ? 'bg-primary-600 text-white scale-105 shadow-sm'
              : 'bg-white/90 dark:bg-slate-850/90 backdrop-blur-md text-slate-400 hover:text-primary-600 shadow-xs border border-slate-200/40 dark:border-slate-800/40 opacity-0 group-hover:opacity-100'
          }`}
          title={isCompared ? "Bỏ so sánh" : "Thêm vào so sánh"}
        >
          {isCompared ? <Check size={15} className="stroke-[3]" /> : <Scale size={15} />}
        </button>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 p-6 flex items-center justify-center border-b border-slate-200/40 dark:border-slate-800/40">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400?text=Phone'}
          alt={product.name}
          className="w-full h-full object-contain object-center group-hover:scale-102 transition-all duration-500 drop-shadow-sm"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-[10px] px-4 py-2 rounded-lg uppercase tracking-wider border border-slate-200 dark:border-slate-700">
              Tạm hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-white dark:bg-slate-900 transition-colors">
        <div>
          <div className="text-[9px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-[0.15em] truncate mb-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary-500 inline-block" />
            {product.brand || 'Điện thoại'}
          </div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        <div className="mt-auto pt-2 space-y-3">
          {/* Rating & Sold */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-405">
            <div className="flex items-center gap-0.5">
              <RatingStars rating={product.rating || 5} size={11} />
              <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1">({product.rating || 5.0})</span>
            </div>
            <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-305 px-2 py-0.5 rounded">
              Đã bán {product.sold > 1000 ? `${(product.sold / 1000).toFixed(1)}k` : (product.sold || 12)}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between pt-2 border-t border-slate-150 dark:border-slate-800/40">
            <div className="flex flex-col">
              <span className="font-mono font-semibold text-base sm:text-lg text-accent-600 dark:text-accent-500 leading-none">
                {formatPrice(price)}
              </span>
              {oldPrice > price && (
                <span className="text-xs font-mono text-slate-400 line-through mt-1">
                  {formatPrice(oldPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          {isCustomerOrGuest ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-98 ${
                addedSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'btn-primary'
              }`}
              title="Thêm vào giỏ hàng"
            >
              {addedSuccess ? (
                <>
                  <Check size={14} />
                  <span>Đã thêm vào giỏ</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  <span>{product.variants && product.variants.length > 0 ? 'Chọn phiên bản' : 'Chọn mua'}</span>
                </>
              )}
            </button>
          ) : (
            <span
              className="w-full py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <span>Xem chi tiết</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
