import { query, execute } from '../config/db.js';

export const findById = async (id) => {
  const rows = await query('SELECT * FROM projects WHERE id = ?', [id]);
  return rows[0];
};

/** Project with team and workspace context — for access chain. */
export const findWithTeam = async (projectId) => {
  const rows = await query(
    `SELECT p.*, t.workspace_id, t.status AS team_status
       FROM projects p JOIN teams t ON t.id = p.team_id
      WHERE p.id = ?`,
    [projectId]
  );
  return rows[0];
};

/** Accessible projects: TEAM-visible + PRIVATE that user is a member of. */
export const findAccessibleByTeam = async (teamId, userId) =>
  query(
    `SELECT p.* FROM projects p
      WHERE p.team_id = ?
        AND (p.visibility = 'TEAM'
             OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = ?))
      ORDER BY p.name`,
    [teamId, userId]
  );

export const findByTeam = async (teamId) =>
  query('SELECT * FROM projects WHERE team_id = ? ORDER BY name', [teamId]);

export const insert = async (connOrData, maybeData) => {
  const conn = maybeData ? connOrData : null;
  const data = maybeData ? maybeData : connOrData;
  const executor = conn || { query: execute };
  return executor.query(
    `INSERT INTO projects (team_id, name, description, created_by, visibility, status, start_date, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.teamId,
      data.name,
      data.description || null,
      data.createdBy,
      data.visibility || 'TEAM',
      data.status || 'PLANNING',
      data.startDate || null,
      data.dueDate || null,
    ]
  );
};

export const update = async (id, fields) =>
  execute(
    `UPDATE projects SET 
       name = COALESCE(?, name),
       description = COALESCE(?, description),
       visibility = COALESCE(?, visibility),
       status = COALESCE(?, status),
       start_date = COALESCE(?, start_date),
       due_date = COALESCE(?, due_date)
     WHERE id = ?`,
    [
      fields.name || null,
      fields.description !== undefined ? fields.description : null,
      fields.visibility || null,
      fields.status || null,
      fields.startDate || null,
      fields.dueDate || null,
      id,
    ]
  );

export const updateStatus = async (id, status) =>
  execute('UPDATE projects SET status = ? WHERE id = ?', [status, id]);
