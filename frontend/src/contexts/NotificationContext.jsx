import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';
import { AlertTriangle, Trash2, Info, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      notificationAPI.getAll()
        .then(res => {
          if (isMounted) setNotifications(res.data);
        })
        .catch(err => console.error('Failed to fetch notifications', err));
    } else {
      setNotifications([]);
    }
    return () => { isMounted = false; };
  }, [user]);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    try {
      await notificationAPI.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    try {
      await notificationAPI.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  }, []);

  const addNotification = useCallback((newNotif) => {
    setNotifications((prev) => [
      { id: Date.now().toString(), time: new Date().toISOString(), isRead: false, ...newNotif },
      ...prev
    ]);
  }, []);

  const addToast = useCallback((msg, type = 'success') => {
    if (toast[type]) {
      toast[type](msg);
    } else {
      toast(msg);
    }
  }, []);

  const showConfirm = useCallback((config) => {
    setConfirmConfig(config);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      addToast,
      showConfirm
    }}>
      {children}

      {/* Global Center-Screen Confirmation Modal (Xác nhận ngay trước màn hình) */}
      {confirmConfig && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-premium border border-slate-200 dark:border-slate-800 animate-scale-in relative overflow-hidden space-y-5">
            {/* Ambient Top Glow */}
            <div className={`absolute top-0 left-0 right-0 h-2 ${
              confirmConfig.type === 'danger' ? 'bg-red-500' : 'bg-amber-500'
            }`} />

            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                confirmConfig.type === 'danger'
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50'
                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
              }`}>
                {confirmConfig.type === 'danger' ? <Trash2 size={26} className="animate-bounce" /> : <AlertTriangle size={26} className="animate-pulse" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug font-display">
                  {confirmConfig.title || 'Xác nhận thao tác'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-medium">
                  {confirmConfig.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setConfirmConfig(null)}
                className="px-5 py-3 rounded-2xl font-extrabold text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                {confirmConfig.cancelText || 'Không, quay lại'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const cb = confirmConfig.onConfirm;
                  setConfirmConfig(null);
                  if (cb) cb();
                }}
                className={`px-6 py-3 rounded-2xl font-extrabold text-xs text-white transition-all shadow-lg flex items-center gap-1.5 active:scale-95 hover:scale-105 ${
                  confirmConfig.type === 'danger'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-500/30 hover:from-red-700 hover:to-rose-700'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-amber-500/30 hover:from-amber-700 hover:to-orange-700'
                }`}
              >
                <Check size={16} />
                <span>{confirmConfig.confirmText || 'Đồng ý xác nhận'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};
