import * as notificationService from './notification.service.js';
import { success, paginated } from '../../core/utils/responseHelper.js';

export async function list(req, res) {
  const result = await notificationService.getUserNotifications(req.user.id, req.query);
  return paginated(res, {
    data: result.notifications,
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
}

export async function getUnreadCount(req, res) {
  const result = await notificationService.getUnreadCount(req.user.id);
  return success(res, result);
}

export async function markRead(req, res) {
  const result = await notificationService.markAsRead(req.user.id, req.params.id);
  return success(res, result, 'Notification marked as read');
}

export async function markAllRead(req, res) {
  const result = await notificationService.markAllAsRead(req.user.id);
  return success(res, result, 'All notifications marked as read');
}
