import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();

export const useCompare = () => {
  return useContext(CompareContext);
};

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('compareList');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing compare list from local storage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('compareList', JSON.stringify(compareList));
    } catch (error) {
      console.error('Error saving compare list to local storage:', error);
    }
  }, [compareList]);

  const addToCompare = (product) => {
    if (compareList.length >= 3) {
      toast.error('Bạn chỉ có thể so sánh tối đa 3 sản phẩm!');
      return false;
    }
    
    // Check if already in list
    const isExist = compareList.find(item => (item._id || item.id) === (product._id || product.id));
    if (isExist) {
      toast.error('Sản phẩm này đã có trong danh sách so sánh!');
      return false;
    }

    setCompareList([...compareList, product]);
    toast.success('Đã thêm vào danh sách so sánh!');
    return true;
  };

  const removeFromCompare = (productId) => {
    setCompareList(compareList.filter(item => (item._id || item.id) !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (productId) => {
    return compareList.some(item => (item._id || item.id) === productId);
  };

  const value = {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};
