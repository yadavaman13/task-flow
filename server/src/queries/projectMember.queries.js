import { query, execute } from '../config/db.js';

export const findMember = async (projectId, userId) => {
  const rows = await query('SELECT * FROM project_members WHERE project_id = ? AND user_id = ?', [
    projectId,
    userId,
  ]);
  return rows[0];
};

export const findAllByProject = async (projectId) =>
  query(
    `SELECT pm.role, pm.joined_at, u.id, u.name, u.email, u.avatar_url
       FROM project_members pm JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = ? ORDER BY pm.joined_at`,
    [projectId]
  );

export const insert = async (connOrData, maybeData) => {
  const conn = maybeData ? connOrData : null;
  const data = maybeData ? maybeData : connOrData;
  const executor = conn || { query: execute };
  return executor.query(
    'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
    [data.projectId, data.userId, data.role || 'PROJECT_MEMBER']
  );
};

export const remove = async (projectId, userId) =>
  execute('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, userId]);
