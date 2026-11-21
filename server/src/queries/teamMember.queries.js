import { query, execute } from '../config/db.js';

export const findMember = async (teamId, userId) => {
  const rows = await query(
    'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?',
    [teamId, userId]
  );
  return rows[0];
};

export const findAllByTeam = async (teamId) =>
  query(
    `SELECT tm.role, tm.joined_at, u.id, u.name, u.email, u.avatar_url
       FROM team_members tm JOIN users u ON u.id = tm.user_id
      WHERE tm.team_id = ? ORDER BY tm.joined_at`,
    [teamId]
  );

export const insert = async (connOrData, maybeData) => {
  const conn = maybeData ? connOrData : null;
  const data = maybeData ? maybeData : connOrData;
  const executor = conn || { query: execute };
  return executor.query(
    'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
    [data.teamId, data.userId, data.role || 'TEAM_MEMBER']
  );
};

export const updateRole = async (teamId, userId, role) =>
  execute('UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?', [
    role,
    teamId,
    userId,
  ]);

export const remove = async (teamId, userId) =>
  execute('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [teamId, userId]);
