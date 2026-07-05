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
  const [addedSuccess, setAddedSuccess] = useState(false);

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
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const fetchData = async () => {
      try {
        setLoading(true);
        const prodRes = await productAPI.getById(id);
        const prodData = prodRes.data;
        
        setProduct(prodData);
        saveRecentlyViewed(prodData);

        // Set initial variants if present
        if (prodData?.colors?.length > 0) {
          const firstColor = prodData.colors[0];
          setSelectedColor(typeof firstColor === 'object' ? firstColor.name : firstColor);
        } else {
          setSelectedColor('Titan tự nhiên');
        }

        if (prodData?.sizes?.length > 0) setSelectedStorage(prodData.sizes[0]);
        else if (prodData?.variants?.length > 0) {
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

  const handleAddToCart = async (arg1, arg2) => {
    let e = null;
    let isBuyNow = false;
    if (typeof arg1 === 'boolean') {
      isBuyNow = arg1;
    } else if (arg1 && typeof arg1 === 'object') {
      e = arg1;
      isBuyNow = Boolean(arg2);
    }
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const matchingVariant = product?.variants?.find(
      v => (v.storage === selectedStorage || v.name === selectedStorage) && v.color === selectedColor
    );
    const currentStock = matchingVariant ? matchingVariant.stock : (product.stock || 0);
    const currentPrice = matchingVariant ? matchingVariant.price : (product.salePrice > 0 ? product.salePrice : product.price);

    if (currentStock <= 0) {
      toast.error('Phiên bản này tạm hết hàng');
      return;
    }
    if (quantity > currentStock) {
      toast.error(`Chỉ còn ${currentStock} sản phẩm trong kho`);
      return;
    }

    const startX = e?.clientX || window.innerWidth / 2;
    const startY = e?.clientY || window.innerHeight / 2;

    await addToCart(product._id || product.id, quantity, selectedStorage, selectedColor, {
      name: product.name,
      image: product.images?.[0],
      price: currentPrice,
      startX,
      startY,
      skipEffect: isBuyNow,
      skipToast: isBuyNow
    });

    if (isBuyNow) {
      navigate('/cart');
    } else {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1800);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm max-w-md border border-slate-200 dark:border-slate-800">
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Sản phẩm không tồn tại hoặc đã ngừng kinh doanh</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Quay lại cửa hàng
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
    screen: '6.7 inch Super Retina XDR OLED, 120Hz ProMotion',
    cpu: product.brand === 'Apple' ? 'Apple A18 Pro 6 nhân thế hệ mới' : 'Snapdragon 8 Gen 4 8 nhân tiến trình 3nm',
    ram: product.brand === 'Apple' ? '8 GB' : '12 GB LPDDR5X',
    rom: selectedStorage,
    camera: 'Chính 48 MP & Ultra Wide 48 MP, Telephoto 12 MP (5x Optical Zoom)',
    battery: '4685 mAh, Sạc nhanh MagSafe & SuperFast 45W'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery (Left 5 cols) */}
          <div className="lg:col-span-5">
            <ProductGallery images={product.images || [product.image].filter(Boolean)} />
          </div>

          {/* Product Info (Right 7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full border border-primary-500/20">
                  {product.brand || 'Điện thoại chính hãng'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleCompare}
                    className={`p-2 px-3 rounded-full transition-all flex items-center gap-1.5 text-xs font-semibold border ${
                      isInCompare(product._id || product.id)
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-500'
                    }`}
                    title={isInCompare(product._id || product.id) ? "Bỏ so sánh" : "Thêm vào so sánh"}
                  >
                    <Scale size={15} /> 
                    <span className="hidden sm:inline">
                      {isInCompare(product._id || product.id) ? 'Đã so sánh' : 'So sánh'}
                    </span>
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-2.5 rounded-full transition-all flex items-center gap-1.5 text-xs font-semibold border ${
                      isWishlisted
                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Heart size={15} className={isWishlisted ? 'fill-white' : ''} />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-white leading-tight font-display tracking-tight">
                {product.name}
              </h1>

              {/* Ratings */}
              <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1 font-semibold text-amber-500">
                  <RatingStars rating={product.rating || 5} size={15} />
                  <span className="text-slate-900 dark:text-white text-sm">({product.rating || 5.0})</span>
                </div>
                <span>•</span>
                <span><strong className="text-slate-900 dark:text-white font-semibold">{product.numReviews || product.reviewCount || 0}</strong> Đánh giá</span>
                <span>•</span>
                <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-semibold">Đã bán <strong className="font-semibold">{product.sold || 48}</strong></span>
              </div>

              {/* Price Banner */}
              <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-5 flex flex-wrap items-baseline gap-4 border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-2xl sm:text-3xl font-mono font-semibold text-accent-600 dark:text-accent-500 leading-none">
                  {formatPrice(displayPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm font-mono text-slate-400 line-through">
                      {formatPrice(currentPrice)}
                    </span>
                    <span className="bg-red-600 text-white font-semibold text-[10px] px-2.5 py-0.5 rounded-lg shadow-sm uppercase flex items-center gap-1">
                      <Zap size={12} className="fill-white" /> Giảm {discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Options Selection */}
            <div className="space-y-5 pt-1">
              {/* Chọn Dung Lượng / ROM */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">
                  Dung lượng lưu trữ: <span className="text-primary-600 dark:text-primary-400 font-semibold font-mono">{selectedStorage}</span>
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
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 font-mono ${
                        selectedStorage === storage
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-450'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn Màu Sắc */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">
                  Màu sắc phiên bản: <span className="text-primary-600 dark:text-primary-400 font-semibold">{selectedColor}</span>
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
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-2 ${
                        selectedColor === colorName
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-450'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
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
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Số lượng mua:</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/80 overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-semibold text-sm text-slate-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock || 99, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {currentStock > 0 ? (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                    <CheckCircle size={14} /> Có sẵn {currentStock} máy
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-lg">Tạm hết hàng</span>
                )}
              </div>

              {/* Action Buttons */}
              {isCustomer && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, false)}
                    disabled={currentStock <= 0}
                    className={`w-full py-3 px-6 rounded-full font-semibold text-sm border transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 ${
                      addedSuccess
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 hover:bg-primary-600 hover:text-white'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <CheckCircle size={16} /> Đã thêm vào giỏ
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} /> Thêm Vào Giỏ Hàng
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, true)}
                    disabled={currentStock <= 0}
                    className="w-full py-3 px-6 rounded-full font-semibold text-sm bg-accent-600 hover:bg-accent-700 text-white transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    <Zap size={16} className="fill-white" /> Mua Ngay
                  </button>
                </div>
              )}
            </div>

            {/* Features Guarantee */}
            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
                <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400 mb-1" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">100% Chính hãng</span>
                <span className="text-[10px] text-slate-400">Bảo hành 24 tháng</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
                <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Giao nhanh 2H</span>
                <span className="text-[10px] text-slate-400">Miễn phí toàn quốc</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
                <Package className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Lỗi 1 đổi 1</span>
                <span className="text-[10px] text-slate-400">Trong 30 ngày đầu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specs & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Specs Table (Left 5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-sm h-fit space-y-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5 font-display">
              <Smartphone className="w-5 h-5" /> Thông Số Kỹ Thuật
            </h2>
            <div className="space-y-3.5 text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-slate-550 flex items-center gap-2"><Smartphone size={14} className="text-slate-400"/> Màn hình</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[60%]">{specs.screen || '6.7 inch Super Retina XDR OLED'}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-slate-550 flex items-center gap-2"><Cpu size={14} className="text-slate-400"/> Vi xử lý (CPU)</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[60%]">{specs.cpu || 'Apple A18 Pro 6 nhân'}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-slate-550 flex items-center gap-2"><HardDrive size={14} className="text-slate-400"/> RAM / Bộ nhớ</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white text-right max-w-[60%]">{`${specs.ram || '8GB'} / ${selectedStorage}`}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-slate-550 flex items-center gap-2"><Camera size={14} className="text-slate-400"/> Camera</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[60%]">{specs.camera || '48MP + 48MP + 12MP'}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-slate-550 flex items-center gap-2"><Battery size={14} className="text-slate-400"/> Pin & Sạc</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[60%]">{specs.battery || '4685 mAh, sạc siêu nhanh'}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-slate-500">Thương hiệu</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">{product.brand || 'TechPhone Authentic'}</span>
              </div>
              <div className="flex justify-between pt-2.5 items-center">
                <span className="font-semibold text-slate-500">Tình trạng máy</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Mới 100%, Nguyên seal</span>
              </div>
            </div>
          </div>

          {/* Description (Right 7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-3.5 border-b border-slate-100 dark:border-slate-800 font-display">
              📝 Đặc Điểm Nổi Bật & Mô Tả Chi Tiết
            </h2>
            <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal space-y-4">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <>
                  <p><strong>{product.name}</strong> mang đến bước đột phá vượt bậc về hiệu năng đỉnh cao với công nghệ vi xử lý AI thế hệ mới, đáp ứng trọn vẹn mọi nhu cầu làm việc đa nhiệm chuyên sâu, nhiếp ảnh nghệ thuật và trải nghiệm giải trí sống động.</p>
                  <p>Thiết kế khung viền Titan chế tác tinh xảo kết hợp mặt kính Ceramic Shield chuẩn quân đội, vừa mang lại sự đẳng cấp sang trọng tuyệt đối vừa tối ưu khả năng chịu va đập bền bỉ theo thời gian.</p>
                  <p>Hệ thống camera Master Photography đột phá hỗ trợ quay phim chuẩn 4K HDR Dolby Vision, khả năng zoom quang học siêu nét và khả năng thu sáng ban đêm vượt trội.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 font-display tracking-tight">
            ⭐ Đánh Giá & Nhận Xét Từ Khách Hàng
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
