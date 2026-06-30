import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/layout/AdminSidebar';
import BottomNav from './components/layout/BottomNav';
import MobileDrawer from './components/layout/MobileDrawer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ChatWidget from './components/chat/ChatWidget';
import CompareBar from './components/product/CompareBar';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public pages
import Home from './pages/public/Home';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Vouchers from './pages/public/Vouchers';

// User pages
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import CustomerOrders from './pages/user/Orders';
import Profile from './pages/user/Profile';
import Wishlist from './pages/user/Wishlist';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminBrands from './pages/admin/Brands';
import AdminVouchers from './pages/admin/Vouchers';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import AdminBanners from './pages/admin/Banners';
import AdminTickets from './pages/admin/Tickets';
import AdminAudit from './pages/admin/Audit';

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerProducts from './pages/manager/Products';
import ManagerCategories from './pages/manager/Categories';
import ManagerBrands from './pages/manager/Brands';
import ManagerVouchers from './pages/manager/Vouchers';
import ManagerOrders from './pages/manager/Orders';
import ManagerInventory from './pages/manager/Inventory';
import ManagerReports from './pages/manager/Reports';

// Staff pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffOrders from './pages/staff/Orders';
import StaffInventory from './pages/staff/Inventory';

// Customer layout
const CustomerLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <>
      <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <main className="min-h-screen pb-16 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
      <ChatWidget />
      <CompareBar />
    </>
  );
};

// Admin/Manager/Staff layout
const DashboardLayout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
    <AdminSidebar />
    <main className="flex-1 overflow-auto">{children}</main>
  </div>
);

// Role-based redirect
const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'manager') return <Navigate to="/manager" replace />;
  if (user.role === 'staff') return <Navigate to="/staff" replace />;
  return <Navigate to="/" replace />;
};

// Guard: đã đăng nhập thì không cho vào trang Login/Register
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <RoleRedirect />;
  return children;
};

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
      <Route path="/shop" element={<CustomerLayout><Products /></CustomerLayout>} />
      <Route path="/products" element={<CustomerLayout><Products /></CustomerLayout>} />
      <Route path="/product/:id" element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Protected user routes */}
      <Route path="/cart" element={
        <ProtectedRoute>
          <CustomerLayout><Cart /></CustomerLayout>
        </ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute>
          <CustomerLayout><Checkout /></CustomerLayout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <CustomerLayout><CustomerOrders /></CustomerLayout>
        </ProtectedRoute>
      } />
      <Route path="/orders/:id" element={
        <ProtectedRoute>
          <CustomerLayout><CustomerOrders /></CustomerLayout>
        </ProtectedRoute>
      } />
      <Route path="/wishlist" element={
        <ProtectedRoute>
          <CustomerLayout><Wishlist /></CustomerLayout>
        </ProtectedRoute>
      } />
      <Route path="/vouchers" element={
        <CustomerLayout><Vouchers /></CustomerLayout>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <CustomerLayout><Profile /></CustomerLayout>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminProducts /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/categories" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminCategories /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/brands" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminBrands /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminOrders /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminUsers /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminSettings /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/vouchers" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminVouchers /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/banners" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminBanners /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/tickets" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminTickets /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/audit" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout><AdminAudit /></DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Manager routes */}
      <Route path="/manager" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <DashboardLayout><ManagerDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/manager/products" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <DashboardLayout><ManagerProducts /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/manager/categories" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <DashboardLayout><ManagerCategories /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/manager/brands" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <DashboardLayout><ManagerBrands /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/manager/orders" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <DashboardLayout><ManagerOrders /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/manager/inventory" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <DashboardLayout><ManagerInventory /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/manager/reports" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <DashboardLayout><ManagerReports /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/manager/vouchers" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <DashboardLayout><ManagerVouchers /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/manager/banners" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <DashboardLayout><AdminBanners /></DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Staff routes */}
      <Route path="/staff" element={
        <ProtectedRoute roles={['staff', 'manager', 'admin']}>
          <DashboardLayout><StaffDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/staff/orders" element={
        <ProtectedRoute roles={['staff', 'manager', 'admin']}>
          <DashboardLayout><StaffOrders /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/staff/inventory" element={
        <ProtectedRoute roles={['staff', 'manager', 'admin']}>
          <DashboardLayout><StaffInventory /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/staff/tickets" element={
        <ProtectedRoute roles={['staff', 'manager', 'admin']}>
          <DashboardLayout><AdminTickets /></DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Role redirect after login */}
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* 404 */}
      <Route path="*" element={
        <CustomerLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="text-8xl mb-6">🔍</div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">Trang không tồn tại</p>
            <a href="/" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg hover:bg-blue-600 transition-all">Về trang chủ</a>
          </div>
        </CustomerLayout>
      } />
    </Routes>
  );
};

export default App;
