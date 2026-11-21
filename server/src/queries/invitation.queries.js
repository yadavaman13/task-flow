import { query, execute } from '../config/db.js';

export const findByTokenHash = async (tokenHash) => {
  const rows = await query('SELECT * FROM invitations WHERE token_hash = ?', [tokenHash]);
  return rows[0];
};

export const findPending = async (workspaceId, email) => {
  const rows = await query(
    `SELECT * FROM invitations WHERE workspace_id = ? AND email = ? AND status = 'PENDING'`,
    [workspaceId, email]
  );
  return rows[0];
};

export const findByWorkspace = async (workspaceId) =>
  query(
    `SELECT i.*, u.name AS invited_by_name
       FROM invitations i JOIN users u ON u.id = i.invited_by
      WHERE i.workspace_id = ? ORDER BY i.created_at DESC`,
    [workspaceId]
  );

export const findPendingByEmail = async (email) =>
  query(
    `SELECT i.*, w.name AS workspace_name, u.name AS invited_by_name
       FROM invitations i
       JOIN workspaces w ON w.id = i.workspace_id
       JOIN users u ON u.id = i.invited_by
      WHERE i.email = ? AND i.status = 'PENDING' AND i.expires_at > NOW()
      ORDER BY i.created_at DESC`,
    [email]
  );

export const insert = async ({ workspaceId, email, invitedBy, role, tokenHash, expiresAt }) =>
  execute(
    `INSERT INTO invitations (workspace_id, email, invited_by, role, token_hash, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [workspaceId, email, invitedBy, role || 'MEMBER', tokenHash, expiresAt]
  );

/** Update status — uses a connection (transaction) or default pool. */
export const updateStatus = async (connOrId, maybeIdOrStatus, maybeStatus) => {
  let conn = null;
  let id;
  let status;

  if (maybeStatus !== undefined) {
    conn = connOrId;
    id = maybeIdOrStatus;
    status = maybeStatus;
  } else {
    id = connOrId;
    status = maybeIdOrStatus;
  }

  const executor = conn || { query: execute };
  return executor.query(
    `UPDATE invitations SET status = ?, accepted_at = IF(? = 'ACCEPTED', NOW(), NULL) WHERE id = ?`,
    [status, status, id]
  );
};

export const findById = async (id) => {
  const rows = await query('SELECT * FROM invitations WHERE id = ?', [id]);
  return rows[0];
};
