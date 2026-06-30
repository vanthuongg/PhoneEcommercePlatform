import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Home, Grid, ShoppingBag, Package, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const path = location.pathname;

  const tabs = [
    { label: 'Trang chủ', icon: Home, link: '/' },
    { label: 'Danh mục', icon: Grid, link: '/shop' },
    { label: 'Giỏ hàng', icon: ShoppingBag, link: '/cart', badge: cartCount },
    { label: 'Đơn hàng', icon: Package, link: '/profile?tab=orders' },
    { label: 'Tài khoản', icon: User, link: '/profile?tab=profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-40 px-2 py-1 flex justify-around items-center shadow-lg">
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        const isActive = path === tab.link || (tab.link.includes('?') && path + location.search === tab.link);
        return (
          <Link
            key={idx}
            to={tab.link}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-primary dark:text-primary font-bold scale-105'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="relative">
              <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'} />
              {tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
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
