import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNotificationContext } from '../context/notification.context';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notification.api';

export function useNotification() {
  const {
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    loading,
    setLoading,
    setError,
  } = useNotificationContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications();
      const list = res.data || [];
      setNotifications(list);
      return { success: true, data: list };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load notifications';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setNotifications, setError]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await fetchUnreadCount();
      const count = res.data?.unreadCount ?? 0;
      setUnreadCount(count);
      return { success: true, count };
    } catch {
      return { success: false, count: 0 };
    }
  }, [setUnreadCount]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark as read';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsSubmitting(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark all as read';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    isSubmitting,
    loadNotifications,
    loadUnreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
}
