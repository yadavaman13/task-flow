import { query, execute } from '../config/db.js';

/** Find a single membership record. Used by many modules for auth checks. */
export const findMember = async (workspaceId, userId) => {
  const rows = await query(
    'SELECT * FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
    [workspaceId, userId]
  );
  return rows[0];
};

/** All members of a workspace with user details. */
export const findAllByWorkspace = async (workspaceId) =>
  query(
    `SELECT wm.role, wm.joined_at, u.id, u.name, u.email, u.avatar_url
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
      WHERE wm.workspace_id = ?
      ORDER BY FIELD(wm.role, 'OWNER', 'ADMIN', 'MEMBER'), u.name`,
    [workspaceId]
  );

/** Insert member — uses a connection (transaction) or default pool. */
export const insert = async (connOrData, maybeData) => {
  const conn = maybeData ? connOrData : null;
  const data = maybeData ? maybeData : connOrData;
  const executor = conn || { query: execute };
  return executor.query(
    'INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)',
    [data.workspaceId, data.userId, data.role || 'MEMBER']
  );
};

export const updateRole = async (workspaceId, userId, role) =>
  execute(
    'UPDATE workspace_members SET role = ? WHERE workspace_id = ? AND user_id = ?',
    [role, workspaceId, userId]
  );

export const remove = async (workspaceId, userId) =>
  execute(
    'DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
    [workspaceId, userId]
  );
