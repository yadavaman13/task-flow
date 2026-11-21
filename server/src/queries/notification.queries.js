import { query, execute } from '../config/db.js';

export const findByUser = async (userId, { isRead, limit, offset }) => {
  const where = ['user_id = ?'];
  const params = [userId];
  if (isRead !== undefined) {
    where.push('is_read = ?');
    params.push(isRead);
  }
  params.push(Number(limit), Number(offset));
  return query(
    `SELECT * FROM notifications WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    params
  );
};

export const countByUser = async (userId, { isRead } = {}) => {
  const where = ['user_id = ?'];
  const params = [userId];
  if (isRead !== undefined) {
    where.push('is_read = ?');
    params.push(isRead);
  }
  const [row] = await query(
    `SELECT COUNT(*) AS total FROM notifications WHERE ${where.join(' AND ')}`,
    params
  );
  return row ? row.total : 0;
};

export const countUnread = async (userId) => {
  const [row] = await query(
    `SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = FALSE`,
    [userId]
  );
  return row ? row.total : 0;
};

export const insert = async ({ userId, type, title, message, referenceType, referenceId }) =>
  execute(
    `INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, type, title, message, referenceType || null, referenceId || null]
  );

export const markRead = async (id, userId) =>
  execute(
    'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
    [id, userId]
  );

export const markAllRead = async (userId) =>
  execute(
    'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );
