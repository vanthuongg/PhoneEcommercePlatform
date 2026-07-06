import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Grid, ShoppingBag, Package, User, Bell, Shield } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const path = location.pathname;
  const isCustomerOrGuest = !user || user.role === 'customer';

  const tabs = isCustomerOrGuest ? [
    { label: 'Trang chủ', icon: Home, link: '/' },
    { label: 'Danh mục', icon: Grid, link: '/shop' },
    { label: 'Giỏ hàng', icon: ShoppingBag, link: '/cart', badge: cartCount },
    { label: 'Đơn hàng', icon: Package, link: '/profile?tab=orders' },
    { label: 'Tài khoản', icon: User, link: '/profile?tab=info' },
  ] : [
    { label: 'Trang chủ', icon: Home, link: '/' },
    { label: 'Cửa hàng', icon: Grid, link: '/shop' },
    { label: 'Quản trị', icon: Shield, link: `/${user.role}` },
    { label: 'Thông báo', icon: Bell, link: '/profile?tab=notifications' },
    { label: 'Tài khoản', icon: User, link: '/profile?tab=info' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-200 dark:border-slate-800/50 z-40 px-2 py-1 flex justify-around items-center shadow-glass dark:shadow-glass-dark">
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        const isActive = path === tab.link || (tab.link.includes('?') && path + location.search === tab.link);
        return (
          <Link
            key={idx}
            to={tab.link}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-primary-600 dark:text-primary-500 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'} />
              {tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
