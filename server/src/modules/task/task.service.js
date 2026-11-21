import * as taskQ from '../../queries/task.queries.js';
import * as activityQ from '../../queries/activity.queries.js';
import * as notificationQ from '../../queries/notification.queries.js';
import { verifyProjectAccess } from '../project/project.service.js';
import { parsePagination } from '../../core/utils/pagination.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../core/errors/AppError.js';

const VALID_TRANSITIONS = {
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['IN_REVIEW', 'BLOCKED'],
  IN_REVIEW: ['COMPLETED', 'IN_PROGRESS'],
  BLOCKED: ['IN_PROGRESS'],
  COMPLETED: ['IN_PROGRESS'],
};

export async function verifyTaskAccess(userId, taskId) {
  const task = await taskQ.findById(taskId);
  if (!task) {
    throw new NotFoundError('Task');
  }
  const projectAccess = await verifyProjectAccess(userId, task.project_id);
  return { task, ...projectAccess };
}

export async function create(userId, projectId, data) {
  const { project } = await verifyProjectAccess(userId, projectId);
  if (project.status === 'ARCHIVED') {
    throw new BadRequestError('Cannot create task in archived project');
  }

  if (data.assignedTo) {
    const assigneeAccess = await verifyProjectAccess(data.assignedTo, projectId).catch(() => null);
    if (!assigneeAccess) {
      throw new BadRequestError('Assignee must have access to this project');
    }
  }

  const res = await taskQ.insert({
    projectId,
    createdBy: userId,
    assignedTo: data.assignedTo,
    title: data.title,
    description: data.description,
    priority: data.priority,
    dueDate: data.dueDate,
  });
  const taskId = res.insertId;

  await activityQ.insert({
    actorId: userId,
    workspaceId: project.workspace_id,
    projectId,
    taskId,
    action: 'TASK_CREATED',
    metadata: { title: data.title },
  });

  if (data.assignedTo && Number(data.assignedTo) !== Number(userId)) {
    await notificationQ.insert({
      userId: data.assignedTo,
      type: 'TASK_ASSIGNED',
      title: 'New Task Assigned',
      message: `You were assigned to task "${data.title}"`,
      referenceType: 'TASK',
      referenceId: taskId,
    });
  }

  return taskQ.findById(taskId);
}

export async function listByProject(userId, projectId, query) {
  await verifyProjectAccess(userId, projectId);
  const { page, limit, offset } = parsePagination(query);

  const filter = {
    status: query.status,
    priority: query.priority,
    assignedTo: query.assignedTo ? Number(query.assignedTo) : undefined,
    search: query.search,
    sortBy: query.sortBy,
    order: query.order,
    limit,
    offset,
  };

  const [tasks, total] = await Promise.all([
    taskQ.findByProject(projectId, filter),
    taskQ.countByProject(projectId, filter),
  ]);

  return { tasks, page, limit, total };
}

export async function get(userId, taskId) {
  const { task } = await verifyTaskAccess(userId, taskId);
  return task;
}

export async function update(userId, taskId, data) {
  const { task, project } = await verifyTaskAccess(userId, taskId);
  if (project.status === 'ARCHIVED') {
    throw new BadRequestError('Cannot edit task in archived project');
  }

  await taskQ.update(taskId, data);

  await activityQ.insert({
    actorId: userId,
    workspaceId: project.workspace_id,
    projectId: project.id,
    taskId,
    action: 'TASK_UPDATED',
    metadata: data,
  });

  return taskQ.findById(taskId);
}

export async function updateStatus(userId, taskId, newStatus) {
  const { task, project } = await verifyTaskAccess(userId, taskId);
  if (task.status === newStatus) {
    return task;
  }

  const allowed = VALID_TRANSITIONS[task.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new BadRequestError(`Invalid transition from ${task.status} to ${newStatus}`);
  }

  await taskQ.updateStatus(taskId, newStatus);
  const action = newStatus === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGED';

  await activityQ.insert({
    actorId: userId,
    workspaceId: project.workspace_id,
    projectId: project.id,
    taskId,
    action,
    metadata: { old_status: task.status, new_status: newStatus },
  });

  const notifyUser =
    task.assigned_to && Number(task.assigned_to) !== Number(userId)
      ? task.assigned_to
      : Number(task.created_by) !== Number(userId)
        ? task.created_by
        : null;

  if (notifyUser) {
    await notificationQ.insert({
      userId: notifyUser,
      type: 'TASK_STATUS_CHANGED',
      title: 'Task Status Updated',
      message: `Task "${task.title}" status changed to ${newStatus}`,
      referenceType: 'TASK',
      referenceId: taskId,
    });
  }

  return taskQ.findById(taskId);
}

export async function assign(userId, taskId, assignedTo) {
  const { task, project } = await verifyTaskAccess(userId, taskId);

  if (assignedTo) {
    const assigneeAccess = await verifyProjectAccess(assignedTo, task.project_id).catch(() => null);
    if (!assigneeAccess) {
      throw new BadRequestError('Assignee must have access to this project');
    }
  }

  await taskQ.updateAssignment(taskId, assignedTo || null);

  await activityQ.insert({
    actorId: userId,
    workspaceId: project.workspace_id,
    projectId: project.id,
    taskId,
    action: 'TASK_ASSIGNED',
    metadata: { assigned_to: assignedTo },
  });

  if (assignedTo && Number(assignedTo) !== Number(userId)) {
    await notificationQ.insert({
      userId: assignedTo,
      type: 'TASK_ASSIGNED',
      title: 'Task Assigned',
      message: `You were assigned to task "${task.title}"`,
      referenceType: 'TASK',
      referenceId: taskId,
    });
  }

  return taskQ.findById(taskId);
}

export async function remove(userId, taskId) {
  const { task, role, isWsAdmin } = await verifyTaskAccess(userId, taskId);
  const isCreator = Number(task.created_by) === Number(userId);
  const isProjectOwner = role === 'PROJECT_OWNER';

  if (!isCreator && !isProjectOwner && !isWsAdmin) {
    throw new ForbiddenError('Only task creator or project owner can delete task');
  }

  await taskQ.remove(taskId);
  return { success: true };
}
