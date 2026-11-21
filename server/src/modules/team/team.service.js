import * as teamQ from '../../queries/team.queries.js';
import * as teamMemberQ from '../../queries/teamMember.queries.js';
import * as wsMemberQ from '../../queries/workspaceMember.queries.js';
import * as activityQ from '../../queries/activity.queries.js';
import { pool } from '../../config/db.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../core/errors/AppError.js';

export async function create(userId, workspaceId, data) {
  const member = await wsMemberQ.findMember(workspaceId, userId);
  if (!member) {
    throw new ForbiddenError('Not a workspace member');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await teamQ.insert(conn, {
      workspaceId,
      name: data.name,
      description: data.description,
      createdBy: userId,
    });
    const teamId = result.insertId;

    await teamMemberQ.insert(conn, {
      teamId,
      userId,
      role: 'TEAM_OWNER',
    });

    await activityQ.insert(conn, {
      actorId: userId,
      workspaceId,
      action: 'TEAM_CREATED',
      metadata: { team_name: data.name },
    });

    await conn.commit();
    return {
      id: teamId,
      workspace_id: Number(workspaceId),
      name: data.name,
      description: data.description || null,
      created_by: userId,
      role: 'TEAM_OWNER',
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getByWorkspace(userId, workspaceId) {
  const member = await wsMemberQ.findMember(workspaceId, userId);
  if (!member) {
    throw new ForbiddenError('Not a workspace member');
  }

  return teamQ.findByWorkspace(workspaceId);
}

export async function get(userId, teamId) {
  const team = await teamQ.findById(teamId);
  if (!team) {
    throw new NotFoundError('Team');
  }

  const wsMember = await wsMemberQ.findMember(team.workspace_id, userId);
  if (!wsMember) {
    throw new ForbiddenError('Not a workspace member');
  }

  const teamMember = await teamMemberQ.findMember(teamId, userId);
  return { ...team, role: teamMember ? teamMember.role : null };
}

export async function update(userId, teamId, data) {
  const team = await teamQ.findById(teamId);
  if (!team) {
    throw new NotFoundError('Team');
  }

  if (team.status === 'ARCHIVED') {
    throw new BadRequestError('Cannot update an archived team');
  }

  const wsMember = await wsMemberQ.findMember(team.workspace_id, userId);
  const teamMember = await teamMemberQ.findMember(teamId, userId);
  const isWsAdminOrOwner = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
  const isTeamOwner = teamMember && teamMember.role === 'TEAM_OWNER';

  if (!isWsAdminOrOwner && !isTeamOwner) {
    throw new ForbiddenError('Insufficient permissions to update team');
  }

  await teamQ.update(teamId, data);
  return teamQ.findById(teamId);
}

export async function archive(userId, teamId) {
  const team = await teamQ.findById(teamId);
  if (!team) {
    throw new NotFoundError('Team');
  }

  const wsMember = await wsMemberQ.findMember(team.workspace_id, userId);
  const teamMember = await teamMemberQ.findMember(teamId, userId);
  const isWsAdminOrOwner = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
  const isTeamOwner = teamMember && teamMember.role === 'TEAM_OWNER';

  if (!isWsAdminOrOwner && !isTeamOwner) {
    throw new ForbiddenError('Insufficient permissions to archive team');
  }

  await teamQ.updateStatus(teamId, 'ARCHIVED');
  return { success: true, status: 'ARCHIVED' };
}

export async function addMember(userId, teamId, targetId, role = 'TEAM_MEMBER') {
  const team = await teamQ.findById(teamId);
  if (!team) {
    throw new NotFoundError('Team');
  }

  const teamMember = await teamMemberQ.findMember(teamId, userId);
  const wsMember = await wsMemberQ.findMember(team.workspace_id, userId);
  const isWsAdminOrOwner = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
  const isTeamOwner = teamMember && teamMember.role === 'TEAM_OWNER';

  if (!isWsAdminOrOwner && !isTeamOwner) {
    throw new ForbiddenError('Only team owner or workspace admin can add members');
  }

  const targetWsMember = await wsMemberQ.findMember(team.workspace_id, targetId);
  if (!targetWsMember) {
    throw new BadRequestError('User must be a member of the workspace before joining the team');
  }

  const existingTeamMember = await teamMemberQ.findMember(teamId, targetId);
  if (existingTeamMember) {
    throw new ConflictError('User is already a team member');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await teamMemberQ.insert(conn, {
      teamId,
      userId: targetId,
      role: role || 'TEAM_MEMBER',
    });

    await activityQ.insert(conn, {
      actorId: userId,
      workspaceId: team.workspace_id,
      action: 'TEAM_MEMBER_ADDED',
      metadata: { team_id: teamId, user_id: targetId, role: role || 'TEAM_MEMBER' },
    });

    await conn.commit();
    return { teamId: Number(teamId), userId: Number(targetId), role: role || 'TEAM_MEMBER' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function removeMember(userId, teamId, targetId) {
  const team = await teamQ.findById(teamId);
  if (!team) {
    throw new NotFoundError('Team');
  }

  const teamMember = await teamMemberQ.findMember(teamId, userId);
  const wsMember = await wsMemberQ.findMember(team.workspace_id, userId);
  const isWsAdminOrOwner = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
  const isTeamOwner = teamMember && teamMember.role === 'TEAM_OWNER';
  const isSelf = Number(userId) === Number(targetId);

  if (!isWsAdminOrOwner && !isTeamOwner && !isSelf) {
    throw new ForbiddenError('Insufficient permissions to remove member');
  }

  const target = await teamMemberQ.findMember(teamId, targetId);
  if (!target) {
    throw new NotFoundError('Team member');
  }

  if (target.role === 'TEAM_OWNER') {
    const allMembers = await teamMemberQ.findAllByTeam(teamId);
    const owners = allMembers.filter((m) => m.role === 'TEAM_OWNER');
    if (owners.length <= 1) {
      throw new BadRequestError('Cannot remove the only team owner');
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await teamMemberQ.remove(teamId, targetId);

    await activityQ.insert(conn, {
      actorId: userId,
      workspaceId: team.workspace_id,
      action: 'TEAM_MEMBER_REMOVED',
      metadata: { team_id: teamId, user_id: targetId },
    });

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getMembers(userId, teamId) {
  const team = await teamQ.findById(teamId);
  if (!team) {
    throw new NotFoundError('Team');
  }

  const wsMember = await wsMemberQ.findMember(team.workspace_id, userId);
  if (!wsMember) {
    throw new ForbiddenError('Not a workspace member');
  }

  return teamMemberQ.findAllByTeam(teamId);
}
