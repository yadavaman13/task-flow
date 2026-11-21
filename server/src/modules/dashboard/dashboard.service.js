import * as dashboardQ from './dashboard.queries.js';
import * as wsMemberQ from '../../queries/workspaceMember.queries.js';
import * as teamQ from '../../queries/team.queries.js';
import { verifyProjectAccess } from '../project/project.service.js';
import { ForbiddenError, NotFoundError } from '../../core/errors/AppError.js';

export async function getWorkspaceDashboard(userId, workspaceId) {
  const wsMember = await wsMemberQ.findMember(workspaceId, userId);
  if (!wsMember) {
    throw new ForbiddenError('Not a workspace member');
  }

  const [stats] = await dashboardQ.workspaceStats(workspaceId);
  return stats || {};
}

export async function getTeamDashboard(userId, teamId) {
  const team = await teamQ.findById(teamId);
  if (!team) {
    throw new NotFoundError('Team');
  }

  const wsMember = await wsMemberQ.findMember(team.workspace_id, userId);
  if (!wsMember) {
    throw new ForbiddenError('Not a workspace member');
  }

  const [stats] = await dashboardQ.teamStats(teamId);
  return stats || {};
}

export async function getProjectDashboard(userId, projectId) {
  await verifyProjectAccess(userId, projectId);

  const [[taskStats], priorityBreakdown] = await Promise.all([
    dashboardQ.projectTaskStats(projectId),
    dashboardQ.projectTasksByPriority(projectId),
  ]);

  return { ...(taskStats || {}), by_priority: priorityBreakdown };
}

export async function getProjectWorkload(userId, projectId) {
  await verifyProjectAccess(userId, projectId);
  return dashboardQ.projectWorkload(projectId);
}
