import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (exists) {
        toast.success('Đã xóa khỏi danh sách yêu thích');
        return prev.filter((item) => item._id !== product._id);
      } else {
        toast.success('Đã thêm vào danh sách yêu thích');
        return [...prev, { ...product, addedAt: new Date().toISOString() }];
      }
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((item) => item._id !== productId));
    toast.success('Đã xóa khỏi danh sách yêu thích');
  }, []);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some((item) => item._id === productId);
  }, [wishlist]);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistCount, toggleWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
