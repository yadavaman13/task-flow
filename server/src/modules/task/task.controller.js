import * as taskService from './task.service.js';
import { success, created, paginated, noContent } from '../../core/utils/responseHelper.js';

export async function create(req, res) {
  const projectId = req.params.projectId || req.params.pId;
  const task = await taskService.create(req.user.id, projectId, req.body);
  return created(res, task, 'Task created successfully');
}

export async function list(req, res) {
  const projectId = req.params.projectId || req.params.pId;
  const result = await taskService.listByProject(req.user.id, projectId, req.query);
  return paginated(res, {
    data: result.tasks,
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
}

export async function get(req, res) {
  const taskId = req.params.taskId || req.params.tId;
  const task = await taskService.get(req.user.id, taskId);
  return success(res, task);
}

export async function update(req, res) {
  const taskId = req.params.taskId || req.params.tId;
  const task = await taskService.update(req.user.id, taskId, req.body);
  return success(res, task, 'Task updated successfully');
}

export async function updateStatus(req, res) {
  const taskId = req.params.taskId || req.params.tId;
  const task = await taskService.updateStatus(req.user.id, taskId, req.body.status);
  return success(res, task, 'Task status updated successfully');
}

export async function assign(req, res) {
  const taskId = req.params.taskId || req.params.tId;
  const task = await taskService.assign(req.user.id, taskId, req.body.assignedTo);
  return success(res, task, 'Task assigned successfully');
}

export async function remove(req, res) {
  const taskId = req.params.taskId || req.params.tId;
  await taskService.remove(req.user.id, taskId);
  return noContent(res);
}
