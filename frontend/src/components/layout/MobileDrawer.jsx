import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { categoryAPI } from '../../services/api';
import { X, Home, ShoppingBag, Heart, Package, Shield, LogOut, Zap, HelpCircle } from 'lucide-react';

const MobileDrawer = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout, isAdmin, isManager, isStaff } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      categoryAPI.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-80 max-w-[85vw] bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col z-10 animate-slide-right">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-between">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=fff&color=2563EB`}
                alt={user?.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white/30"
              />
              <div>
                <div className="font-bold text-base truncate max-w-[150px]">{user?.name}</div>
                <div className="text-xs text-blue-100 uppercase font-semibold">{user?.role}</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="font-extrabold text-xl">Chào mừng bạn!</div>
              <div className="text-xs text-blue-100 mt-1">Đăng nhập để nhận ưu đãi</div>
            </div>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body Links */}
        <div className="p-4 overflow-y-auto flex-1 space-y-6 divide-y divide-gray-100 dark:divide-gray-800">
          {!isAuthenticated && (
            <div className="flex gap-2">
              <Link to="/login" onClick={onClose} className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-center text-sm shadow-md">Đăng nhập</Link>
              <Link to="/register" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-center text-sm">Đăng ký</Link>
            </div>
          )}

          <div className="space-y-1 pt-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Điều hướng</div>
            <Link to="/" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Home size={18} className="text-primary" /> Trang chủ
            </Link>
            <Link to="/shop" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Zap size={18} className="text-amber-500" /> Khám phá Cửa hàng
            </Link>
            {(!user || user?.role === 'customer') && (
              <Link to="/cart" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ShoppingBag size={18} className="text-blue-500" /> Giỏ hàng
              </Link>
            )}
            {isAuthenticated && user?.role === 'customer' && (
              <>
                <Link to="/wishlist" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Heart size={18} className="text-red-500" /> Sản phẩm yêu thích
                </Link>
                <Link to="/profile?tab=orders" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Package size={18} className="text-emerald-500" /> Đơn hàng của tôi
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 space-y-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Danh mục sản phẩm</div>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat._id}`}
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>

          {(isAdmin || isManager || isStaff) && (
            <div className="pt-4 space-y-1">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Quản trị viên</div>
              <Link to={`/${user.role}`} onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-primary dark:text-blue-400 bg-primary/10 dark:bg-primary/20">
                <Shield size={18} /> Vào trang {user.role}
              </Link>
            </div>
          )}

          <div className="pt-4 space-y-1">
            <Link to="/faq" onClick={onClose} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
              <HelpCircle size={18} /> Trung tâm trợ giúp
            </Link>
            {isAuthenticated && (
              <button
                onClick={() => { onClose(); logout(navigate); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl mt-2"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
