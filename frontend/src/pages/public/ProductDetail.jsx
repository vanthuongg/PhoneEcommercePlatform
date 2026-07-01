import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import ProductGallery from '../../components/product/ProductGallery';
import ProductReviews from '../../components/product/ProductReviews';
import Recommendations from '../../components/product/Recommendations';
import { useCompare } from '../../contexts/CompareContext';
import { saveRecentlyViewed } from '../../components/product/RecentlyViewed';
import RatingStars from '../../components/ui/RatingStars';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { Star, ShoppingCart, Minus, Plus, ArrowLeft, Package, CheckCircle, Shield, Truck, Heart, Zap, Scale, Smartphone, Cpu, HardDrive, Battery, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Thao tác chọn phân loại (màu / dung lượng)
  const [selectedColor, setSelectedColor] = useState('Titan tự nhiên');
  const [selectedStorage, setSelectedStorage] = useState('256GB');

  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isCustomer = true;

  const defaultColors = ['Titan tự nhiên', 'Đen sa mạc', 'Trắng ngọc trai', 'Xanh đại dương'];
  const defaultStorages = ['128GB', '256GB', '512GB', '1TB'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const prodRes = await productAPI.getById(id);
        const prodData = prodRes.data;
        
        setProduct(prodData);
        saveRecentlyViewed(prodData);

        // Set initial variants if present
        if (prodData?.colors?.length > 0) {
          // colors can be array of objects {name, images} or array of strings
          const firstColor = prodData.colors[0];
          setSelectedColor(typeof firstColor === 'object' ? firstColor.name : firstColor);
        } else {
          setSelectedColor('Titan tự nhiên');
        }

        if (prodData?.sizes?.length > 0) setSelectedStorage(prodData.sizes[0]);
        else if (prodData?.variants?.length > 0) {
          // variants have ram/storage fields, use storage
          const firstVariant = prodData.variants[0];
          setSelectedStorage(firstVariant.storage || firstVariant.name || '256GB');
        }
        else setSelectedStorage('256GB');
      } catch {
        toast.error('Không tìm thấy thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async (isBuyNow = false) => {
    const matchingVariant = product?.variants?.find(
      v => (v.storage === selectedStorage || v.name === selectedStorage) && v.color === selectedColor
    );
    const currentStock = matchingVariant ? matchingVariant.stock : (product.stock || 0);

    if (currentStock <= 0) {
      toast.error('Phiên bản này tạm hết hàng');
      return;
    }
    if (quantity > currentStock) {
      toast.error(`Chỉ còn ${currentStock} sản phẩm trong kho`);
      return;
    }

    await addToCart(product._id || product.id, quantity, selectedStorage, selectedColor);
    if (isBuyNow) {
      navigate('/cart');
    }
  };

  const handleToggleCompare = () => {
    if (!product) return;
    if (isInCompare(product._id || product.id)) {
      removeFromCompare(product._id || product.id);
    } else {
      addToCompare(product);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl max-w-md">
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sản phẩm không tồn tại hoặc đã ngừng kinh doanh</p>
          <Link to="/shop" className="px-6 py-3 bg-primary text-white rounded-2xl font-bold inline-flex items-center gap-2">
            <ArrowLeft size={18} /> Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const matchingVariant = product?.variants?.find(
    v => (v.storage === selectedStorage || v.name === selectedStorage) && v.color === selectedColor
  );
  
  const currentStock = matchingVariant ? matchingVariant.stock : (product.stock || 0);
  const currentPrice = matchingVariant ? matchingVariant.price : (product.price || 0);
  const hasDiscount = product.salePrice > 0 && product.salePrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const displayPrice = hasDiscount ? currentPrice * (1 - discountPercent / 100) : currentPrice;

  const isWishlisted = isInWishlist(product._id || product.id);

  // Fallback specs for phones if not explicitly in product object
  const specs = product.specs || {
    screen: '6.7 inch Super Retina XDR OLED, 120Hz',
    cpu: product.brand === 'Apple' ? 'Apple A17 Pro 6 nhân' : 'Snapdragon 8 Gen 3 8 nhân',
    ram: product.brand === 'Apple' ? '8 GB' : '12 GB',
    rom: selectedStorage,
    camera: 'Chính 48 MP & Phụ 12 MP, 12 MP (Zoom 5x)',
    battery: '4422 mAh, Sạc nhanh 30W'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trang chủ', link: '/' },
            { label: 'Cửa hàng', link: '/shop' },
            { label: product.brand || product.category?.name || 'Điện thoại', link: `/shop?brand=${encodeURIComponent(product.brand || '')}` },
            { label: product.name },
          ]}
        />

        {/* Main Product Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery (Left 5 cols) */}
          <div className="lg:col-span-5">
            <ProductGallery images={product.images || [product.image].filter(Boolean)} />
          </div>

          {/* Product Info (Right 7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1.5 rounded-full">
                  {product.brand || 'Điện thoại chính hãng'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleCompare}
                    className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold ${
                      isInCompare(product._id || product.id)
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40'
                    }`}
                    title={isInCompare(product._id || product.id) ? "Bỏ so sánh" : "Thêm vào so sánh"}
                  >
                    <Scale size={16} className={isInCompare(product._id || product.id) ? 'stroke-[2.5]' : ''} /> 
                    <span className="hidden sm:inline">
                      {isInCompare(product._id || product.id) ? 'Đã so sánh' : 'So sánh'}
                    </span>
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold ${
                      isWishlisted ? 'bg-red-50 text-red-500 dark:bg-red-900/40' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-red-500'
                    }`}
                  >
                    <Heart size={16} className={isWishlisted ? 'fill-red-500' : ''} />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* Ratings */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5 font-bold text-amber-500">
                  <RatingStars rating={product.rating || 5} size={16} />
                  <span className="text-gray-900 dark:text-white text-sm">({product.rating || 5.0})</span>
                </div>
                <span>|</span>
                <span><strong className="text-gray-900 dark:text-white">{product.numReviews || product.reviewCount || 0}</strong> Đánh giá</span>
                <span>|</span>
                <span>Đã bán <strong className="text-gray-900 dark:text-white">{product.sold || 48}</strong></span>
              </div>

              {/* Price Banner */}
              <div className="bg-primary/5 dark:bg-gray-800 rounded-2xl p-5 flex flex-wrap items-baseline gap-3 border border-primary/20">
                <span className="text-3xl sm:text-4xl font-black text-red-600 dark:text-red-400">
                  {formatPrice(displayPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      {formatPrice(currentPrice)}
                    </span>
                    <span className="bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow uppercase flex items-center gap-1 animate-pulse">
                      <Zap size={12} className="fill-white" /> Giảm {discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Options Selection */}
            <div className="space-y-5 pt-2">
              {/* Chọn Dung Lượng / ROM */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2.5">
                  Dung lượng lưu trữ: <span className="text-primary font-black">{selectedStorage}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {[...new Set(product.sizes?.length ? product.sizes :
                    product.variants?.length ? product.variants.map(v => v.storage || v.name).filter(Boolean) :
                    defaultStorages
                  )].map((storage, idx) => (
                    <button
                      key={`${storage}-${idx}`}
                      type="button"
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${
                        selectedStorage === storage
                          ? 'border-primary bg-primary/10 text-primary shadow-sm scale-105'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn Màu Sắc */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2.5">
                  Màu sắc phiên bản: <span className="text-primary font-black">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {[...new Set(product.colors?.length
                    ? product.colors.map(c => typeof c === 'object' ? c.name : c)
                    : defaultColors
                  )].map((colorName, idx) => (
                    <button
                      key={`${colorName}-${idx}`}
                      type="button"
                      onClick={() => setSelectedColor(colorName)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all flex items-center gap-2 ${
                        selectedColor === colorName
                          ? 'border-primary bg-primary/10 text-primary shadow-sm scale-105'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: colorName.includes('Đen') ? '#1e293b' : colorName.includes('Trắng') ? '#f8fafc' : colorName.includes('Xanh') ? '#0284c7' : colorName.includes('Tím') ? '#7c3aed' : colorName.includes('Titan') ? '#94a3b8' : colorName.includes('Vàng') ? '#f59e0b' : '#94a3b8' }} />
                      {colorName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity & Stock */}
            <div className="space-y-4 pt-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Số lượng mua:</span>
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-extrabold text-sm text-gray-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock || 99, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {currentStock > 0 ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={14} /> Có sẵn {currentStock} máy
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-500">Tạm hết hàng</span>
                )}
              </div>

              {/* Action Buttons */}
              {isCustomer && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(false)}
                    disabled={currentStock <= 0}
                    className="w-full py-4 px-6 rounded-2xl font-black text-sm border-2 border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <ShoppingCart size={18} /> Thêm Vào Giỏ Hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(true)}
                    disabled={currentStock <= 0}
                    className="w-full py-4 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Zap size={18} className="fill-white" /> Mua Ngay
                  </button>
                </div>
              )}
            </div>

            {/* Features Guarantee */}
            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
              <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60">
                <Shield className="w-5 h-5 text-primary mb-1" />
                <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">100% Chính hãng</span>
                <span className="text-[10px] text-gray-400">Bảo hành 24 tháng</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60">
                <Truck className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">Giao nhanh 2H</span>
                <span className="text-[10px] text-gray-400">Miễn phí toàn quốc</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60">
                <Package className="w-5 h-5 text-amber-600 mb-1" />
                <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">Lỗi 1 đổi 1</span>
                <span className="text-[10px] text-gray-400">Trong 30 ngày đầu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specs & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Specs Table (Left 5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm h-fit space-y-5">
            <h2 className="text-lg font-black text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" /> Thông Số Kỹ Thuật
            </h2>
            <div className="space-y-3.5 text-xs divide-y divide-gray-100 dark:divide-gray-800">
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-gray-500 flex items-center gap-2"><Smartphone size={15}/> Màn hình</span>
                <span className="font-bold text-gray-900 dark:text-white text-right max-w-[60%]">{specs.screen || '6.7 inch Super Retina XDR OLED'}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-gray-500 flex items-center gap-2"><Cpu size={15}/> Vi xử lý (CPU)</span>
                <span className="font-bold text-gray-900 dark:text-white text-right max-w-[60%]">{specs.cpu || 'Apple A17 Pro 6 nhân'}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-gray-500 flex items-center gap-2"><HardDrive size={15}/> RAM / Bộ nhớ</span>
                <span className="font-bold text-gray-900 dark:text-white text-right max-w-[60%]">{`${specs.ram || '8GB'} / ${selectedStorage}`}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-gray-500 flex items-center gap-2"><Camera size={15}/> Camera</span>
                <span className="font-bold text-gray-900 dark:text-white text-right max-w-[60%]">{specs.camera || '48MP + 12MP + 12MP'}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-gray-500 flex items-center gap-2"><Battery size={15}/> Pin & Sạc</span>
                <span className="font-bold text-gray-900 dark:text-white text-right max-w-[60%]">{specs.battery || '4422 mAh, sạc nhanh 30W'}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-gray-500">Thương hiệu</span>
                <span className="font-bold text-primary">{product.brand || 'TechPhone Authentic'}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-gray-500">Tình trạng máy</span>
                <span className="font-bold text-emerald-600">Mới 100%, Nguyên seal</span>
              </div>
            </div>
          </div>

          {/* Description (Right 7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
              📝 Đặc Điểm Nổi Bật & Mô Tả Sản Phẩm
            </h2>
            <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line font-normal space-y-4">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <>
                  <p><strong>{product.name}</strong> mang đến bước đột phá mạnh mẽ về hiệu năng với công nghệ vi xử lý thế hệ mới, đáp ứng hoàn hảo mọi nhu cầu làm việc đa nhiệm, chụp ảnh chuyên nghiệp và giải trí đỉnh cao.</p>
                  <p>Thiết kế khung viền hợp kim siêu bền bỉ kết hợp mặt kính cường lực chống trầy xước chuẩn quân đội, mang lại cảm giác cầm nắm sang trọng và chắc chắn.</p>
                  <p>Hệ thống camera tiên tiến hỗ trợ chụp ảnh đêm mượt mà, khả năng zoom quang học sắc nét cùng quay video chuẩn 4K HDR cho trải nghiệm hình ảnh chân thực từng chi tiết.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
            ⭐ Đánh Giá & Nhận Xét Khách Hàng
          </h2>
          <ProductReviews productId={product._id || product.id} />
        </div>

        {/* Recommendations */}
        <Recommendations currentProductId={product._id || product.id} categoryId={product.category?._id || product.category} />
      </div>
    </div>
  );
};

export default ProductDetail;
