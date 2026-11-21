import { query, execute } from '../config/db.js';

/** Insert — uses a connection (participates in caller's transaction) or pool. */
export const insert = async (connOrData, maybeData) => {
  const conn = maybeData ? connOrData : null;
  const data = maybeData ? maybeData : connOrData;
  const executor = conn || { query: execute };

  return executor.query(
    `INSERT INTO activity_logs (actor_id, workspace_id, project_id, task_id, action, metadata)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.actorId || null,
      data.workspaceId || null,
      data.projectId || null,
      data.taskId || null,
      data.action,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ]
  );
};

export const findByWorkspace = async (workspaceId, { limit, offset }) =>
  query(
    `SELECT al.*, u.name AS actor_name
       FROM activity_logs al LEFT JOIN users u ON u.id = al.actor_id
      WHERE al.workspace_id = ? ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
    [workspaceId, Number(limit), Number(offset)]
  );

export const findByProject = async (projectId, { limit, offset }) =>
  query(
    `SELECT al.*, u.name AS actor_name
       FROM activity_logs al LEFT JOIN users u ON u.id = al.actor_id
      WHERE al.project_id = ? ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
    [projectId, Number(limit), Number(offset)]
  );

export const findByTask = async (taskId, { limit, offset }) =>
  query(
    `SELECT al.*, u.name AS actor_name
       FROM activity_logs al LEFT JOIN users u ON u.id = al.actor_id
      WHERE al.task_id = ? ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
    [taskId, Number(limit), Number(offset)]
  );

export const countByWorkspace = async (workspaceId) => {
  const [row] = await query('SELECT COUNT(*) AS total FROM activity_logs WHERE workspace_id = ?', [
    workspaceId,
  ]);
  return row ? row.total : 0;
};

export const countByProject = async (projectId) => {
  const [row] = await query('SELECT COUNT(*) AS total FROM activity_logs WHERE project_id = ?', [
    projectId,
  ]);
  return row ? row.total : 0;
};
