import React from 'react';
import { useCompare } from '../../contexts/CompareContext';
import { X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductSearchModal from './ProductSearchModal';

const CompareModal = ({ isOpen, onClose }) => {
  const { compareList, removeFromCompare } = useCompare();
  const [searchOpen, setSearchOpen] = React.useState(false);

  if (!isOpen) return null;

  const formatPrice = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const getSpecValue = (product, specName) => {
    return product.specs?.[specName] || '-';
  };

  const specKeys = [
    { key: 'screen', label: 'Màn hình' },
    { key: 'cpu', label: 'CPU' },
    { key: 'ram', label: 'RAM' },
    { key: 'storage', label: 'Bộ nhớ trong' },
    { key: 'camera', label: 'Camera' },
    { key: 'battery', label: 'Pin & Sạc' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">So sánh sản phẩm</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="min-w-[800px]">
            {/* Top Row: Images and Basic Info */}
            <div className="flex mb-8">
              <div className="w-1/4 shrink-0 pr-4 flex flex-col justify-end pb-4">
                <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">
                  Thông tin cơ bản
                </h3>
              </div>
              {compareList.map((product) => (
                <div key={product._id || product.id} className="w-1/4 px-4 relative group">
                  <button
                    onClick={() => removeFromCompare(product._id || product.id)}
                    className="absolute top-0 right-4 p-1.5 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-full transition-colors z-10"
                    title="Xóa khỏi so sánh"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-40 w-full mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                      <img 
                        src={product.images?.[0] || 'https://via.placeholder.com/200'} 
                        alt={product.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                    </div>
                    <Link 
                      to={`/product/${product._id || product.id}`}
                      onClick={onClose}
                      className="font-bold text-base text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-2 h-12 mb-2"
                    >
                      {product.name}
                    </Link>
                    <div className="text-lg font-black text-red-600 dark:text-red-400 mb-4">
                      {formatPrice(product.salePrice > 0 ? product.salePrice : product.price)}
                    </div>
                    <Link
                      to={`/product/${product._id || product.id}`}
                      onClick={onClose}
                      className="w-full py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl font-semibold transition-colors text-sm text-center block"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
              {/* Empty slots */}
              {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-1/4 px-4 cursor-pointer" onClick={() => setSearchOpen(true)}>
                  <div className="h-full min-h-[250px] border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-primary bg-gray-50/50 dark:bg-gray-800/50 hover:bg-primary/5 transition-colors group">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors">
                      <span className="text-2xl font-light">+</span>
                    </div>
                    <span className="text-sm font-medium">Thêm sản phẩm</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Specifications Table */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {/* Brand Row */}
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <td className="w-1/4 p-4 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">Thương hiệu</td>
                    {compareList.map((product) => (
                      <td key={product._id || product.id} className="w-1/4 p-4 text-gray-900 dark:text-gray-100 font-medium border-r border-gray-200 dark:border-gray-700 last:border-0">
                        {product.brand || '-'}
                      </td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                      <td key={`empty-brand-${i}`} className="w-1/4 p-4 border-r border-gray-200 dark:border-gray-700 last:border-0"></td>
                    ))}
                  </tr>
                  
                  {/* Rating Row */}
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="w-1/4 p-4 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">Đánh giá</td>
                    {compareList.map((product) => (
                      <td key={product._id || product.id} className="w-1/4 p-4 border-r border-gray-200 dark:border-gray-700 last:border-0">
                        <div className="flex items-center gap-1 text-gray-900 dark:text-gray-100 font-medium">
                          {product.rating || 5} ⭐ <span className="text-xs text-gray-500 font-normal">({product.numReviews || 0} đánh giá)</span>
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                      <td key={`empty-rating-${i}`} className="w-1/4 p-4 border-r border-gray-200 dark:border-gray-700 last:border-0"></td>
                    ))}
                  </tr>

                  {/* Dynamic Specs */}
                  {specKeys.map((spec, index) => (
                    <tr 
                      key={spec.key} 
                      className={`border-b border-gray-200 dark:border-gray-700 last:border-0 ${index % 2 !== 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`}
                    >
                      <td className="w-1/4 p-4 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                        {spec.label}
                      </td>
                      {compareList.map((product) => (
                        <td key={product._id || product.id} className="w-1/4 p-4 text-gray-900 dark:text-gray-100 text-sm leading-relaxed border-r border-gray-200 dark:border-gray-700 last:border-0">
                          {getSpecValue(product, spec.key)}
                        </td>
                      ))}
                      {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                        <td key={`empty-spec-${spec.key}-${i}`} className="w-1/4 p-4 border-r border-gray-200 dark:border-gray-700 last:border-0"></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ProductSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default CompareModal;
