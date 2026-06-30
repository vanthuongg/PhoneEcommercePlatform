import React, { useState } from 'react';
import { useCompare } from '../../contexts/CompareContext';
import { X, Scale, ChevronUp, ChevronDown } from 'lucide-react';
import CompareModal from './CompareModal';
import ProductSearchModal from './ProductSearchModal';

const CompareBar = () => {
  const { compareList, removeFromCompare, clearCompare, isSearchOpen, setIsSearchOpen } = useCompare();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {compareList.length > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}`}>
        <div className="container mx-auto max-w-5xl px-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header / Toggle */}
            <div 
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center gap-2">
                <Scale size={20} className="text-primary" />
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  So sánh sản phẩm ({compareList.length}/3)
                </span>
              </div>
              <div className="flex items-center gap-4">
                {isExpanded && compareList.length > 0 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearCompare();
                    }}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Xóa tất cả
                  </button>
                )}
                {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 flex gap-4 w-full overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                {[0, 1, 2].map((index) => {
                  const product = compareList[index];
                  return (
                    <div 
                      key={index} 
                      className="flex-1 min-w-[150px] max-w-[200px] h-24 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center relative bg-gray-50 dark:bg-gray-800/50 group"
                    >
                      {product ? (
                        <>
                          <button
                            onClick={() => removeFromCompare(product._id || product.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110"
                          >
                            <X size={14} />
                          </button>
                          <div className="flex items-center gap-2 p-2 w-full h-full">
                            <img 
                              src={product.images?.[0] || 'https://via.placeholder.com/150'} 
                              alt={product.name} 
                              className="w-12 h-12 object-contain bg-white rounded-md"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">
                                {product.name}
                              </p>
                              <p className="text-[10px] text-primary font-bold mt-1">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.salePrice > 0 ? product.salePrice : product.price)}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                          onClick={() => setIsSearchOpen(true)}
                        >
                          <span className="text-gray-400 text-sm flex items-center gap-2"><span className="text-lg">+</span> Thêm sản phẩm</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="w-full md:w-auto flex justify-end shrink-0">
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={compareList.length < 2}
                  className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Scale size={18} />
                  So sánh ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      <CompareModal  
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <ProductSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default CompareBar;
