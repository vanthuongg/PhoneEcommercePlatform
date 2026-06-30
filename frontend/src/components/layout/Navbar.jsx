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
    <header className="sticky top-0 z-40 glass-panel shadow-sm transition-colors">
      {/* Top bar mini */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">🔥 Hệ thống Bán lẻ Điện thoại & Phụ kiện chính hãng</span>
            <span className="opacity-60">|</span>
            <span>Hotline: 1800 6688 (Miễn phí)</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="flex items-center gap-1 hover:underline">
              {theme === 'dark' ? <Sun size={13} className="text-amber-300" /> : <Moon size={13} />}
              {theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={24} />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-all">
              <Smartphone className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-extrabold font-display tracking-tight bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent">
                TechPhone
              </span>
              <span className="block text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest -mt-1">
                Store
              </span>
            </div>
          </Link>
        </div>

        {/* Thanh tìm kiếm trung tâm lớn */}
        <div className="flex-1 max-w-2xl mx-auto relative" ref={searchRef}>
          <form onSubmit={(e) => handleSearchSubmit(e)} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder={t('search_placeholder')}
              className="w-full pl-5 pr-14 py-3 bg-slate-100/50 dark:bg-slate-800/80 border-2 border-transparent focus:border-primary-500 rounded-2xl text-sm focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl transition-all flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Dropdown Gợi ý & Sản phẩm nổi bật */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-14 bg-white dark:bg-slate-900 rounded-3xl shadow-glass dark:shadow-glass-dark border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Gợi ý sản phẩm khi gõ */}
              {suggestions.length > 0 ? (
                <div className="p-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3 flex items-center gap-1.5">
                    <TrendingUp size={15} className="text-primary" /> Kết quả tìm kiếm cho "{searchQuery}"
                  </div>
                  <div className="space-y-1.5">
                    {suggestions.map((prod) => (
                      <div
                        key={prod._id || prod.id}
                        onClick={() => { setShowSearchDropdown(false); navigate(`/product/${prod._id || prod.id}`); }}
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl cursor-pointer transition-all group"
                      >
                        <img src={prod.images?.[0] || 'https://via.placeholder.com/40'} alt={prod.name} className="w-12 h-12 object-contain rounded-xl bg-slate-50 dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform" />
                        <div className="flex-1 truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{prod.name}</span>
                            {prod.brand && <span className="px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 text-[10px] font-extrabold">{prod.brand}</span>}
                          </div>
                          <div className="text-xs font-extrabold text-red-600 dark:text-red-400 mt-0.5">
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
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition-all group"
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
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3 flex items-center gap-1.5">
                      🔥 Sản phẩm nổi bật & Mới nhất
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {featuredProducts.map((prod) => (
                        <div
                          key={prod._id || prod.id}
                          onClick={() => { setShowSearchDropdown(false); navigate(`/product/${prod._id || prod.id}`); }}
                          className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl cursor-pointer transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        >
                          <img src={prod.images?.[0] || 'https://via.placeholder.com/40'} alt={prod.name} className="w-12 h-12 object-contain rounded-xl bg-slate-50 dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform" />
                          <div className="flex-1 truncate">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{prod.name}</div>
                            <div className="text-xs font-extrabold text-red-600 dark:text-red-400 mt-0.5">
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
            className="p-3 text-slate-800 dark:text-slate-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl relative transition-all"
            title={t('wishlist')}
          >
            <Heart size={22} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce shadow">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowUserDropdown(false); }}
              className="p-3 text-slate-800 dark:text-slate-200 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-2xl relative transition-all"
              title="Thông báo"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-amber-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-glass dark:shadow-glass-dark border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">Thông báo mới</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:underline font-bold">
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
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</span>
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
                    className="text-xs font-bold text-primary-600 hover:underline"
                  >
                    Xem tất cả thông báo
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="p-3 bg-primary-50/80 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-2xl relative transition-all flex items-center gap-2.5 font-bold text-sm"
          >
            <div className="relative">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-md">
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
                className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563EB&color=fff`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-2xl object-cover shadow-sm border border-slate-200 dark:border-slate-700"
                />
                <span className="hidden md:inline text-sm font-bold text-slate-900 dark:text-slate-100 max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} className="text-slate-400 hidden md:block" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-slate-900 rounded-3xl shadow-glass dark:shadow-glass-dark border border-slate-100 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/50 mb-2">
                    <p className="text-xs text-slate-400 font-medium">{lang === 'vi' ? 'Xin chào,' : 'Hello,'}</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      {user?.role === 'customer' ? 'Khách hàng' : user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
                    </span>
                  </div>

                  {(isAdmin || isManager || isStaff) && (
                    <Link
                      to={`/${user.role}`}
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                    >
                      <Shield size={18} /> {lang === 'vi' ? `Trang quản trị (${user.role})` : `Dashboard (${user.role})`}
                    </Link>
                  )}

                  <Link
                    to="/profile?tab=info"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User size={18} /> {t('profile')}
                  </Link>

                  {user?.role === 'customer' && (
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Package size={18} /> {t('orders')}
                    </Link>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800/50 mt-2 pt-2">
                    <button
                      onClick={() => { setShowUserDropdown(false); logout(navigate); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut size={18} /> {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 font-bold text-sm text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm">
                {t('login')}
              </Link>
              <Link to="/register" className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-soft hover:shadow-lg transition-all hidden sm:flex">
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
