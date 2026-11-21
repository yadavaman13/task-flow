import * as notificationQ from '../../queries/notification.queries.js';
import { parsePagination } from '../../core/utils/pagination.js';

export async function getUserNotifications(userId, query) {
  const { page, limit, offset } = parsePagination(query);
  const isRead =
    query.isRead !== undefined ? query.isRead === true || query.isRead === 'true' : undefined;

  const [notifications, total] = await Promise.all([
    notificationQ.findByUser(userId, { isRead, limit, offset }),
    notificationQ.countByUser(userId, { isRead }),
  ]);

  return { notifications, page, limit, total };
}

export async function getUnreadCount(userId) {
  const count = await notificationQ.countUnread(userId);
  return { unreadCount: count };
}

export async function markAsRead(userId, notificationId) {
  await notificationQ.markRead(notificationId, userId);
  return { success: true };
}

export async function markAllAsRead(userId) {
  await notificationQ.markAllRead(userId);
  return { success: true };
}
