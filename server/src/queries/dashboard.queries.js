import { query } from '../config/db.js';

export const projectTaskStats = async (projectId) =>
  query(
    `SELECT
       COUNT(*)                                                            AS total_tasks,
       SUM(status = 'COMPLETED')                                           AS completed,
       SUM(status = 'IN_PROGRESS')                                         AS in_progress,
       SUM(status = 'IN_REVIEW')                                           AS in_review,
       SUM(status = 'BLOCKED')                                             AS blocked,
       SUM(status = 'TODO')                                                AS todo,
       SUM(due_date < NOW() AND status <> 'COMPLETED')                     AS overdue,
       ROUND(SUM(status = 'COMPLETED') / NULLIF(COUNT(*), 0) * 100, 1)    AS completion_pct
     FROM tasks WHERE project_id = ?`,
    [projectId]
  );

export const projectTasksByPriority = async (projectId) =>
  query('SELECT priority, COUNT(*) AS count FROM tasks WHERE project_id = ? GROUP BY priority', [
    projectId,
  ]);

export const projectWorkload = async (projectId) =>
  query(
    `SELECT u.id, u.name, u.avatar_url,
            COUNT(t.id) AS assigned_tasks,
            SUM(t.status = 'COMPLETED') AS completed,
            SUM(t.due_date < NOW() AND t.status <> 'COMPLETED') AS overdue
       FROM tasks t JOIN users u ON u.id = t.assigned_to
      WHERE t.project_id = ?
      GROUP BY u.id, u.name, u.avatar_url ORDER BY assigned_tasks DESC`,
    [projectId]
  );

export const workspaceStats = async (workspaceId) =>
  query(
    `SELECT
       (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = ?)                              AS total_members,
       (SELECT COUNT(*) FROM teams WHERE workspace_id = ? AND status = 'ACTIVE')                     AS total_teams,
       (SELECT COUNT(*) FROM projects p JOIN teams t ON t.id = p.team_id WHERE t.workspace_id = ? AND p.status = 'ACTIVE')    AS active_projects,
       (SELECT COUNT(*) FROM projects p JOIN teams t ON t.id = p.team_id WHERE t.workspace_id = ? AND p.status = 'COMPLETED') AS completed_projects`,
    [workspaceId, workspaceId, workspaceId, workspaceId]
  );

export const teamStats = async (teamId) =>
  query(
    `SELECT
       (SELECT COUNT(*) FROM team_members WHERE team_id = ?)                                                                    AS team_members,
       (SELECT COUNT(*) FROM projects WHERE team_id = ? AND status = 'ACTIVE')                                                   AS active_projects,
       (SELECT COUNT(*) FROM tasks t JOIN projects p ON p.id = t.project_id WHERE p.team_id = ? AND t.status <> 'COMPLETED')     AS open_tasks,
       (SELECT COUNT(*) FROM tasks t JOIN projects p ON p.id = t.project_id WHERE p.team_id = ? AND t.due_date < NOW() AND t.status <> 'COMPLETED') AS overdue_tasks`,
    [teamId, teamId, teamId, teamId]
  );
