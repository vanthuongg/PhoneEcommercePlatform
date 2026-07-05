import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { productAPI } from '../../services/api';
import CategoryMenu from './CategoryMenu';
import {
  Search, ShoppingCart, Heart, Bell, User, LogOut, Sun, Moon,
  Globe, Clock, TrendingUp, ChevronDown, Package, Shield, Settings, Menu, Smartphone
} from 'lucide-react';

const hotKeywords = ['iPhone 16 Pro Max', 'Samsung Galaxy S26 Ultra', 'Xiaomi 16 Pro', 'Oppo Find X8 Pro', 'Google Pixel 9 Pro', 'Realme GT 7 Pro'];

const Navbar = ({ onOpenMobileMenu }) => {
  const { user, logout, isAuthenticated, isAdmin, isManager, isStaff } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : ['iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra'];
  });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    productAPI.getAll({ isFeatured: true, limit: 4 }).then((res) => {
      setFeaturedProducts(res.data || []);
    }).catch(() => {});
  }, []);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Gợi ý tìm kiếm tự động
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timer = setTimeout(() => {
        productAPI.getAll({ search: searchQuery, limit: 5 }).then((res) => {
          setSuggestions(res.data || []);
        }).catch(() => {});
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e, kw) => {
    if (e) e.preventDefault();
    const query = kw || searchQuery;
    if (!query.trim()) return;

    // Lưu lịch sử
    const newHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(0, 8);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    setShowSearchDropdown(false);
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  const removeHistoryItem = (e, item) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter((h) => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200/40 dark:border-slate-800/40 transition-all duration-300">
      {/* Top bar mini */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-300 text-xs py-2 px-4 hidden sm:block border-b border-slate-800/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-medium relative z-10">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              <span>Hệ thống Bán lẻ Điện thoại & Phụ kiện chính hãng cao cấp</span>
            </span>
            <span className="opacity-30">|</span>
            <span className="text-slate-400 tracking-wide">Hotline: 1800 6688 (Miễn phí 24/7)</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 text-[11px] font-semibold active:scale-98">
              {theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-400" />}
              <span>{theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 sm:gap-6">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white transition-all duration-300">
              <Smartphone className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white transition-all duration-300">
                TechPhone
              </span>
              <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-[0.2em] -mt-1 transition-all duration-300">
                Store
              </span>
            </div>
          </Link>
        </div>

        {/* Thanh tìm kiếm trung tâm lớn */}
        <div className="flex-1 max-w-2xl mx-auto relative" ref={searchRef}>
          <form onSubmit={(e) => handleSearchSubmit(e)} className="relative flex items-center group">
            <div className="absolute -inset-0.5 bg-primary-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder={t('search_placeholder') || 'Tìm kiếm điện thoại, phụ kiện chính hãng...'}
              className="relative w-full pl-5 pr-14 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-primary-500/60 rounded-xl text-sm font-medium focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center active:scale-98 z-10"
            >
              <Search size={16} />
            </button>
          </form>

          {/* Dropdown Gợi ý & Sản phẩm nổi bật */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-13 bg-white dark:bg-slate-900 rounded-2xl shadow-premium dark:shadow-premium-dark border border-slate-200/60 dark:border-slate-800/60 overflow-hidden z-50 animate-fade-in">
              {/* Gợi ý sản phẩm khi gõ */}
              {suggestions.length > 0 ? (
                <div className="p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3 flex items-center gap-1.5">
                    <TrendingUp size={15} className="text-primary-500" /> Kết quả tìm kiếm cho "{searchQuery}"
                  </div>
                  <div className="space-y-1.5">
                    {suggestions.map((prod) => (
                      <div
                        key={prod._id || prod.id}
                        onClick={() => { setShowSearchDropdown(false); navigate(`/product/${prod._id || prod.id}`); }}
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl cursor-pointer transition-all group border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
                      >
                        <img src={prod.images?.[0] || 'https://via.placeholder.com/40'} alt={prod.name} className="w-12 h-12 object-contain rounded-xl bg-slate-50 dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700 transition-transform" />
                        <div className="flex-1 truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{prod.name}</span>
                            {prod.brand && <span className="px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 text-[10px] font-semibold">{prod.brand}</span>}
                          </div>
                          <div className="text-xs font-mono font-semibold text-accent-600 dark:text-accent-400 mt-0.5">
                            {formatPrice(prod.salePrice > 0 ? prod.salePrice : prod.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Lịch sử tìm kiếm */}
                  {searchHistory.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-3 mb-2.5">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock size={15} className="text-amber-500" /> Tìm kiếm gần đây
                        </span>
                        <button
                          type="button"
                          onClick={() => { setSearchHistory([]); localStorage.removeItem('searchHistory'); }}
                          className="text-xs text-slate-400 hover:text-red-500 font-semibold transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 px-3">
                        {searchHistory.map((item, i) => (
                          <div
                            key={i}
                            onClick={() => handleSearchSubmit(null, item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary-55 hover:text-primary-600 dark:hover:bg-primary-900/20 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition-all group border border-slate-200/50 dark:border-slate-700/50"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={(e) => removeHistoryItem(e, item)}
                              className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sản phẩm nổi bật khi nhấn vào ô tìm kiếm */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3 flex items-center gap-1.5">
                      Sản phẩm nổi bật & Mới nhất
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {featuredProducts.map((prod) => (
                        <div
                          key={prod._id || prod.id}
                          onClick={() => { setShowSearchDropdown(false); navigate(`/product/${prod._id || prod.id}`); }}
                          className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl cursor-pointer transition-all group border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
                        >
                          <img src={prod.images?.[0] || 'https://via.placeholder.com/40'} alt={prod.name} className="w-12 h-12 object-contain rounded-xl bg-slate-50 dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700 transition-transform" />
                          <div className="flex-1 truncate">
                            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{prod.name}</div>
                            <div className="text-xs font-mono font-semibold text-accent-600 dark:text-accent-400 mt-0.5">
                              {formatPrice(prod.salePrice > 0 ? prod.salePrice : prod.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action icons (Wishlist, Notifications, Cart, User) */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="p-2.5 text-slate-700 dark:text-slate-200 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-all"
            title={t('wishlist')}
          >
            <Heart size={20} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white font-semibold text-[9px] rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowUserDropdown(false); }}
              className="p-2.5 text-slate-700 dark:text-slate-200 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-all"
              title="Thông báo"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary-600 text-white font-semibold text-[9px] rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-3.5 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-premium dark:shadow-premium-dark border border-slate-200/60 dark:border-slate-800/60 overflow-hidden z-50 animate-fade-in">
                <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">Thông báo mới</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:underline font-semibold">
                      Đọc tất cả
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id || n._id}
                        onClick={() => { markAsRead(n.id || n._id); setShowNotifDropdown(false); if (n.link) navigate(n.link); }}
                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time || 'Vừa xong'}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-slate-400">Không có thông báo nào</div>
                  )}
                </div>
                <div className="p-3 text-center bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50">
                  <Link
                    to="/profile?tab=notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-xs font-semibold text-primary-600 hover:underline"
                  >
                    Xem tất cả thông báo
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            id="cart-nav-btn"
            to="/cart"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full relative transition-all duration-200 flex items-center gap-2 font-semibold text-xs border border-transparent shadow-xs group"
          >
            <div className="relative">
              <ShoppingCart size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 w-4 h-4 bg-accent-600 text-white font-mono font-semibold text-[9px] rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">{t('cart')}</span>
          </Link>

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifDropdown(false); }}
                className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1F5A62&color=fff`}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-250 dark:border-slate-700"
                />
                <span className="hidden md:inline text-sm font-semibold text-slate-900 dark:text-slate-100 max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} className="text-slate-400 hidden md:block" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-3.5 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-premium dark:shadow-premium-dark border border-slate-200/60 dark:border-slate-800/60 py-2.5 z-50 animate-fade-in">
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/50 mb-2">
                    <p className="text-xs text-slate-400 font-medium">{lang === 'vi' ? 'Xin chào,' : 'Hello,'}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-full text-[9px] font-semibold uppercase tracking-wider">
                      {user?.role === 'customer' ? 'Khách hàng' : user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
                    </span>
                  </div>

                  {(isAdmin || isManager || isStaff) && (
                    <Link
                      to={`/${user.role}`}
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                    >
                      <Shield size={18} /> {lang === 'vi' ? `Trang quản trị (${user.role})` : `Dashboard (${user.role})`}
                    </Link>
                  )}

                  <Link
                    to="/profile?tab=info"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User size={18} /> {t('profile')}
                  </Link>

                  {user?.role === 'customer' && (
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Package size={18} /> {t('orders')}
                    </Link>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800/50 mt-2 pt-2">
                    <button
                      onClick={() => { setShowUserDropdown(false); logout(navigate); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut size={18} /> {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 font-semibold text-xs text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all shadow-xs">
                {t('login')}
              </Link>
              <Link to="/register" className="btn-primary text-xs hidden sm:flex">
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Category bar */}
      <CategoryMenu />
    </header>
  );
};

export default Navbar;
