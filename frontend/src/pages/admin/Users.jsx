import React, { useState, useEffect, useMemo } from 'react';
import { userAPI } from '../../services/api';
import { 
  Search, Edit, Trash2, ToggleLeft, ToggleRight, X, Loader2, 
  Users as UsersIcon, Shield, Briefcase, UserCheck, User, 
  CheckCircle2, AlertOctagon, RefreshCw, Mail, Phone, Calendar, Lock, Unlock
} from 'lucide-react';
import toast from 'react-hot-toast';

const roleConfig = {
  admin: { label: 'Quản Trị (Admin)', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', icon: Shield },
  manager: { label: 'Quản Lý (Manager)', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Briefcase },
  staff: { label: 'Nhân Viên (Staff)', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: UserCheck },
  customer: { label: 'Khách Hàng (Customer)', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', icon: User }
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ page, limit: 12, search: searchQuery.trim(), role: roleFilter });
      setUsers(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchUsers(); 
  }, [page, searchQuery, roleFilter]);

  const handleToggleStatus = async (userId, name, currentStatus) => {
    try {
      const res = await userAPI.toggleStatus(userId);
      setUsers(users.map(u => u._id === userId ? res.data : u));
      toast.success(`Tài khoản "${name}" đã được ${currentStatus ? 'khóa' : 'mở khóa'}!`);
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await userAPI.delete(userId);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('Đã xóa người dùng khỏi hệ thống');
    } catch (err) {
      toast.error(err.message || 'Xóa tài khoản thất bại');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editUser.name.trim()) {
      toast.error('Vui lòng nhập tên người dùng');
      return;
    }
    setSaving(true);
    try {
      const res = await userAPI.update(editUser._id, { 
        name: editUser.name.trim(), 
        role: editUser.role, 
        phone: editUser.phone?.trim() || '' 
      });
      setUsers(users.map(u => u._id === editUser._id ? res.data : u));
      setEditUser(null);
      toast.success('✨ Đã cập nhật quyền và thông tin người dùng!');
    } catch (err) {
      toast.error(err.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = pagination.total || users.length;
    const active = users.filter(u => u.isActive !== false).length;
    const locked = users.filter(u => u.isActive === false).length;
    const staffAndAbove = users.filter(u => ['admin', 'manager', 'staff'].includes(u.role)).length;
    return { total, active, locked, staffAndAbove };
  }, [users, pagination.total]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <UsersIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display">
              Quản Trị Người Dùng & Phân Quyền
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-12">
            Quản lý tài khoản, phân quyền Role (Admin, Manager, Staff, Customer) và kiểm soát trạng thái bảo mật
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 font-black">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng tài khoản</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.active}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đang hoạt động</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.locked}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tài khoản bị khóa</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.staffAndAbove}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nhân sự nội bộ</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Role status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            {[
              { key: '', label: 'Tất cả Role' },
              { key: 'customer', label: 'Khách hàng', icon: User },
              { key: 'staff', label: 'Staff', icon: UserCheck, color: 'text-emerald-500' },
              { key: 'manager', label: 'Manager', icon: Briefcase, color: 'text-blue-500' },
              { key: 'admin', label: 'Admin', icon: Shield, color: 'text-purple-500' },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setRoleFilter(tab.key); setPage(1); }}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    roleFilter === tab.key
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {TabIcon && <TabIcon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên, email hoặc SĐT..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thành viên</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thông tin liên hệ</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vai trò (Role)</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái tài khoản</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ngày đăng ký</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-5">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <UsersIcon className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy người dùng nào</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Thử thay đổi bộ lọc tìm kiếm hoặc từ khóa</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const roleInfo = roleConfig[u.role] || roleConfig.customer;
                  const RoleIcon = roleInfo.icon;
                  const isActive = u.isActive !== false;
                  
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                              ID: {u._id?.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.email}</span>
                          </p>
                          {u.phone && (
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{u.phone}</span>
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${roleInfo.color}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          <span>{roleInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}>
                          {isActive ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-rose-600" />}
                          <span>{isActive ? 'Hoạt động' : 'Đã khóa'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(u.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(u._id, u.name, isActive)}
                            className={`p-2 rounded-xl transition-all ${
                              isActive 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-amber-50 hover:text-amber-600' 
                                : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                            title={isActive ? 'Khóa tài khoản này' : 'Mở khóa tài khoản'}
                          >
                            {isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-rose-500" />}
                          </button>

                          <button
                            onClick={() => setEditUser({ ...u })}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all font-bold text-xs flex items-center gap-1"
                            title="Sửa quyền & thông tin"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Phân quyền</span>
                          </button>

                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDelete(u._id, u.name)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Trang <strong className="text-slate-900 dark:text-white">{page}</strong> / {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-scale-up">
            
            <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    ⚙️ Phân Quyền & Cập Nhật Người Dùng
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Thay đổi vai trò (Role) và thông tin liên hệ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditUser(null)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={editUser.phone || ''}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  placeholder="Chưa cập nhật SĐT"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Phân Quyền Vai Trò (Role) *
                </label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="customer">Khách Hàng (Customer) - Mua sắm thông thường</option>
                  <option value="staff">Nhân Viên (Staff) - Quản lý đơn hàng & sản phẩm</option>
                  <option value="manager">Quản Lý (Manager) - Quản lý kho, đơn & thống kê</option>
                  <option value="admin">Quản Trị (Admin) - Toàn quyền hệ thống</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  ⚠️ Lưu ý: Thay đổi Role sẽ lập tức thay đổi quyền hạn truy cập của tài khoản vào các module quản trị.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-lg shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 flex-1 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Lưu Phân Quyền</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
