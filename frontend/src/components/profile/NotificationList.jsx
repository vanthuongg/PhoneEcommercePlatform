import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { Bell, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationList = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();

  // Vì context fetch ngay từ đầu, ta có thể dùng trực tiếp notifications.
  // Tuy nhiên nếu chưa load xong hoặc là mảng rỗng thì ta cứ render.
  
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Bell size={20} className="text-primary" /> Thông báo của bạn
          </h2>
          <p className="text-xs text-gray-500 mt-1">Cập nhật đơn hàng, ưu đãi và tin tức mới nhất</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            className="text-xs font-bold text-primary hover:underline"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
            <Bell size={28} />
          </div>
          <p className="font-bold text-gray-600 dark:text-gray-400">Bạn chưa có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id || n._id} className={`p-4 rounded-xl border ${n.isRead ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className={`text-sm font-bold ${n.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-primary'}`}>{n.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt || n.time).toLocaleString('vi-VN')}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => markAsRead(n.id || n._id)} className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Đánh dấu đã đọc">
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
