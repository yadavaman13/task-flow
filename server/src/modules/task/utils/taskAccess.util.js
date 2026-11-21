import * as taskQ from '../../../queries/task.queries.js';
import { verifyProjectAccess } from '../../project/utils/projectAccess.util.js';

export async function verifyTaskAccess(userId, taskId) {
  const task = await taskQ.findById(taskId);
  if (!task) {
    return { error: { status: 404, message: 'Task not found.' } };
  }

  const projectAccess = await verifyProjectAccess(userId, task.project_id);
  if (projectAccess.error) {
    return projectAccess;
  }

  return { task, ...projectAccess };
}
