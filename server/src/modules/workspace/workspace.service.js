import * as workspaceQ from '../../queries/workspace.queries.js';
import * as wsMemberQ from '../../queries/workspaceMember.queries.js';
import * as activityQ from '../../queries/activity.queries.js';
import { pool } from '../../config/db.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../core/errors/AppError.js';

export async function create(userId, data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await workspaceQ.insert(conn, {
      name: data.name,
      description: data.description,
      ownerId: userId,
    });
    const workspaceId = result.insertId;

    await wsMemberQ.insert(conn, {
      workspaceId,
      userId,
      role: 'OWNER',
    });

    await activityQ.insert(conn, {
      actorId: userId,
      workspaceId,
      action: 'WORKSPACE_CREATED',
      metadata: { workspace_name: data.name },
    });

    await conn.commit();
    return {
      id: workspaceId,
      name: data.name,
      description: data.description || null,
      owner_id: userId,
      role: 'OWNER',
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getUserWorkspaces(userId) {
  return workspaceQ.findByUser(userId);
}

export async function get(userId, workspaceId) {
  const member = await wsMemberQ.findMember(workspaceId, userId);
  if (!member) {
    throw new ForbiddenError('Not a workspace member');
  }

  const workspace = await workspaceQ.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundError('Workspace');
  }

  return { ...workspace, role: member.role };
}

export async function update(userId, workspaceId, data) {
  const member = await wsMemberQ.findMember(workspaceId, userId);
  if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }

  await workspaceQ.update(workspaceId, data);
  const updated = await workspaceQ.findById(workspaceId);
  return { ...updated, role: member.role };
}

export async function getMembers(userId, workspaceId) {
  const member = await wsMemberQ.findMember(workspaceId, userId);
  if (!member) {
    throw new ForbiddenError('Not a workspace member');
  }

  return wsMemberQ.findAllByWorkspace(workspaceId);
}

export async function removeMember(userId, workspaceId, targetId) {
  const requester = await wsMemberQ.findMember(workspaceId, userId);
  if (!requester || !['OWNER', 'ADMIN'].includes(requester.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }

  const target = await wsMemberQ.findMember(workspaceId, targetId);
  if (!target) {
    throw new NotFoundError('Member');
  }

  if (target.role === 'OWNER') {
    throw new BadRequestError('Cannot remove workspace owner');
  }

  if (requester.role === 'ADMIN' && target.role === 'ADMIN') {
    throw new ForbiddenError('Admins cannot remove other admins');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await wsMemberQ.remove(workspaceId, targetId);

    await activityQ.insert(conn, {
      actorId: userId,
      workspaceId,
      action: 'MEMBER_REMOVED',
      metadata: { user_id: targetId },
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

export async function updateMemberRole(userId, workspaceId, targetId, role) {
  const requester = await wsMemberQ.findMember(workspaceId, userId);
  if (!requester || requester.role !== 'OWNER') {
    throw new ForbiddenError('Only workspace owner can change member roles');
  }

  const target = await wsMemberQ.findMember(workspaceId, targetId);
  if (!target) {
    throw new NotFoundError('Member');
  }

  if (target.role === 'OWNER') {
    throw new BadRequestError('Cannot change role of workspace owner');
  }

  await wsMemberQ.updateRole(workspaceId, targetId, role);
  return { workspaceId: Number(workspaceId), userId: Number(targetId), role };
}
