import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard, ShoppingBag, Users, Tag, Package,
  BarChart2, Settings, LogOut, ChevronRight, Store, Moon, Sun,
  Award, Gift, Image, HelpCircle, FileText
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
const roleColor = { admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', staff: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' };

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const links = roleLinkMap[user?.role] || [];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col min-h-screen shrink-0 transition-colors">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow">
            <span className="text-white font-black text-lg">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || 'Quản trị'}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mt-0.5 ${roleColor[user?.role] || roleColor.admin}`}>
              {roleLabel[user?.role] || user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  end={link.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                      <span className="flex-1 truncate">{link.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 text-white shrink-0" />}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1 bg-gray-50/50 dark:bg-gray-900">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          <span>Chế độ {theme === 'dark' ? 'Sáng' : 'Tối'}</span>
        </button>

        <NavLink to="/" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Store className="w-4 h-4 text-emerald-500" />
          <span>Về Sàn bán hàng</span>
        </NavLink>

        <button
          onClick={() => { logout(navigate); }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
