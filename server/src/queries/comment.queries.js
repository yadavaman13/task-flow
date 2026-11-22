import { query, execute } from '../config/db.js';

export const findByTask = async (taskId) =>
  query(
    `SELECT c.*, u.name AS author_name, u.avatar_url AS author_avatar
       FROM task_comments c JOIN users u ON u.id = c.user_id
      WHERE c.task_id = ? ORDER BY c.created_at ASC`,
    [taskId]
  );

export const findById = async (id) => {
  const rows = await query('SELECT * FROM task_comments WHERE id = ?', [id]);
  return rows[0];
};

export const insert = async ({ taskId, userId, comment }) =>
  execute('INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)', [
    taskId,
    userId,
    comment,
  ]);

export const update = async (id, comment) =>
  execute('UPDATE task_comments SET comment = ? WHERE id = ?', [comment, id]);

export const remove = async (id) => execute('DELETE FROM task_comments WHERE id = ?', [id]);
