import * as projectQ from '../../queries/project.queries.js';
import * as projectMemberQ from '../../queries/projectMember.queries.js';
import * as teamQ from '../../queries/team.queries.js';
import * as teamMemberQ from '../../queries/teamMember.queries.js';
import * as wsMemberQ from '../../queries/workspaceMember.queries.js';
import * as activityQ from '../../queries/activity.queries.js';
import * as notificationQ from '../../queries/notification.queries.js';
import { pool } from '../../config/db.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../core/errors/AppError.js';

export async function verifyProjectAccess(userId, projectId) {
  const project = await projectQ.findWithTeam(projectId);
  if (!project) {
    throw new NotFoundError('Project');
  }

  const wsMember = await wsMemberQ.findMember(project.workspace_id, userId);
  if (!wsMember) {
    throw new ForbiddenError('Not a workspace member');
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
      throw new ForbiddenError('Not a project member');
    }
    return { project, role: member.role, isWsAdmin: false };
  }

  const teamMember = await teamMemberQ.findMember(project.team_id, userId);
  if (!teamMember) {
    throw new ForbiddenError('Not a team member');
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

export async function create(userId, teamId, data) {
  const team = await teamQ.findById(teamId);
  if (!team) {
    throw new NotFoundError('Team');
  }
  if (team.status === 'ARCHIVED') {
    throw new BadRequestError('Cannot create project in archived team');
  }

  const teamMember = await teamMemberQ.findMember(teamId, userId);
  const wsMember = await wsMemberQ.findMember(team.workspace_id, userId);
  if (!teamMember && (!wsMember || !['OWNER', 'ADMIN'].includes(wsMember.role))) {
    throw new ForbiddenError('Must be a team member to create projects');
  }

  if (data.startDate && data.dueDate && new Date(data.dueDate) < new Date(data.startDate)) {
    throw new BadRequestError('Due date must be after or equal to start date');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [res] = await projectQ.insert(conn, {
      teamId,
      name: data.name,
      description: data.description,
      createdBy: userId,
      visibility: data.visibility || 'TEAM',
      status: data.status || 'PLANNING',
      startDate: data.startDate,
      dueDate: data.dueDate,
    });
    const projectId = res.insertId;

    await projectMemberQ.insert(conn, {
      projectId,
      userId,
      role: 'PROJECT_OWNER',
    });

    await activityQ.insert(conn, {
      actorId: userId,
      workspaceId: team.workspace_id,
      projectId,
      action: 'PROJECT_CREATED',
      metadata: { project_name: data.name },
    });

    await conn.commit();
    return {
      id: projectId,
      team_id: Number(teamId),
      ...data,
      created_by: userId,
      role: 'PROJECT_OWNER',
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getByTeam(userId, teamId) {
  const team = await teamQ.findById(teamId);
  if (!team) {
    throw new NotFoundError('Team');
  }

  const teamMember = await teamMemberQ.findMember(teamId, userId);
  const wsMember = await wsMemberQ.findMember(team.workspace_id, userId);
  if (!teamMember && (!wsMember || !['OWNER', 'ADMIN'].includes(wsMember.role))) {
    throw new ForbiddenError('Not a team member');
  }

  if (wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role)) {
    return projectQ.findByTeam(teamId);
  }
  return projectQ.findAccessibleByTeam(teamId, userId);
}

export async function get(userId, projectId) {
  const { project, role } = await verifyProjectAccess(userId, projectId);
  return { ...project, role };
}

export async function update(userId, projectId, data) {
  const { project, role, isWsAdmin } = await verifyProjectAccess(userId, projectId);
  if (role !== 'PROJECT_OWNER' && !isWsAdmin) {
    throw new ForbiddenError('Only project owner or workspace admin can update project');
  }

  if (data.startDate && data.dueDate && new Date(data.dueDate) < new Date(data.startDate)) {
    throw new BadRequestError('Due date must be after or equal to start date');
  }

  await projectQ.update(projectId, data);

  await activityQ.insert({
    actorId: userId,
    workspaceId: project.workspace_id,
    projectId,
    action: 'PROJECT_UPDATED',
    metadata: data,
  });

  return projectQ.findById(projectId);
}

export async function archive(userId, projectId) {
  const { project, role, isWsAdmin } = await verifyProjectAccess(userId, projectId);
  if (role !== 'PROJECT_OWNER' && !isWsAdmin) {
    throw new ForbiddenError('Only project owner or workspace admin can archive project');
  }

  await projectQ.updateStatus(projectId, 'ARCHIVED');

  await activityQ.insert({
    actorId: userId,
    workspaceId: project.workspace_id,
    projectId,
    action: 'PROJECT_ARCHIVED',
  });

  return { success: true, status: 'ARCHIVED' };
}

export async function getMembers(userId, projectId) {
  await verifyProjectAccess(userId, projectId);
  return projectMemberQ.findAllByProject(projectId);
}

export async function addMember(userId, projectId, targetId, role = 'PROJECT_MEMBER') {
  const { project, role: callerRole, isWsAdmin } = await verifyProjectAccess(userId, projectId);
  if (callerRole !== 'PROJECT_OWNER' && !isWsAdmin) {
    throw new ForbiddenError('Only project owner can add members');
  }

  const targetTeamMember = await teamMemberQ.findMember(project.team_id, targetId);
  if (!targetTeamMember) {
    throw new BadRequestError('User must be a member of the team to be added to project');
  }

  const existing = await projectMemberQ.findMember(projectId, targetId);
  if (existing) {
    throw new ConflictError('User is already a project member');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await projectMemberQ.insert(conn, {
      projectId,
      userId: targetId,
      role: role || 'PROJECT_MEMBER',
    });

    await activityQ.insert(conn, {
      actorId: userId,
      workspaceId: project.workspace_id,
      projectId,
      action: 'PROJECT_MEMBER_ADDED',
      metadata: { project_id: projectId, user_id: targetId, role: role || 'PROJECT_MEMBER' },
    });

    await notificationQ.insert({
      userId: targetId,
      type: 'PROJECT_ADDED',
      title: 'Added to Project',
      message: `You were added to project ${project.name}`,
      referenceType: 'PROJECT',
      referenceId: projectId,
    });

    await conn.commit();
    return { projectId: Number(projectId), userId: Number(targetId), role: role || 'PROJECT_MEMBER' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function removeMember(userId, projectId, targetId) {
  const { project, role: callerRole, isWsAdmin } = await verifyProjectAccess(userId, projectId);
  const isSelf = Number(userId) === Number(targetId);

  if (callerRole !== 'PROJECT_OWNER' && !isWsAdmin && !isSelf) {
    throw new ForbiddenError('Insufficient permissions to remove member');
  }

  const target = await projectMemberQ.findMember(projectId, targetId);
  if (!target) {
    throw new NotFoundError('Project member');
  }

  if (target.role === 'PROJECT_OWNER') {
    const all = await projectMemberQ.findAllByProject(projectId);
    const owners = all.filter((m) => m.role === 'PROJECT_OWNER');
    if (owners.length <= 1) {
      throw new BadRequestError('Cannot remove the only project owner');
    }
  }

  await projectMemberQ.remove(projectId, targetId);
  return { success: true };
}
