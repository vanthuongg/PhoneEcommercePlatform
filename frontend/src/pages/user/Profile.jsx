import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { userAPI, authAPI, orderAPI } from "../../services/api";
import ProductCard from "../../components/product/ProductCard";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { User, Lock, Save, Loader2, Package, Heart, ChevronRight, LogOut, Trash2, Bell, Ticket, MessageSquare, Star } from "lucide-react";
import toast from "react-hot-toast";

import NotificationList from "../../components/profile/NotificationList";
import UserTickets from "../../components/profile/UserTickets";
import UserReviews from "../../components/profile/UserReviews";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

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
      toast.success("Cập nhật thông tin thành công!");
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
      toast.success("Đổi mật khẩu thành công!");
    } catch (err) {
      toast.error(err.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "info", label: "Thông tin cá nhân", icon: User },
    ...(user?.role === 'customer' ? [{ key: "orders", label: "Đơn hàng của tôi", icon: Package }] : []),
    { key: "wishlist", label: "Sản phẩm yêu thích", icon: Heart, count: wishlist.length },
    { key: "notifications", label: "Thông báo", icon: Bell },
    { key: "tickets", label: "Hỗ trợ khách hàng", icon: MessageSquare },
    { key: "reviews", label: "Đánh giá của tôi", icon: Star },
    { key: "password", label: "Đổi mật khẩu", icon: Lock },
  ];

  const inputCls =
    "w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-medium text-gray-900 dark:text-white transition-all";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumb items={[{ label: "Trang chủ", link: "/" }, { label: "Tài khoản của tôi" }]} />

        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 text-white text-3xl font-black shadow-inner overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : user?.avatar ? (
                <img
                  src={user.avatar.startsWith("http") ? user.avatar : `http://localhost:5000${user.avatar}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black">{user?.name}</h1>
                <span className="bg-amber-400 text-gray-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {user?.role === "admin" ? "Quản Trị" : user?.role === "manager" ? "Quản Lý" : "Khách VIP"}
                </span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">{user?.email}</p>
              <p className="text-white/80 text-xs mt-1">Số điện thoại: {user?.phone || "Chưa cập nhật"}</p>
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 relative z-10 w-full sm:w-auto">
            {user?.role === 'customer' && (
              <Link
                to="/orders"
                className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold text-center border border-white/20 transition-all"
              >
                Xem Tất Cả Đơn Hàng
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm space-y-1 sticky top-24">
            {tabs.map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === key
                    ? "bg-primary text-white shadow-md shadow-blue-500/20"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={activeTab === key ? "text-white" : "text-primary"} />
                  <span>{label}</span>
                </div>
                {count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      activeTab === key ? "bg-white text-primary" : "bg-blue-100 dark:bg-blue-900/40 text-primary"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
              <button
                onClick={() => { logout(navigate); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm min-h-[480px]">
            {activeTab === "info" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Thông Tin Cá Nhân</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                </div>

                {/* Avatar preview */}
                <div className="flex items-center gap-5 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0 border-2 border-white dark:border-gray-600 shadow-sm">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : user?.avatar ? (
                      <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-400">{user?.name?.[0]?.toUpperCase()}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Ảnh đại diện</p>
                    <p className="text-xs text-gray-500 mb-2">JPG, PNG, GIF. Kích thước tối đa 5MB</p>
                    <input
                      type="file" accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setAvatarFile(e.target.files[0]);
                          setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Họ & Tên *</label>
                    <input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className={inputCls}
                      required placeholder="Nhập họ và tên..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Số điện thoại</label>
                    <input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className={inputCls} placeholder="0901234567"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Email tài khoản</label>
                    <input
                      value={user?.email || ""} disabled
                      className="w-full p-3.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 text-gray-500 text-sm cursor-not-allowed border border-gray-200 dark:border-gray-700"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi sau khi đăng ký</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit" disabled={loading}
                    className="py-3.5 px-8 rounded-xl bg-primary hover:bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Lưu Thay Đổi
                  </button>
                </div>
              </form>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Đơn Hàng Gần Đây</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Danh sách các đơn đặt hàng mới nhất của bạn</p>
                  </div>
                  <Link to="/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    Xem toàn bộ <ChevronRight size={14} />
                  </Link>
                </div>
                {loadingOrders ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
                      <Package size={28} />
                    </div>
                    <p className="font-bold text-gray-600 dark:text-gray-400">Bạn chưa có đơn hàng mua sắm nào</p>
                    <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-xs">
                      Sắm Siêu Phẩm Ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => (
                      <Link
                        key={o._id}
                        to={`/orders/${o._id}`}
                        className="block p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-primary transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-xs text-primary">
                            #{o.orderCode || o._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                            {o.orderStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>Gồm {o.items?.length || 1} sản phẩm</span>
                          <span className="font-black text-sm text-gray-900 dark:text-white">{formatPrice(o.totalAmount)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Sản Phẩm Đã Yêu Thích ({wishlist.length})</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Lưu lại những món đồ ưa thích để dễ dàng chọn mua sau</p>
                </div>
                {wishlist.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                      <Heart size={28} />
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">Danh sách yêu thích đang trống</h3>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">Nhấn biểu tượng trái tim trên các sản phẩm để lưu vào đây.</p>
                    <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-xs">
                      Khám Phá Cửa Hàng
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <div key={item._id} className="relative group">
                        <ProductCard product={item} />
                        <button
                          onClick={() => removeFromWishlist(item._id)}
                          title="Xóa khỏi yêu thích"
                          className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white shadow-md hover:scale-110 transition-transform z-10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && <NotificationList />}
            {activeTab === "tickets" && <UserTickets />}
            {activeTab === "reviews" && <UserReviews />}

            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Đổi Mật Khẩu Bảo Mật</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Vui lòng sử dụng mật khẩu mạnh kết hợp chữ và số</p>
                </div>
                <div className="space-y-4">
                  {[
                    ["currentPassword", "Mật khẩu hiện tại"],
                    ["newPassword", "Mật khẩu mới"],
                    ["confirmPassword", "Xác nhận mật khẩu mới"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">{label}</label>
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
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />} Cập Nhật Mật Khẩu
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
