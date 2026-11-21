import { query, execute } from '../config/db.js';

export const findById = async (id) => {
  const rows = await query('SELECT * FROM teams WHERE id = ?', [id]);
  return rows[0];
};

export const findByWorkspace = async (workspaceId) =>
  query('SELECT * FROM teams WHERE workspace_id = ? ORDER BY name', [workspaceId]);

/** Team with its workspace_id — useful for auth chain lookups. */
export const findWithWorkspace = async (teamId) => {
  const rows = await query(
    'SELECT t.*, w.owner_id AS workspace_owner_id FROM teams t JOIN workspaces w ON w.id = t.workspace_id WHERE t.id = ?',
    [teamId]
  );
  return rows[0];
};

export const insert = async (connOrData, maybeData) => {
  const conn = maybeData ? connOrData : null;
  const data = maybeData ? maybeData : connOrData;
  const executor = conn || { query: execute };
  return executor.query(
    'INSERT INTO teams (workspace_id, name, description, created_by) VALUES (?, ?, ?, ?)',
    [data.workspaceId, data.name, data.description || null, data.createdBy]
  );
};

export const update = async (id, fields) =>
  execute(
    'UPDATE teams SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?',
    [fields.name || null, fields.description !== undefined ? fields.description : null, id]
  );

export const updateStatus = async (id, status) =>
  execute('UPDATE teams SET status = ? WHERE id = ?', [status, id]);
