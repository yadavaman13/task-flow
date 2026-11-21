import * as activityQ from '../../../queries/activity.queries.js';
import * as wsMemberQ from '../../../queries/workspaceMember.queries.js';
import { verifyProjectAccess } from '../../project/utils/projectAccess.util.js';
import { verifyTaskAccess } from '../../task/utils/taskAccess.util.js';
import { parsePagination } from '../../../core/utils/pagination.js';

export async function getByWorkspace(req, res) {
  try {
    const workspaceId = req.params.workspaceId || req.params.wId;
    const member = await wsMemberQ.findMember(workspaceId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access denied: not a workspace member.' });
    }

    const { page, limit, offset } = parsePagination(req.query);
    const [logs, total] = await Promise.all([
      activityQ.findByWorkspace(workspaceId, { limit, offset }),
      activityQ.countByWorkspace(workspaceId),
    ]);

    return res.status(200).json({
      message: 'Workspace activities retrieved successfully',
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getByProject(req, res) {
  try {
    const projectId = req.params.projectId || req.params.pId;
    const access = await verifyProjectAccess(req.user.id, projectId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const { page, limit, offset } = parsePagination(req.query);
    const [logs, total] = await Promise.all([
      activityQ.findByProject(projectId, { limit, offset }),
      activityQ.countByProject(projectId),
    ]);

    return res.status(200).json({
      message: 'Project activities retrieved successfully',
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getByTask(req, res) {
  try {
    const taskId = req.params.taskId || req.params.tId;
    const access = await verifyTaskAccess(req.user.id, taskId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const { page, limit, offset } = parsePagination(req.query);
    const logs = await activityQ.findByTask(taskId, { limit, offset });

    return res.status(200).json({
      message: 'Task activities retrieved successfully',
      data: logs,
      pagination: { page, limit, total: logs.length, totalPages: 1 },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
