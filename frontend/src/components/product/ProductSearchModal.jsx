import React, { useState, useEffect } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { productAPI } from '../../services/api';
import { useCompare } from '../../contexts/CompareContext';
import useDebounce from '../../hooks/useDebounce';

const ProductSearchModal = ({ isOpen, onClose }) => {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedKeyword = useDebounce(keyword, 500);
  const { compareList, addToCompare, isInCompare } = useCompare();

  useEffect(() => {
    if (!isOpen) {
      setKeyword('');
      setProducts([]);
    } else {
      fetchProducts('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts(debouncedKeyword);
    }
  }, [debouncedKeyword, isOpen]);

  const fetchProducts = async (searchQuery) => {
    try {
      setLoading(true);
      const res = await productAPI.getAll({ search: searchQuery, limit: 10 });
      setProducts(res.data?.products || res.data || []);
    } catch (error) {
      console.error('Error fetching products for search', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (product) => {
    if (addToCompare(product)) {
      if (compareList.length >= 2) {
        onClose(); // Close if we reached max after this add (3 items)
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thêm sản phẩm so sánh</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm tên điện thoại..."
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : products.length > 0 ? (
            products.map((product) => {
              const added = isInCompare(product._id || product.id);
              const price = product.salePrice > 0 ? product.salePrice : product.price;
              
              return (
                <div key={product._id || product.id} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 shrink-0">
                    <img src={product.images?.[0] || 'https://via.placeholder.com/100'} alt={product.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{product.name}</h3>
                    <p className="text-primary font-bold text-sm mt-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                    </p>
                  </div>
                  <button
                    onClick={() => !added && handleAdd(product)}
                    disabled={added || (!added && compareList.length >= 3)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      added 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {added ? 'Đã thêm' : 'Thêm'}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-500">
              Không tìm thấy sản phẩm nào phù hợp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSearchModal;
