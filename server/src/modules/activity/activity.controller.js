import * as activityService from './activity.service.js';
import { paginated } from '../../core/utils/responseHelper.js';

export async function getByWorkspace(req, res) {
  const workspaceId = req.params.workspaceId || req.params.wId;
  const result = await activityService.getByWorkspace(req.user.id, workspaceId, req.query);
  return paginated(res, {
    data: result.logs,
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
}

export async function getByProject(req, res) {
  const projectId = req.params.projectId || req.params.pId;
  const result = await activityService.getByProject(req.user.id, projectId, req.query);
  return paginated(res, {
    data: result.logs,
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
}

export async function getByTask(req, res) {
  const taskId = req.params.taskId || req.params.tId;
  const result = await activityService.getByTask(req.user.id, taskId, req.query);
  return paginated(res, {
    data: result.logs,
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
}
