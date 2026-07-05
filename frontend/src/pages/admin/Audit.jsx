import React, { useState, useEffect, useMemo } from 'react';
import { auditAPI } from '../../services/api';
import { 
  Activity, Search, Shield, User, Clock, Loader2, RefreshCw, 
  FileText, Trash2, Edit3, PlusCircle, LogIn, AlertTriangle, 
  Globe, Terminal, CheckCircle2, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Audit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { action: filter } : {};
      const res = await auditAPI.getAll(params);
      setLogs(res.data || []);
    } catch (err) {
      toast.error('Không thể tải nhật ký hoạt động hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const getActionInfo = (action = '') => {
    const act = action.toLowerCase();
    if (act.includes('create') || act.includes('add')) {
      return { label: 'TẠO MỚI DỮ LIỆU', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: PlusCircle };
    }
    if (act.includes('login') || act.includes('auth')) {
      return { label: 'ĐĂNG NHẬP HỆ THỐNG', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', icon: LogIn };
    }
    if (act.includes('update') || act.includes('edit') || act.includes('status')) {
      return { label: 'CẬP NHẬT / THAY ĐỔI', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Edit3 };
    }
    if (act.includes('delete') || act.includes('remove') || act.includes('destroy')) {
      return { label: 'XÓA DỮ LIỆU', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', icon: Trash2 };
    }
    return { label: action.toUpperCase() || 'HOẠT ĐỘNG KHÁC', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', icon: Activity };
  };

  // Filter logs locally by searchQuery
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(log => 
      log.user?.name?.toLowerCase().includes(q) ||
      log.user?.email?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.entity?.toLowerCase().includes(q) ||
      log.ipAddress?.includes(q) ||
      log.entityId?.includes(q)
    );
  }, [logs, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = logs.length;
    const creates = logs.filter(l => l.action?.toLowerCase().includes('create') || l.action?.toLowerCase().includes('login')).length;
    const updates = logs.filter(l => l.action?.toLowerCase().includes('update')).length;
    const deletes = logs.filter(l => l.action?.toLowerCase().includes('delete')).length;
    return { total, creates, updates, deletes };
  }, [logs]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display">
              Trung Tâm Bảo Mật & Nhật Ký Hoạt Động
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-12">
            Ghi nhận toàn bộ thao tác truy cập, thay đổi dữ liệu và cảnh báo bảo mật từ Quản trị viên & Nhân viên
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
            title="Làm mới nhật ký"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-500/10 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 font-black">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng sự kiện ghi nhận</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.creates}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tạo mới & Đăng nhập</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.updates}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cập nhật cấu hình</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.deletes}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Thao tác xóa</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Live Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Action type tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            {[
              { key: 'all', label: 'Tất cả sự kiện' },
              { key: 'create', label: 'Tạo mới', color: 'text-emerald-500' },
              { key: 'update', label: 'Cập nhật', color: 'text-blue-500' },
              { key: 'delete', label: 'Xóa dữ liệu', color: 'text-rose-500' },
              { key: 'login', label: 'Đăng nhập', color: 'text-indigo-500' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  filter === tab.key
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên user, email, IP, action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Người thực hiện (User)</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành động & Phân loại</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thực thể tác động (Entity)</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Địa chỉ IP / Mạng</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Thời gian ghi nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-5">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Shield className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy nhật ký hoạt động nào</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Thử thay đổi bộ lọc sự kiện hoặc từ khóa tìm kiếm</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionInfo = getActionInfo(log.action);
                  const ActionIcon = actionInfo.icon;
                  
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                            {log.user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">{log.user?.name || 'Hệ thống / Ẩn danh'}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              {log.user?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${actionInfo.color}`}>
                          <ActionIcon className="w-3.5 h-3.5" />
                          <span>{actionInfo.label}</span>
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider pl-1">
                          Mã lệnh: {log.action}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-primary-500" />
                            <span>{log.entity || 'Hệ thống chung'}</span>
                          </p>
                          {log.entityId && (
                            <p className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded inline-block">
                              ID: {log.entityId}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.ipAddress || '127.0.0.1 (Localhost)'}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(log.createdAt || Date.now()).toLocaleString('vi-VN')}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Audit;
