import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  vi: {
    home: 'Trang chủ',
    shop: 'Sản phẩm',
    categories: 'Danh mục',
    brands: 'Thương hiệu',
    cart: 'Giỏ hàng',
    wishlist: 'Yêu thích',
    orders: 'Đơn hàng',
    profile: 'Tài khoản',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    logout: 'Đăng xuất',
    search_placeholder: 'Tìm kiếm sản phẩm, thương hiệu...',
    hot_keywords: 'Từ khóa hot:',
    flash_sale: 'Flash Sale Giá Sốc',
    new_products: 'Sản phẩm mới ra mắt',
    best_selling: 'Sản phẩm bán chạy nhất',
    recommended: 'Gợi ý dành riêng cho bạn',
    recently_viewed: 'Sản phẩm vừa xem',
    add_to_cart: 'Thêm vào giỏ',
    buy_now: 'Mua ngay',
    compare: 'So sánh',
    contact_support: 'Hỗ trợ trực tuyến'
  },
  en: {
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    brands: 'Brands',
    cart: 'Cart',
    wishlist: 'Wishlist',
    orders: 'Orders',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    search_placeholder: 'Search for products, brands...',
    hot_keywords: 'Hot keywords:',
    flash_sale: 'Flash Sale Deals',
    new_products: 'New Arrivals',
    best_selling: 'Best Sellers',
    recommended: 'Recommended For You',
    recently_viewed: 'Recently Viewed',
    add_to_cart: 'Add to Cart',
    buy_now: 'Buy Now',
    compare: 'Compare',
    contact_support: 'Live Support'
  }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'vi';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'vi' ? 'en' : 'vi'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
