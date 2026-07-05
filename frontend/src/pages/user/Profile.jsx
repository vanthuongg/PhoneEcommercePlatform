import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { userAPI, authAPI, orderAPI } from "../../services/api";
import ProductCard from "../../components/product/ProductCard";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { User, Lock, Save, Loader2, Package, Heart, ChevronRight, LogOut, Trash2, Bell, Ticket, MessageSquare, Star, Clock, CheckCircle, Truck, XCircle, ShoppingBag, ArrowRight, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

import NotificationList from "../../components/profile/NotificationList";
import UserTickets from "../../components/profile/UserTickets";
import UserReviews from "../../components/profile/UserReviews";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const statusConfig = {
  pending: { label: '⏳ Chờ xác nhận', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60' },
  confirmed: { label: '✓ Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60' },
  processing: { label: '📦 Đang đóng gói', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60' },
  shipping: { label: '🚚 Đang giao hàng', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60' },
  delivered: { label: '🎉 Giao thành công', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60' },
  cancelled: { label: '❌ Đã hủy đơn', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60' },
};

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "info");
  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (activeTab === "orders") {
      setLoadingOrders(true);
      orderAPI
        .getAll({ limit: 10 })
        .then((res) => setOrders(res.data || []))
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { toast.error('Vui lòng nhập họ tên'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("phone", profileForm.phone);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await userAPI.updateProfile(formData);
      updateUser(res.data);
      toast.success('Cập nhật thông tin thành công! 🎉');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      toast.error(err.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success('Đổi mật khẩu thành công! 🔐');
    } catch (err) {
      toast.error(err.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa tabs theo từng role
  const tabsByRole = {
    customer: [
      { key: 'info',          label: 'Thông tin cá nhân',   icon: User },
      { key: 'orders',        label: 'Đơn hàng của tôi',    icon: Package },
      { key: 'notifications', label: 'Thông báo',            icon: Bell },
      { key: 'tickets',       label: 'Hỗ trợ khách hàng',   icon: MessageSquare },
      { key: 'reviews',       label: 'Đánh giá của tôi',    icon: Star },
      { key: 'password',      label: 'Đổi mật khẩu',        icon: Lock },
    ],
    staff: [
      { key: 'info',          label: 'Thông tin cá nhân',   icon: User },
      { key: 'notifications', label: 'Thông báo',            icon: Bell },
      { key: 'tickets',       label: 'Hỗ trợ khách hàng',   icon: MessageSquare },
      { key: 'password',      label: 'Đổi mật khẩu',        icon: Lock },
    ],
    manager: [
      { key: 'info',          label: 'Thông tin cá nhân',   icon: User },
      { key: 'notifications', label: 'Thông báo',            icon: Bell },
      { key: 'password',      label: 'Đổi mật khẩu',        icon: Lock },
    ],
    admin: [
      { key: 'info',          label: 'Thông tin cá nhân',   icon: User },
      { key: 'notifications', label: 'Thông báo',            icon: Bell },
      { key: 'password',      label: 'Đổi mật khẩu',        icon: Lock },
    ],
  };
  const tabs = tabsByRole[user?.role] ?? tabsByRole.customer;

  const inputCls =
    "w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm font-semibold text-slate-900 dark:text-white transition-all duration-300 shadow-sm placeholder:text-slate-400";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors animate-fade-in relative overflow-hidden">
      {/* Background ambient glow blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/2 -left-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-float-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        <Breadcrumb items={[{ label: "Trang chủ", link: "/" }, { label: "Tài khoản của tôi" }]} />

        {/* Hero Header Card */}
        <div className="bg-gradient-to-r from-primary-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden border border-white/20 group animate-scale-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="relative group/avatar">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-pink-500 to-primary-400 rounded-3xl blur-md opacity-75 group-hover/avatar:opacity-100 transition duration-500 animate-pulse-glow" />
              <div className="relative w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/40 text-white text-3xl font-black shadow-inner overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500" />
                ) : user?.avatar ? (
                  <img
                    src={user.avatar.startsWith("http") ? user.avatar : `http://localhost:5000${user.avatar}`}
                    alt={user.name}
                    className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500"
                  />
                ) : (
                  user?.name?.[0]?.toUpperCase() || "U"
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h1>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md inline-flex items-center gap-1.5 ${
                  user?.role === 'admin'    ? 'bg-red-500 text-white border border-red-400' :
                  user?.role === 'manager' ? 'bg-purple-500 text-white border border-purple-400' :
                  user?.role === 'staff'   ? 'bg-emerald-400 text-slate-950 font-extrabold' :
                  'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-extrabold'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                  {user?.role === 'admin' ? 'Quản Trị Viên' : user?.role === 'manager' ? 'Quản Lý' : user?.role === 'staff' ? 'Nhân Viên' : 'Khách VIP'}
                </span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium mt-1.5 opacity-90">{user?.email}</p>
              <p className="text-white/80 text-xs font-medium mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Số điện thoại: {user?.phone || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2.5 relative z-10 w-full sm:w-auto">
            {user?.role === 'customer' && (
              <Link
                to="/orders"
                className="flex-1 sm:flex-none py-2.5 px-6 rounded-2xl bg-white/15 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold text-center border border-white/30 hover:border-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Xem Tất Cả Đơn Hàng
              </Link>
            )}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/manager'}
                className="flex-1 sm:flex-none py-2.5 px-6 rounded-2xl bg-white/20 hover:bg-white/35 backdrop-blur-md text-white text-xs font-extrabold text-center border border-white/30 hover:border-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <span>Vào Trang Quản Trị</span>
                <ChevronRight className="w-4 h-4 animate-slide-in-right" />
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start w-full min-w-0">
          {/* Sidebar Menu Tabs */}
          <div className="lg:col-span-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-3.5 border border-slate-200/80 dark:border-slate-800/80 shadow-premium dark:shadow-premium-dark space-y-1.5 sticky top-24 transition-all min-w-0 w-full">
            {tabs.map(({ key, label, icon: Icon, count }, idx) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{ animationDelay: `${idx * 40}ms` }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-xs font-bold transition-all duration-300 group animate-fade-in ${
                  activeTab === key
                    ? "bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/30 scale-[1.02]"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:translate-x-1"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon size={18} className={`transition-transform duration-300 group-hover:scale-125 ${activeTab === key ? "text-white" : "text-primary-500 dark:text-primary-400"}`} />
                  <span className="tracking-wide">{label}</span>
                </div>
                {count !== undefined && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all ${
                      activeTab === key ? "bg-white text-primary-700 shadow-sm" : "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 mt-2">
              <button
                onClick={() => { logout(navigate); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition-all duration-300 group"
              >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`lg:col-span-9 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-premium dark:shadow-premium-dark min-h-[500px] transition-all animate-fade-in-up min-w-0 w-full overflow-hidden ${activeTab === 'tickets' ? 'p-1.5 sm:p-2.5' : 'p-6 sm:p-8'}`}>
            {activeTab === "info" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6 animate-fade-in">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Thông Tin Cá Nhân</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
                </div>

                {/* Avatar preview */}
                <div className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/70 dark:border-slate-700/70 transition-all hover:border-primary-500/40">
                  <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border-2 border-white dark:border-slate-600 shadow-md">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover animate-scale-in" />
                    ) : user?.avatar ? (
                      <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-400">{user?.name?.[0]?.toUpperCase()}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Ảnh đại diện</p>
                    <p className="text-xs text-slate-500 mb-2.5">JPG, PNG, GIF. Kích thước tối đa 5MB</p>
                    <input
                      type="file" accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setAvatarFile(e.target.files[0]);
                          setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer file:transition-all file:shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Họ & Tên *</label>
                    <input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className={inputCls}
                      required placeholder="Nhập họ và tên..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Số điện thoại</label>
                    <input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className={inputCls} placeholder="0901234567"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Email tài khoản</label>
                    <input
                      value={user?.email || ""} disabled
                      className="w-full p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-400 text-sm font-medium cursor-not-allowed border border-slate-200 dark:border-slate-700"
                    />
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Email không thể thay đổi sau khi đăng ký
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit" disabled={loading}
                    className="btn-primary py-3.5 px-8"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                    <span>Lưu Thay Đổi</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6 animate-fade-in">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display flex items-center gap-2">
                      <ShoppingBag className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      <span>Đơn Hàng Gần Đây</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Theo dõi lịch sử mua sắm, trạng thái vận chuyển và chi tiết các đơn đặt hàng mới nhất</p>
                  </div>
                  <Link
                    to="/orders"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-xs hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all shadow-xs border border-primary-100 dark:border-primary-800/60 self-start sm:self-auto group"
                  >
                    <span>Xem toàn bộ lịch sử ({orders.length})</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {loadingOrders ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-4 animate-fade-in">
                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mx-auto text-primary-600 dark:text-primary-400 shadow-inner">
                      <Package size={40} className="animate-bounce-slow" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-base text-slate-900 dark:text-white">Bạn chưa có đơn hàng mua sắm nào</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Khám phá ngay hàng trăm công nghệ siêu phẩm, smartphone flagship với nhiều ưu đãi giảm giá đang chờ bạn!</p>
                    </div>
                    <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-xs font-bold px-6 py-3.5 shadow-lg shadow-primary-500/20 active:scale-95">
                      <ShoppingBag size={16} />
                      <span>Sắm Siêu Phẩm Ngay</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((o, index) => {
                      const orderCode = o.orderCode || o._id?.slice(-6).toUpperCase() || "N/A";
                      const statusInfo = statusConfig[o.orderStatus] || { label: o.orderStatus, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200" };
                      const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "Vừa xong";
                      const payMethod = o.paymentMethod === "vnpay" ? "VNPay QR" : o.paymentMethod === "banking" ? "Chuyển khoản QR" : "Tiền mặt (COD)";
                      const firstItem = o.items?.[0];
                      const otherCount = (o.items?.length || 1) - 1;

                      return (
                        <Link
                          key={o._id}
                          to={`/orders/${o._id}`}
                          style={{ animationDelay: `${index * 60}ms` }}
                          className="block bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-300 group animate-fade-in hover:-translate-y-1 relative overflow-hidden"
                        >
                          {/* Top Header of Card */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                                <Package size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    #{orderCode}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                                    {o.items?.length || 1} món
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                  <Clock size={11} /> {orderDate}
                                </span>
                              </div>
                            </div>

                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border shadow-2xs self-start sm:self-auto ${statusInfo.color}`}>
                              <span>{statusInfo.label}</span>
                            </span>
                          </div>

                          {/* Middle: Product Preview */}
                          <div className="py-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              {firstItem ? (
                                <>
                                  <img
                                    src={firstItem.image || firstItem.product?.images?.[0] || "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80"}
                                    alt=""
                                    className="w-14 h-14 rounded-2xl object-cover bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                      {firstItem.name || firstItem.product?.name || "Sản phẩm công nghệ"}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                                      <span>SL: <strong className="text-slate-700 dark:text-slate-300 font-bold">{firstItem.quantity || 1}</strong></span>
                                      {firstItem.price && <span>• Giá: <strong className="text-slate-700 dark:text-slate-300 font-bold">{formatPrice(firstItem.price)}</strong></span>}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs text-slate-500 font-medium italic">Đơn hàng gồm {o.items?.length || 1} sản phẩm</div>
                              )}
                            </div>

                            {otherCount > 0 && (
                              <div className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-extrabold text-slate-600 dark:text-slate-300">
                                +{otherCount} sp khác
                              </div>
                            )}
                          </div>

                          {/* Footer of Card */}
                          <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                              <CreditCard size={14} className="text-slate-400" />
                              <span>Thanh toán: <strong className="text-slate-700 dark:text-slate-300 font-bold">{payMethod}</strong></span>
                              {(o.paymentStatus === 'paid' || o.isPaid || o.orderStatus === 'delivered') && <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">✓ Đã thanh toán</span>}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4">
                              <div className="text-left sm:text-right">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tổng thanh toán:</span>
                                <span className="font-black text-base sm:text-lg text-red-600 dark:text-red-400 leading-none">
                                  {formatPrice(o.totalAmount)}
                                </span>
                              </div>

                              <div className="px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-extrabold text-xs flex items-center gap-1.5 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-xs shrink-0">
                                <span>Chi tiết</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && <div className="animate-fade-in"><NotificationList /></div>}
            {activeTab === "tickets" && <div className="animate-fade-in"><UserTickets /></div>}
            {activeTab === "reviews" && <div className="animate-fade-in"><UserReviews /></div>}

            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-md animate-fade-in">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Đổi Mật Khẩu Bảo Mật</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Vui lòng sử dụng mật khẩu mạnh kết hợp chữ và số</p>
                </div>
                <div className="space-y-4">
                  {[
                    ["currentPassword", "Mật khẩu hiện tại"],
                    ["newPassword", "Mật khẩu mới"],
                    ["confirmPassword", "Xác nhận mật khẩu mới"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">{label}</label>
                      <input
                        type="password"
                        value={passwordForm[field]}
                        onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                        className={inputCls}
                        required
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />} 
                  <span>Cập Nhật Mật Khẩu</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
