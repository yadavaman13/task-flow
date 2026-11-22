import * as invitationQ from '../../../queries/invitation.queries.js';
import * as wsMemberQ from '../../../queries/workspaceMember.queries.js';
import * as workspaceQ from '../../../queries/workspace.queries.js';
import * as userQ from '../../../queries/user.queries.js';
import * as activityQ from '../../../queries/activity.queries.js';
import * as notificationQ from '../../../queries/notification.queries.js';
import { pool } from '../../../config/db.js';
import { envConfig } from '../../../config/env.config.js';
import { generateInvitationToken, hashToken } from '../../../core/utils/token.js';

export async function send(req, res) {
  try {
    const workspaceId = req.params.workspaceId || req.params.wId;
    const { email, role } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const member = await wsMemberQ.findMember(workspaceId, req.user.id);
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return res
        .status(403)
        .json({ message: 'Access denied: only owner or admin can invite members.' });
    }

    const targetUser = await userQ.findByEmail(normalizedEmail);
    if (targetUser) {
      const isMember = await wsMemberQ.findMember(workspaceId, targetUser.id);
      if (isMember) {
        return res.status(409).json({ message: 'User is already a workspace member.' });
      }
    }

    const pending = await invitationQ.findPending(workspaceId, normalizedEmail);
    if (pending) {
      return res
        .status(409)
        .json({ message: 'A pending invitation already exists for this email.' });
    }

    const { rawToken, tokenHash } = generateInvitationToken();
    const hours = envConfig.invitation.expiresInHours || 72;
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000);

    await invitationQ.insert({
      workspaceId,
      email: normalizedEmail,
      invitedBy: req.user.id,
      role: role || 'MEMBER',
      tokenHash,
      expiresAt,
    });

    await activityQ.insert({
      actorId: req.user.id,
      workspaceId,
      action: 'MEMBER_INVITED',
      metadata: { email: normalizedEmail, role: role || 'MEMBER' },
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

    return res.status(201).json({
      message: 'Invitation sent successfully',
      data: {
        email: normalizedEmail,
        role: role || 'MEMBER',
        token: rawToken,
        expiresAt,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getByWorkspace(req, res) {
  try {
    const workspaceId = req.params.workspaceId || req.params.wId;
    const member = await wsMemberQ.findMember(workspaceId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access denied: not a workspace member.' });
    }

    const invitations = await invitationQ.findByWorkspace(workspaceId);
    return res.status(200).json({
      message: 'Invitations retrieved successfully',
      data: invitations,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getMyPending(req, res) {
  try {
    const user = await userQ.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const pending = await invitationQ.findPendingByEmail(user.email);
    return res.status(200).json({
      message: 'Pending invitations retrieved successfully',
      data: pending,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function accept(req, res) {
  try {
    const { token } = req.body;
    const rawToken = typeof token === 'string' ? token.trim() : '';

    if (!rawToken) {
      return res.status(400).json({ message: 'Invitation token is required.' });
    }

    const tokenHash = hashToken(rawToken);
    const inv = await invitationQ.findByTokenHash(tokenHash);
    if (!inv) {
      return res.status(404).json({ message: 'Invitation not found.' });
    }

    if (inv.status !== 'PENDING') {
      return res.status(400).json({ message: `Invitation is already ${inv.status}.` });
    }

    if (new Date(inv.expires_at) < new Date()) {
      await invitationQ.updateStatus(inv.id, 'EXPIRED');
      return res.status(400).json({ message: 'Invitation has expired.' });
    }

    const user = await userQ.findById(req.user.id);
    if (!user || user.email.toLowerCase() !== inv.email.toLowerCase()) {
      return res
        .status(403)
        .json({ message: 'This invitation was sent to a different email address.' });
    }

    const isMember = await wsMemberQ.findMember(inv.workspace_id, req.user.id);
    if (isMember) {
      await invitationQ.updateStatus(inv.id, 'ACCEPTED');
      return res.status(200).json({
        message: 'Already a workspace member.',
        data: { workspaceId: inv.workspace_id },
      });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await wsMemberQ.insert(conn, {
        workspaceId: inv.workspace_id,
        userId: req.user.id,
        role: inv.role,
      });

      await invitationQ.updateStatus(conn, inv.id, 'ACCEPTED');

      await activityQ.insert(conn, {
        actorId: req.user.id,
        workspaceId: inv.workspace_id,
        action: 'MEMBER_JOINED',
        metadata: { user_id: req.user.id, role: inv.role },
      });

      await conn.commit();
      return res.status(200).json({
        message: 'Invitation accepted successfully',
        data: { workspaceId: inv.workspace_id, role: inv.role, accepted: true },
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function decline(req, res) {
  try {
    const { token } = req.body;
    const rawToken = typeof token === 'string' ? token.trim() : '';

    if (!rawToken) {
      return res.status(400).json({ message: 'Invitation token is required.' });
    }

    const tokenHash = hashToken(rawToken);
    const inv = await invitationQ.findByTokenHash(tokenHash);
    if (!inv) {
      return res.status(404).json({ message: 'Invitation not found.' });
    }

    if (inv.status !== 'PENDING') {
      return res.status(400).json({ message: `Invitation is already ${inv.status}.` });
    }

    const user = await userQ.findById(req.user.id);
    if (!user || user.email.toLowerCase() !== inv.email.toLowerCase()) {
      return res
        .status(403)
        .json({ message: 'This invitation was sent to a different email address.' });
    }

    await invitationQ.updateStatus(inv.id, 'DECLINED');
    return res.status(200).json({ message: 'Invitation declined successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function cancel(req, res) {
  try {
    const invitationId = req.params.id;
    const inv = await invitationQ.findById(invitationId);
    if (!inv) {
      return res.status(404).json({ message: 'Invitation not found.' });
    }

    const member = await wsMemberQ.findMember(inv.workspace_id, req.user.id);
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return res
        .status(403)
        .json({ message: 'Access denied: only owner or admin can cancel invitation.' });
    }

    if (inv.status !== 'PENDING') {
      return res
        .status(400)
        .json({ message: `Cannot cancel invitation with status ${inv.status}.` });
    }

    await invitationQ.updateStatus(inv.id, 'CANCELLED');
    return res.status(200).json({ message: 'Invitation cancelled successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
