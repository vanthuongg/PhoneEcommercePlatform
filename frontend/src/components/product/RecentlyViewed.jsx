import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productAPI } from '../../services/api';
import { Clock } from 'lucide-react';

export const saveRecentlyViewed = (product) => {
  if (!product?._id) return;
  try {
    const saved = localStorage.getItem('recentlyViewed');
    let list = saved ? JSON.parse(saved) : [];
    list = [product, ...list.filter((p) => p._id !== product._id)].slice(0, 8);
    localStorage.setItem('recentlyViewed', JSON.stringify(list));
  } catch (e) {}
};

const RecentlyViewed = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentlyViewed');
      if (saved) setProducts(JSON.parse(saved));
    } catch (e) {}
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
          <Clock size={18} />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Sản phẩm bạn vừa xem</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((prod) => (
          <ProductCard key={prod._id} product={prod} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
