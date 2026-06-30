import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Search, UserPlus, Edit, Trash2, ToggleLeft, ToggleRight, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const roleColor = { admin: 'badge bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', manager: 'badge bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', staff: 'badge bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', customer: 'badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ page, limit: 10, search, role: roleFilter });
      setUsers(res.data || []);
      setPagination(res.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await userAPI.toggleStatus(userId);
      setUsers(users.map(u => u._id === userId ? res.data : u));
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await userAPI.delete(userId);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('Đã xóa người dùng');
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.update(editUser._id, { name: editUser.name, role: editUser.role, phone: editUser.phone });
      setUsers(users.map(u => u._id === editUser._id ? res.data : u));
      setEditUser(null);
      toast.success('Cập nhật thành công');
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{pagination.total} tài khoản</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9 text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white dark:bg-gray-800"
        >
          <option value="">Tất cả role</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
              <tr>
                {['Người dùng', 'Email', 'Role', 'Điện thoại', 'Trạng thái', 'Ngày tạo', 'Hành động'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
                ))
              ) : users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-semibold text-sm">{u.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3"><span className={roleColor[u.role]}>{u.role}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditUser({ ...u })} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleToggleStatus(u._id)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDelete(u._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Trang {page} / {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Trước</button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Chỉnh sửa người dùng</h2>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Họ tên</label>
                <input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Điện thoại</label>
                <input value={editUser.phone || ''} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })} className="input-field">
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditUser(null)} className="btn-secondary flex-1">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 spinner" />}
                  Lưu
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
