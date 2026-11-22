import { query, execute } from '../config/db.js';

export const findById = async (id) => {
  const rows = await query('SELECT * FROM workspaces WHERE id = ?', [id]);
  return rows[0];
};

/** All workspaces a user belongs to (joins workspace_members). */
export const findByUser = async (userId) =>
  query(
    `SELECT w.*, wm.role
       FROM workspaces w
       JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE wm.user_id = ? ORDER BY w.name`,
    [userId]
  );

/** Insert workspace — uses a connection (for transactions) or default pool. */
export const insert = async (connOrData, maybeData) => {
  const conn = maybeData ? connOrData : null;
  const data = maybeData ? maybeData : connOrData;
  const executor = conn || { query: execute };
  return executor.query('INSERT INTO workspaces (name, description, owner_id) VALUES (?, ?, ?)', [
    data.name,
    data.description || null,
    data.ownerId,
  ]);
};

export const update = async (id, { name, description }) =>
  execute(
    'UPDATE workspaces SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?',
    [name || null, description !== undefined ? description : null, id]
  );
