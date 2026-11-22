import * as workspaceQ from '../../../queries/workspace.queries.js';
import * as wsMemberQ from '../../../queries/workspaceMember.queries.js';
import * as activityQ from '../../../queries/activity.queries.js';
import { pool } from '../../../config/db.js';

export async function create(req, res) {
  try {
    const { name, description } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedDesc = typeof description === 'string' ? description.trim() : null;

    if (!normalizedName) {
      return res.status(400).json({ message: 'Workspace name is required.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await workspaceQ.insert(conn, {
        name: normalizedName,
        description: normalizedDesc,
        ownerId: req.user.id,
      });
      const workspaceId = result.insertId;

      await wsMemberQ.insert(conn, {
        workspaceId,
        userId: req.user.id,
        role: 'OWNER',
      });

      await activityQ.insert(conn, {
        actorId: req.user.id,
        workspaceId,
        action: 'WORKSPACE_CREATED',
        metadata: { workspace_name: normalizedName },
      });

      await conn.commit();
      return res.status(201).json({
        message: 'Workspace created successfully',
        data: {
          id: workspaceId,
          name: normalizedName,
          description: normalizedDesc,
          owner_id: req.user.id,
          role: 'OWNER',
        },
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

export async function list(req, res) {
  try {
    const workspaces = await workspaceQ.findByUser(req.user.id);
    return res.status(200).json({
      message: 'Workspaces retrieved successfully',
      data: workspaces,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function get(req, res) {
  try {
    const workspaceId = req.params.workspaceId || req.params.wId;
    const member = await wsMemberQ.findMember(workspaceId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access denied: not a workspace member.' });
    }

    const workspace = await workspaceQ.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }

    return res.status(200).json({
      message: 'Workspace retrieved successfully',
      data: { ...workspace, role: member.role },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function update(req, res) {
  try {
    const workspaceId = req.params.workspaceId || req.params.wId;
    const member = await wsMemberQ.findMember(workspaceId, req.user.id);
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return res
        .status(403)
        .json({ message: 'Access denied: only owner or admin can update workspace.' });
    }

    const { name, description } = req.body;
    await workspaceQ.update(workspaceId, {
      name: typeof name === 'string' ? name.trim() : undefined,
      description: typeof description === 'string' ? description.trim() : description,
    });

    const updated = await workspaceQ.findById(workspaceId);
    return res.status(200).json({
      message: 'Workspace updated successfully',
      data: { ...updated, role: member.role },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getMembers(req, res) {
  try {
    const workspaceId = req.params.workspaceId || req.params.wId;
    const member = await wsMemberQ.findMember(workspaceId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access denied: not a workspace member.' });
    }

    const members = await wsMemberQ.findAllByWorkspace(workspaceId);
    return res.status(200).json({
      message: 'Members retrieved successfully',
      data: members,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function removeMember(req, res) {
  try {
    const workspaceId = req.params.workspaceId || req.params.wId;
    const targetId = req.params.userId;

    const requester = await wsMemberQ.findMember(workspaceId, req.user.id);
    if (!requester || !['OWNER', 'ADMIN'].includes(requester.role)) {
      return res
        .status(403)
        .json({ message: 'Access denied: only owner or admin can remove members.' });
    }

    const target = await wsMemberQ.findMember(workspaceId, targetId);
    if (!target) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    if (target.role === 'OWNER') {
      return res.status(400).json({ message: 'Cannot remove workspace owner.' });
    }

    if (requester.role === 'ADMIN' && target.role === 'ADMIN') {
      return res.status(403).json({ message: 'Admins cannot remove other admins.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await wsMemberQ.remove(workspaceId, targetId);

      await activityQ.insert(conn, {
        actorId: req.user.id,
        workspaceId,
        action: 'MEMBER_REMOVED',
        metadata: { user_id: targetId },
      });

      await conn.commit();
      return res.status(200).json({ message: 'Member removed successfully' });
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

export async function updateMemberRole(req, res) {
  try {
    const workspaceId = req.params.workspaceId || req.params.wId;
    const targetId = req.params.userId;
    const { role } = req.body;

    const requester = await wsMemberQ.findMember(workspaceId, req.user.id);
    if (!requester || requester.role !== 'OWNER') {
      return res.status(403).json({ message: 'Only workspace owner can change member roles.' });
    }

    const target = await wsMemberQ.findMember(workspaceId, targetId);
    if (!target) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    if (target.role === 'OWNER') {
      return res.status(400).json({ message: 'Cannot change role of workspace owner.' });
    }

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ message: 'Role must be ADMIN or MEMBER.' });
    }

    await wsMemberQ.updateRole(workspaceId, targetId, role);
    return res.status(200).json({
      message: 'Member role updated successfully',
      data: { workspaceId: Number(workspaceId), userId: Number(targetId), role },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
