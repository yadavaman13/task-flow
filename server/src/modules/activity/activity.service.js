import * as activityQ from '../../queries/activity.queries.js';
import * as wsMemberQ from '../../queries/workspaceMember.queries.js';
import { verifyProjectAccess } from '../project/project.service.js';
import { verifyTaskAccess } from '../task/task.service.js';
import { parsePagination } from '../../core/utils/pagination.js';
import { ForbiddenError } from '../../core/errors/AppError.js';

export async function getByWorkspace(userId, workspaceId, query) {
  const member = await wsMemberQ.findMember(workspaceId, userId);
  if (!member) {
    throw new ForbiddenError('Not a workspace member');
  }

  const { page, limit, offset } = parsePagination(query);
  const [logs, total] = await Promise.all([
    activityQ.findByWorkspace(workspaceId, { limit, offset }),
    activityQ.countByWorkspace(workspaceId),
  ]);

  return { logs, page, limit, total };
}

export async function getByProject(userId, projectId, query) {
  await verifyProjectAccess(userId, projectId);
  const { page, limit, offset } = parsePagination(query);
  const [logs, total] = await Promise.all([
    activityQ.findByProject(projectId, { limit, offset }),
    activityQ.countByProject(projectId),
  ]);

  return { logs, page, limit, total };
}

export async function getByTask(userId, taskId, query) {
  await verifyTaskAccess(userId, taskId);
  const { page, limit, offset } = parsePagination(query);
  const logs = await activityQ.findByTask(taskId, { limit, offset });
  return { logs, page, limit, total: logs.length };
}
