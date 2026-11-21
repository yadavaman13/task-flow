import * as taskQ from '../../../queries/task.queries.js';
import * as activityQ from '../../../queries/activity.queries.js';
import * as notificationQ from '../../../queries/notification.queries.js';
import { verifyProjectAccess } from '../../project/utils/projectAccess.util.js';
import { verifyTaskAccess } from '../utils/taskAccess.util.js';
import { parsePagination } from '../../../core/utils/pagination.js';

export async function create(req, res) {
  try {
    const projectId = req.params.projectId || req.params.pId;
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const normalizedTitle = typeof title === 'string' ? title.trim() : '';

    if (!normalizedTitle) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const access = await verifyProjectAccess(req.user.id, projectId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    if (access.project.status === 'ARCHIVED') {
      return res.status(400).json({ message: 'Cannot create task in archived project.' });
    }

    if (assignedTo) {
      const assigneeAccess = await verifyProjectAccess(assignedTo, projectId);
      if (assigneeAccess.error) {
        return res.status(400).json({ message: 'Assignee must have access to this project.' });
      }
    }

    const resInsert = await taskQ.insert({
      projectId,
      createdBy: req.user.id,
      assignedTo: assignedTo || null,
      title: normalizedTitle,
      description: typeof description === 'string' ? description.trim() : null,
      priority: priority || 'MEDIUM',
      dueDate: dueDate || null,
    });
    const taskId = resInsert.insertId;

    await activityQ.insert({
      actorId: req.user.id,
      workspaceId: access.project.workspace_id,
      projectId,
      taskId,
      action: 'TASK_CREATED',
      metadata: { title: normalizedTitle },
    });

    if (assignedTo && Number(assignedTo) !== Number(req.user.id)) {
      await notificationQ.insert({
        userId: assignedTo,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `You were assigned to task "${normalizedTitle}"`,
        referenceType: 'TASK',
        referenceId: taskId,
      });
    }

    const newTask = await taskQ.findById(taskId);
    return res.status(201).json({
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function list(req, res) {
  try {
    const projectId = req.params.projectId || req.params.pId;
    const access = await verifyProjectAccess(req.user.id, projectId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const { page, limit, offset } = parsePagination(req.query);
    const filter = {
      status: req.query.status,
      priority: req.query.priority,
      assignedTo: req.query.assignedTo ? Number(req.query.assignedTo) : undefined,
      search: req.query.search,
      sortBy: req.query.sortBy,
      order: req.query.order,
      limit,
      offset,
    };

    const [tasks, total] = await Promise.all([
      taskQ.findByProject(projectId, filter),
      taskQ.countByProject(projectId, filter),
    ]);

    return res.status(200).json({
      message: 'Tasks retrieved successfully',
      data: tasks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function get(req, res) {
  try {
    const taskId = req.params.taskId || req.params.tId;
    const access = await verifyTaskAccess(req.user.id, taskId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    return res.status(200).json({
      message: 'Task retrieved successfully',
      data: access.task,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function update(req, res) {
  try {
    const taskId = req.params.taskId || req.params.tId;
    const access = await verifyTaskAccess(req.user.id, taskId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    if (access.project.status === 'ARCHIVED') {
      return res.status(400).json({ message: 'Cannot edit task in archived project.' });
    }

    const { title, description, priority, dueDate } = req.body;
    await taskQ.update(taskId, {
      title: typeof title === 'string' ? title.trim() : undefined,
      description: typeof description === 'string' ? description.trim() : description,
      priority,
      dueDate,
    });

    await activityQ.insert({
      actorId: req.user.id,
      workspaceId: access.project.workspace_id,
      projectId: access.project.id,
      taskId,
      action: 'TASK_UPDATED',
      metadata: req.body,
    });

    const updated = await taskQ.findById(taskId);
    return res.status(200).json({
      message: 'Task updated successfully',
      data: updated,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function updateStatus(req, res) {
  try {
    const taskId = req.params.taskId || req.params.tId;
    const { status } = req.body;

    const access = await verifyTaskAccess(req.user.id, taskId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    if (access.task.status === status) {
      return res.status(200).json({ message: 'Task status unchanged', data: access.task });
    }

    const VALID_TRANSITIONS = {
      TODO: ['IN_PROGRESS'],
      IN_PROGRESS: ['IN_REVIEW', 'BLOCKED'],
      IN_REVIEW: ['COMPLETED', 'IN_PROGRESS'],
      BLOCKED: ['IN_PROGRESS'],
      COMPLETED: ['IN_PROGRESS'],
    };

    const allowed = VALID_TRANSITIONS[access.task.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${access.task.status} to ${status}.`,
      });
    }

    await taskQ.updateStatus(taskId, status);
    const action = status === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGED';

    await activityQ.insert({
      actorId: req.user.id,
      workspaceId: access.project.workspace_id,
      projectId: access.project.id,
      taskId,
      action,
      metadata: { old_status: access.task.status, new_status: status },
    });

    const notifyUser =
      access.task.assigned_to && Number(access.task.assigned_to) !== Number(req.user.id)
        ? access.task.assigned_to
        : Number(access.task.created_by) !== Number(req.user.id)
          ? access.task.created_by
          : null;

    if (notifyUser) {
      await notificationQ.insert({
        userId: notifyUser,
        type: 'TASK_STATUS_CHANGED',
        title: 'Task Status Updated',
        message: `Task "${access.task.title}" status changed to ${status}`,
        referenceType: 'TASK',
        referenceId: taskId,
      });
    }

    const updated = await taskQ.findById(taskId);
    return res.status(200).json({
      message: 'Task status updated successfully',
      data: updated,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function assign(req, res) {
  try {
    const taskId = req.params.taskId || req.params.tId;
    const { assignedTo } = req.body;

    const access = await verifyTaskAccess(req.user.id, taskId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    if (assignedTo) {
      const assigneeAccess = await verifyProjectAccess(assignedTo, access.task.project_id);
      if (assigneeAccess.error) {
        return res.status(400).json({ message: 'Assignee must have access to this project.' });
      }
    }

    await taskQ.updateAssignment(taskId, assignedTo || null);

    await activityQ.insert({
      actorId: req.user.id,
      workspaceId: access.project.workspace_id,
      projectId: access.project.id,
      taskId,
      action: 'TASK_ASSIGNED',
      metadata: { assigned_to: assignedTo },
    });

    if (assignedTo && Number(assignedTo) !== Number(req.user.id)) {
      await notificationQ.insert({
        userId: assignedTo,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned',
        message: `You were assigned to task "${access.task.title}"`,
        referenceType: 'TASK',
        referenceId: taskId,
      });
    }

    const updated = await taskQ.findById(taskId);
    return res.status(200).json({
      message: 'Task assignment updated successfully',
      data: updated,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function remove(req, res) {
  try {
    const taskId = req.params.taskId || req.params.tId;
    const access = await verifyTaskAccess(req.user.id, taskId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const isCreator = Number(access.task.created_by) === Number(req.user.id);
    const isProjectOwner = access.role === 'PROJECT_OWNER';

    if (!isCreator && !isProjectOwner && !access.isWsAdmin) {
      return res.status(403).json({ message: 'Access denied: only task creator or project owner can delete task.' });
    }

    await taskQ.remove(taskId);
    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
