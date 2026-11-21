import * as dashboardService from './dashboard.service.js';
import { success } from '../../core/utils/responseHelper.js';

export async function getWorkspace(req, res) {
  const workspaceId = req.params.workspaceId || req.params.wId;
  const stats = await dashboardService.getWorkspaceDashboard(req.user.id, workspaceId);
  return success(res, stats);
}

export async function getTeam(req, res) {
  const teamId = req.params.teamId || req.params.tId;
  const stats = await dashboardService.getTeamDashboard(req.user.id, teamId);
  return success(res, stats);
}

export async function getProject(req, res) {
  const projectId = req.params.projectId || req.params.pId;
  const stats = await dashboardService.getProjectDashboard(req.user.id, projectId);
  return success(res, stats);
}

export async function getProjectWorkload(req, res) {
  const projectId = req.params.projectId || req.params.pId;
  const workload = await dashboardService.getProjectWorkload(req.user.id, projectId);
  return success(res, workload);
}
