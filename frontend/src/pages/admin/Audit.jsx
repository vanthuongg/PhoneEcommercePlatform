import { useState, useEffect } from 'react';
import { auditAPI } from '../../services/api';
import { Activity, Search, Shield, User, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Audit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { action: filter } : {};
      const res = await auditAPI.getAll(params);
      setLogs(res.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải nhật ký hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('create') || action.includes('login')) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (action.includes('delete')) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (action.includes('update')) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" /> Nhật ký hệ thống (Audit Logs)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Theo dõi hoạt động của quản trị viên và nhân viên trên hệ thống</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {['all', 'create', 'update', 'delete', 'login'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === type ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
              >
                {type === 'all' ? 'Tất cả' : type === 'create' ? 'Tạo mới' : type === 'update' ? 'Cập nhật' : type === 'delete' ? 'Xóa' : 'Đăng nhập'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Tìm kiếm hành động..." className="input-field pl-9 w-64" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Tài khoản</th>
                <th className="p-4 font-semibold">Hành động</th>
                <th className="p-4 font-semibold">Thực thể</th>
                <th className="p-4 font-semibold">IP Address</th>
                <th className="p-4 font-semibold text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Không có dữ liệu nhật ký</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {log.user?.name?.[0]?.toUpperCase() || <User size={14} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{log.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{log.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900 dark:text-gray-100 capitalize">{log.entity}</p>
                      {log.entityId && <p className="text-[10px] font-mono text-gray-400">ID: {log.entityId}</p>}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-gray-500">
                        <Clock size={14} />
                        <span className="text-sm">{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Audit;
