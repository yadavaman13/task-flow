import * as dashboardQ from '../../../queries/dashboard.queries.js';
import * as wsMemberQ from '../../../queries/workspaceMember.queries.js';
import * as teamQ from '../../../queries/team.queries.js';
import { verifyProjectAccess } from '../../project/utils/projectAccess.util.js';

export async function getWorkspace(req, res) {
  try {
    const workspaceId = req.params.workspaceId || req.params.wId;
    const wsMember = await wsMemberQ.findMember(workspaceId, req.user.id);
    if (!wsMember) {
      return res.status(403).json({ message: 'Access denied: not a workspace member.' });
    }

    const [stats] = await dashboardQ.workspaceStats(workspaceId);
    return res.status(200).json({
      message: 'Workspace dashboard stats retrieved successfully',
      data: stats || {},
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getTeam(req, res) {
  try {
    const teamId = req.params.teamId || req.params.tId;
    const team = await teamQ.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const wsMember = await wsMemberQ.findMember(team.workspace_id, req.user.id);
    if (!wsMember) {
      return res.status(403).json({ message: 'Access denied: not a workspace member.' });
    }

    const [stats] = await dashboardQ.teamStats(teamId);
    return res.status(200).json({
      message: 'Team dashboard stats retrieved successfully',
      data: stats || {},
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getProject(req, res) {
  try {
    const projectId = req.params.projectId || req.params.pId;
    const access = await verifyProjectAccess(req.user.id, projectId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const [[taskStats], priorityBreakdown] = await Promise.all([
      dashboardQ.projectTaskStats(projectId),
      dashboardQ.projectTasksByPriority(projectId),
    ]);

    return res.status(200).json({
      message: 'Project dashboard stats retrieved successfully',
      data: { ...(taskStats || {}), by_priority: priorityBreakdown },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getProjectWorkload(req, res) {
  try {
    const projectId = req.params.projectId || req.params.pId;
    const access = await verifyProjectAccess(req.user.id, projectId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const workload = await dashboardQ.projectWorkload(projectId);
    return res.status(200).json({
      message: 'Project workload retrieved successfully',
      data: workload,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
