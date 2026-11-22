import { query, execute } from '../config/db.js';

export const findById = async (id) => {
  const rows = await query('SELECT * FROM tasks WHERE id = ?', [id]);
  return rows[0];
};

/** Task with project context — for access chain. */
export const findWithProject = async (taskId) => {
  const rows = await query(
    `SELECT t.*, p.team_id, p.visibility, p.status AS project_status
       FROM tasks t JOIN projects p ON p.id = t.project_id
      WHERE t.id = ?`,
    [taskId]
  );
  return rows[0];
};

/**
 * Dynamic filtered query for tasks in a project.
 * Supports status, priority, assignedTo, search, sort, pagination.
 */
export const findByProject = async (
  projectId,
  { status, priority, assignedTo, search, sortBy, order, limit, offset }
) => {
  const where = ['t.project_id = ?'];
  const params = [projectId];

  if (status) {
    where.push('t.status = ?');
    params.push(status);
  }
  if (priority) {
    where.push('t.priority = ?');
    params.push(priority);
  }
  if (assignedTo) {
    where.push('t.assigned_to = ?');
    params.push(assignedTo);
  }
  if (search) {
    where.push('t.title LIKE ?');
    params.push(`%${search}%`);
  }

  const ALLOWED_SORT = new Set(['created_at', 'updated_at', 'due_date', 'priority', 'status']);
  const ALLOWED_ORDER = new Set(['asc', 'desc']);
  const safeSortBy = ALLOWED_SORT.has(sortBy) ? sortBy : 'created_at';
  const safeOrder = ALLOWED_ORDER.has(order) ? order : 'desc';

  params.push(Number(limit), Number(offset));
  return query(
    `SELECT t.*, u.name AS assignee_name, c.name AS creator_name
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assigned_to
       JOIN users c ON c.id = t.created_by
      WHERE ${where.join(' AND ')}
      ORDER BY t.${safeSortBy} ${safeOrder}
      LIMIT ? OFFSET ?`,
    params
  );
};

/** Count for pagination. Same dynamic WHERE but no JOIN/ORDER/LIMIT. */
export const countByProject = async (projectId, { status, priority, assignedTo, search }) => {
  const where = ['project_id = ?'];
  const params = [projectId];

  if (status) {
    where.push('status = ?');
    params.push(status);
  }
  if (priority) {
    where.push('priority = ?');
    params.push(priority);
  }
  if (assignedTo) {
    where.push('assigned_to = ?');
    params.push(assignedTo);
  }
  if (search) {
    where.push('title LIKE ?');
    params.push(`%${search}%`);
  }

  const [row] = await query(
    `SELECT COUNT(*) AS total FROM tasks WHERE ${where.join(' AND ')}`,
    params
  );
  return row ? row.total : 0;
};

export const insert = async ({
  projectId,
  createdBy,
  assignedTo,
  title,
  description,
  priority,
  dueDate,
}) =>
  execute(
    `INSERT INTO tasks (project_id, created_by, assigned_to, title, description, priority, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      projectId,
      createdBy,
      assignedTo || null,
      title,
      description || null,
      priority || 'MEDIUM',
      dueDate || null,
    ]
  );

export const update = async (id, fields) =>
  execute(
    `UPDATE tasks SET 
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       priority = COALESCE(?, priority),
       due_date = COALESCE(?, due_date)
     WHERE id = ?`,
    [
      fields.title || null,
      fields.description !== undefined ? fields.description : null,
      fields.priority || null,
      fields.dueDate || null,
      id,
    ]
  );

export const updateStatus = async (id, status) =>
  execute(
    `UPDATE tasks SET status = ?, completed_at = IF(? = 'COMPLETED', NOW(), NULL) WHERE id = ?`,
    [status, status, id]
  );

export const updateAssignment = async (id, assignedTo) =>
  execute('UPDATE tasks SET assigned_to = ? WHERE id = ?', [assignedTo || null, id]);

export const remove = async (id) => execute('DELETE FROM tasks WHERE id = ?', [id]);
