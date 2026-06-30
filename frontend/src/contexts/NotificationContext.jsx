import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};
