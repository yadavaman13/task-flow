import * as notificationQ from '../../../queries/notification.queries.js';
import { parsePagination } from '../../../core/utils/pagination.js';

export async function list(req, res) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const isRead =
      req.query.isRead !== undefined
        ? req.query.isRead === true || req.query.isRead === 'true'
        : undefined;

    const [notifications, total] = await Promise.all([
      notificationQ.findByUser(req.user.id, { isRead, limit, offset }),
      notificationQ.countByUser(req.user.id, { isRead }),
    ]);

    return res.status(200).json({
      message: 'Notifications retrieved successfully',
      data: notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getUnreadCount(req, res) {
  try {
    const count = await notificationQ.countUnread(req.user.id);
    return res.status(200).json({
      message: 'Unread count retrieved successfully',
      data: { unreadCount: count },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function markRead(req, res) {
  try {
    const notificationId = req.params.id;
    await notificationQ.markRead(notificationId, req.user.id);
    return res.status(200).json({ message: 'Notification marked as read successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function markAllRead(req, res) {
  try {
    await notificationQ.markAllRead(req.user.id);
    return res.status(200).json({ message: 'All notifications marked as read successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
