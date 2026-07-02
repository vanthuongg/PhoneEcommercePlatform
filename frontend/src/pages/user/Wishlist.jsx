import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showConfirm } = useNotification();

  const handleMoveToCart = (e, product) => {
    const defaultStorage = product.variants?.[0]?.size || '128GB';
    const defaultColor = product.variants?.[0]?.color || 'Mặc định';
    const startX = e?.clientX || window.innerWidth / 2;
    const startY = e?.clientY || window.innerHeight / 2;
    addToCart(product._id || product.id, 1, defaultStorage, defaultColor, {
      name: product.name,
      image: product.images?.[0],
      price: product.salePrice > 0 ? product.salePrice : product.price,
      startX,
      startY
    });
    removeFromWishlist(product._id || product.id);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-500">
          <Heart className="w-8 h-8 fill-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Sản phẩm yêu thích</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sách các điện thoại bạn đã lưu lại để mua sau</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto my-12">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-gray-400 stroke-1" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Danh sách yêu thích đang trống</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Hãy khám phá các sản phẩm điện thoại mới nhất và nhấn nút trái tim để lưu lại những mẫu bạn yêu thích nhé!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center px-8 py-4 rounded-2xl bg-primary text-white font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30"
          >
            Khám phá sản phẩm ngay
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square bg-gray-50 dark:bg-gray-700/30 p-6 flex items-center justify-center overflow-hidden">
                  <Link to={`/product/${product._id || product.id}`}>
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/300?text=Phone'}
                      alt={product.name}
                      className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => {
                      showConfirm({
                        title: 'Xóa khỏi danh sách yêu thích?',
                        message: `Bạn có chắc chắn muốn xóa "${product.name}" khỏi danh sách yêu thích?`,
                        type: 'danger',
                        confirmText: 'Xóa ngay',
                        cancelText: 'Giữ lại',
                        onConfirm: () => removeFromWishlist(product._id || product.id)
                      });
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all shadow-sm"
                    title="Xóa khỏi yêu thích"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    {product.brand || 'Khác'}
                  </div>
                  <Link
                    to={`/product/${product._id || product.id}`}
                    className="font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-primary transition-colors text-lg"
                  >
                    {product.name}
                  </Link>

                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-xl font-extrabold text-red-600 dark:text-red-400">
                      {formatPrice(product.salePrice > 0 ? product.salePrice : product.price)}
                    </span>
                    {product.salePrice > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 mt-auto flex gap-2">
                <button
                  onClick={(e) => handleMoveToCart(e, product)}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 active:scale-95 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Chuyển sang giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
