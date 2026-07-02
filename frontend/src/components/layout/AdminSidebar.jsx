import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard, ShoppingBag, Users, Tag, Package,
  BarChart2, Settings, LogOut, ChevronRight, Store, Moon, Sun,
  Award, Gift, Image, HelpCircle, FileText, Smartphone
} from 'lucide-react';

const adminLinks = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Người dùng', path: '/admin/users', icon: Users },
  { label: 'Sản phẩm', path: '/admin/products', icon: ShoppingBag },
  { label: 'Danh mục', path: '/admin/categories', icon: Tag },
  { label: 'Thương hiệu', path: '/admin/brands', icon: Award },
  { label: 'Khuyến mãi', path: '/admin/vouchers', icon: Gift },
  { label: 'Banner CMS', path: '/admin/banners', icon: Image },
  { label: 'Đơn hàng', path: '/admin/orders', icon: Package },
  { label: 'Tồn kho', path: '/admin/inventory', icon: Store },
  { label: 'Hỗ trợ Ticket', path: '/admin/tickets', icon: HelpCircle },
  { label: 'Nhật ký Audit', path: '/admin/audit', icon: FileText },
  { label: 'Cài đặt', path: '/admin/settings', icon: Settings },
];

const managerLinks = [
  { label: 'Dashboard', path: '/manager', icon: LayoutDashboard, exact: true },
  { label: 'Sản phẩm', path: '/manager/products', icon: ShoppingBag },
  { label: 'Danh mục', path: '/manager/categories', icon: Tag },
  { label: 'Thương hiệu', path: '/manager/brands', icon: Award },
  { label: 'Khuyến mãi', path: '/manager/vouchers', icon: Gift },
  { label: 'Banner CMS', path: '/manager/banners', icon: Image },
  { label: 'Đơn hàng', path: '/manager/orders', icon: Package },
  { label: 'Tồn kho', path: '/manager/inventory', icon: Store },
  { label: 'Báo cáo', path: '/manager/reports', icon: BarChart2 },
];

const staffLinks = [
  { label: 'Dashboard', path: '/staff', icon: LayoutDashboard, exact: true },
  { label: 'Đơn hàng', path: '/staff/orders', icon: Package },
  { label: 'Tồn kho', path: '/staff/inventory', icon: Store },
  { label: 'Hỗ trợ Ticket', path: '/staff/tickets', icon: HelpCircle },
];

const roleLinkMap = { admin: adminLinks, manager: managerLinks, staff: staffLinks };
const roleLabel = { admin: 'Quản trị viên', manager: 'Quản lý', staff: 'Nhân viên' };
const roleColor = {
  admin: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  manager: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  staff: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
};

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const links = roleLinkMap[user?.role] || [];

  return (
    <aside className="w-56 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col min-h-screen shrink-0 transition-all duration-300 shadow-2xl relative z-30">
      {/* Decorative gradient glow orb */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary-600/15 via-indigo-600/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/50 relative z-10">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-9 h-9 bg-gradient-to-tr from-primary-600 via-indigo-600 to-primary-500 rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            <Smartphone className="w-5 h-5 text-white stroke-[2.5] animate-bounce-subtle" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-black text-white truncate font-display tracking-tight group-hover:text-primary-400 transition-colors">{user?.name || 'Quản trị'}</p>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 mt-0.5 shadow-sm ${roleColor[user?.role] || roleColor.admin}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping inline-block mr-0.5" />
              {roleLabel[user?.role] || user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto custom-scrollbar relative z-10">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2.5 mb-1.5 mt-1 flex items-center justify-between">
          <span>Menu Chính</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
        </div>
        <ul className="space-y-0.5">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <li key={link.path} style={{ animationDelay: `${index * 20}ms` }} className="animate-fade-in">
                <NavLink
                  to={link.path}
                  end={link.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all duration-300 group relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-500 text-white shadow-md shadow-primary-500/30 scale-[1.01]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80 hover:translate-x-1'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="absolute left-0 top-1 bottom-1 w-1 bg-amber-400 rounded-r-full shadow-glow-accent animate-pulse" />}
                      <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-400'}`} />
                      <span className="flex-1 truncate tracking-wide">{link.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0 opacity-90 animate-slide-in-right" />}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer actions */}
      <div className="p-2.5 border-t border-slate-800/80 space-y-1 bg-slate-950/80 relative z-10">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/90 transition-all duration-300 border border-slate-800/80 hover:border-slate-700 shadow-sm group"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow group-hover:scale-110 transition-transform" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          )}
          <span>Chế độ Sáng / Tối</span>
        </button>

        <NavLink 
          to="/" 
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/90 transition-all duration-300 border border-slate-800/80 hover:border-emerald-500/40 shadow-sm group"
        >
          <Store className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Về Sàn bán hàng</span>
        </NavLink>

        <button
          onClick={() => { logout(navigate); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/15 hover:border-red-500/40 transition-all duration-300 border border-transparent group"
        >
          <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
