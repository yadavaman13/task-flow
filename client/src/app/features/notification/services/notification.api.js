import api from '@/lib/axios';

export const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const fetchUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};
