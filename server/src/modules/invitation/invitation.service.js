import * as invitationQ from '../../queries/invitation.queries.js';
import * as wsMemberQ from '../../queries/workspaceMember.queries.js';
import * as workspaceQ from '../../queries/workspace.queries.js';
import * as userQ from '../../queries/user.queries.js';
import * as activityQ from '../../queries/activity.queries.js';
import * as notificationQ from '../../queries/notification.queries.js';
import { pool } from '../../config/db.js';
import { envConfig } from '../../config/env.config.js';
import { generateInvitationToken, hashToken } from '../../core/utils/token.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../core/errors/AppError.js';

export async function send(userId, workspaceId, data) {
  const member = await wsMemberQ.findMember(workspaceId, userId);
  if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }

  const normalizedEmail = data.email.trim().toLowerCase();

  const targetUser = await userQ.findByEmail(normalizedEmail);
  if (targetUser) {
    const isMember = await wsMemberQ.findMember(workspaceId, targetUser.id);
    if (isMember) {
      throw new ConflictError('User is already a workspace member');
    }
  }

  const pending = await invitationQ.findPending(workspaceId, normalizedEmail);
  if (pending) {
    throw new ConflictError('A pending invitation already exists for this email');
  }

  const { rawToken, tokenHash } = generateInvitationToken();
  const hours = envConfig.invitation.expiresInHours || 72;
  const expiresAt = new Date(Date.now() + hours * 3600 * 1000);

  await invitationQ.insert({
    workspaceId,
    email: normalizedEmail,
    invitedBy: userId,
    role: data.role || 'MEMBER',
    tokenHash,
    expiresAt,
  });

  await activityQ.insert({
    actorId: userId,
    workspaceId,
    action: 'MEMBER_INVITED',
    metadata: { email: normalizedEmail, role: data.role || 'MEMBER' },
  });

  if (targetUser) {
    const ws = await workspaceQ.findById(workspaceId);
    await notificationQ.insert({
      userId: targetUser.id,
      type: 'WORKSPACE_INVITATION',
      title: 'Workspace Invitation',
      message: `You were invited to join ${ws?.name || 'a workspace'}`,
      referenceType: 'INVITATION',
    });
  }

  return {
    email: normalizedEmail,
    role: data.role || 'MEMBER',
    token: rawToken,
    expiresAt,
  };
}

export async function getByWorkspace(userId, workspaceId) {
  const member = await wsMemberQ.findMember(workspaceId, userId);
  if (!member) {
    throw new ForbiddenError('Not a workspace member');
  }

  return invitationQ.findByWorkspace(workspaceId);
}

export async function getMyPending(userId) {
  const user = await userQ.findById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  return invitationQ.findPendingByEmail(user.email);
}

export async function accept(userId, rawToken) {
  const tokenHash = hashToken(rawToken);
  const inv = await invitationQ.findByTokenHash(tokenHash);
  if (!inv) {
    throw new NotFoundError('Invitation');
  }

  if (inv.status !== 'PENDING') {
    throw new BadRequestError(`Invitation is already ${inv.status}`);
  }

  if (new Date(inv.expires_at) < new Date()) {
    await invitationQ.updateStatus(inv.id, 'EXPIRED');
    throw new BadRequestError('Invitation has expired');
  }

  const user = await userQ.findById(userId);
  if (!user || user.email.toLowerCase() !== inv.email.toLowerCase()) {
    throw new ForbiddenError('This invitation was sent to a different email address');
  }

  const isMember = await wsMemberQ.findMember(inv.workspace_id, userId);
  if (isMember) {
    await invitationQ.updateStatus(inv.id, 'ACCEPTED');
    return { workspaceId: inv.workspace_id, message: 'Already a member' };
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await wsMemberQ.insert(conn, {
      workspaceId: inv.workspace_id,
      userId,
      role: inv.role,
    });

    await invitationQ.updateStatus(conn, inv.id, 'ACCEPTED');

    await activityQ.insert(conn, {
      actorId: userId,
      workspaceId: inv.workspace_id,
      action: 'MEMBER_JOINED',
      metadata: { user_id: userId, role: inv.role },
    });

    await conn.commit();
    return { workspaceId: inv.workspace_id, role: inv.role, accepted: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function decline(userId, rawToken) {
  const tokenHash = hashToken(rawToken);
  const inv = await invitationQ.findByTokenHash(tokenHash);
  if (!inv) {
    throw new NotFoundError('Invitation');
  }

  if (inv.status !== 'PENDING') {
    throw new BadRequestError(`Invitation is already ${inv.status}`);
  }

  const user = await userQ.findById(userId);
  if (!user || user.email.toLowerCase() !== inv.email.toLowerCase()) {
    throw new ForbiddenError('This invitation was sent to a different email address');
  }

  await invitationQ.updateStatus(inv.id, 'DECLINED');
  return { success: true, status: 'DECLINED' };
}

export async function cancel(userId, invitationId) {
  const inv = await invitationQ.findById(invitationId);
  if (!inv) {
    throw new NotFoundError('Invitation');
  }

  const member = await wsMemberQ.findMember(inv.workspace_id, userId);
  if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }

  if (inv.status !== 'PENDING') {
    throw new BadRequestError(`Cannot cancel invitation with status ${inv.status}`);
  }

  await invitationQ.updateStatus(inv.id, 'CANCELLED');
  return { success: true, status: 'CANCELLED' };
}
