import * as projectQ from '../../../queries/project.queries.js';
import * as projectMemberQ from '../../../queries/projectMember.queries.js';
import * as teamMemberQ from '../../../queries/teamMember.queries.js';
import * as wsMemberQ from '../../../queries/workspaceMember.queries.js';

export async function verifyProjectAccess(userId, projectId) {
  const project = await projectQ.findWithTeam(projectId);
  if (!project) {
    return { error: { status: 404, message: 'Project not found.' } };
  }

  const wsMember = await wsMemberQ.findMember(project.workspace_id, userId);
  if (!wsMember) {
    return { error: { status: 403, message: 'Access denied: not a workspace member.' } };
  }

  if (['OWNER', 'ADMIN'].includes(wsMember.role)) {
    const projectMember = await projectMemberQ.findMember(projectId, userId);
    return {
      project,
      role: projectMember ? projectMember.role : 'PROJECT_OWNER',
      isWsAdmin: true,
    };
  }

  if (project.visibility === 'PRIVATE') {
    const member = await projectMemberQ.findMember(projectId, userId);
    if (!member) {
      return { error: { status: 403, message: 'Access denied: not a member of this private project.' } };
    }
    return { project, role: member.role, isWsAdmin: false };
  }

  const teamMember = await teamMemberQ.findMember(project.team_id, userId);
  if (!teamMember) {
    return { error: { status: 403, message: 'Access denied: not a team member.' } };
  }

  const projectMember = await projectMemberQ.findMember(projectId, userId);
  return {
    project,
    role: projectMember
      ? projectMember.role
      : teamMember.role === 'TEAM_OWNER'
        ? 'PROJECT_OWNER'
        : 'PROJECT_MEMBER',
    isWsAdmin: false,
  };
}
