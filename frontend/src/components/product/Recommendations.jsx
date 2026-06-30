import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productAPI } from '../../services/api';
import { Sparkles } from 'lucide-react';

const Recommendations = ({ currentProductId, categoryId }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const params = { limit: 4 };
    if (categoryId) params.category = categoryId;
    productAPI.getAll(params).then((res) => {
      const list = (res.data || []).filter((p) => p._id !== currentProductId);
      setProducts(list.slice(0, 4));
    }).catch(() => {});
  }, [currentProductId, categoryId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
          <Sparkles size={18} />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Gợi ý riêng cho bạn</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.map((prod) => (
          <ProductCard key={prod._id} product={prod} />
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
