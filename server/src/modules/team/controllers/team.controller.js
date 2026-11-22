import * as teamQ from '../../../queries/team.queries.js';
import * as teamMemberQ from '../../../queries/teamMember.queries.js';
import * as wsMemberQ from '../../../queries/workspaceMember.queries.js';
import * as activityQ from '../../../queries/activity.queries.js';
import { pool } from '../../../config/db.js';

export async function create(req, res) {
  try {
    const workspaceId = req.params.workspaceId || req.params.wId;
    const { name, description } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedDesc = typeof description === 'string' ? description.trim() : null;

    if (!normalizedName) {
      return res.status(400).json({ message: 'Team name is required.' });
    }

    const member = await wsMemberQ.findMember(workspaceId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access denied: not a workspace member.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await teamQ.insert(conn, {
        workspaceId,
        name: normalizedName,
        description: normalizedDesc,
        createdBy: req.user.id,
      });
      const teamId = result.insertId;

      await teamMemberQ.insert(conn, {
        teamId,
        userId: req.user.id,
        role: 'TEAM_OWNER',
      });

      await activityQ.insert(conn, {
        actorId: req.user.id,
        workspaceId,
        action: 'TEAM_CREATED',
        metadata: { team_name: normalizedName },
      });

      await conn.commit();
      return res.status(201).json({
        message: 'Team created successfully',
        data: {
          id: teamId,
          workspace_id: Number(workspaceId),
          name: normalizedName,
          description: normalizedDesc,
          created_by: req.user.id,
          role: 'TEAM_OWNER',
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
    const workspaceId = req.params.workspaceId || req.params.wId;
    const member = await wsMemberQ.findMember(workspaceId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access denied: not a workspace member.' });
    }

    const teams = await teamQ.findByWorkspace(workspaceId);
    return res.status(200).json({
      message: 'Teams retrieved successfully',
      data: teams,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function get(req, res) {
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

    const teamMember = await teamMemberQ.findMember(teamId, req.user.id);
    return res.status(200).json({
      message: 'Team retrieved successfully',
      data: { ...team, role: teamMember ? teamMember.role : null },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function update(req, res) {
  try {
    const teamId = req.params.teamId || req.params.tId;
    const team = await teamQ.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    if (team.status === 'ARCHIVED') {
      return res.status(400).json({ message: 'Cannot update an archived team.' });
    }

    const wsMember = await wsMemberQ.findMember(team.workspace_id, req.user.id);
    const teamMember = await teamMemberQ.findMember(teamId, req.user.id);
    const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
    const isTeamOwner = teamMember && teamMember.role === 'TEAM_OWNER';

    if (!isWsAdmin && !isTeamOwner) {
      return res
        .status(403)
        .json({ message: 'Access denied: only team owner or workspace admin can update team.' });
    }

    const { name, description } = req.body;
    await teamQ.update(teamId, {
      name: typeof name === 'string' ? name.trim() : undefined,
      description: typeof description === 'string' ? description.trim() : description,
    });

    const updated = await teamQ.findById(teamId);
    return res.status(200).json({
      message: 'Team updated successfully',
      data: updated,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function archive(req, res) {
  try {
    const teamId = req.params.teamId || req.params.tId;
    const team = await teamQ.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const wsMember = await wsMemberQ.findMember(team.workspace_id, req.user.id);
    const teamMember = await teamMemberQ.findMember(teamId, req.user.id);
    const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
    const isTeamOwner = teamMember && teamMember.role === 'TEAM_OWNER';

    if (!isWsAdmin && !isTeamOwner) {
      return res
        .status(403)
        .json({ message: 'Access denied: only team owner or workspace admin can archive team.' });
    }

    await teamQ.updateStatus(teamId, 'ARCHIVED');
    return res.status(200).json({ message: 'Team archived successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getMembers(req, res) {
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

    const members = await teamMemberQ.findAllByTeam(teamId);
    return res.status(200).json({
      message: 'Team members retrieved successfully',
      data: members,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function addMember(req, res) {
  try {
    const teamId = req.params.teamId || req.params.tId;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const team = await teamQ.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const teamMember = await teamMemberQ.findMember(teamId, req.user.id);
    const wsMember = await wsMemberQ.findMember(team.workspace_id, req.user.id);
    const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
    const isTeamOwner = teamMember && teamMember.role === 'TEAM_OWNER';

    if (!isWsAdmin && !isTeamOwner) {
      return res
        .status(403)
        .json({ message: 'Access denied: only team owner or workspace admin can add members.' });
    }

    const targetWsMember = await wsMemberQ.findMember(team.workspace_id, userId);
    if (!targetWsMember) {
      return res
        .status(400)
        .json({ message: 'User must be a member of the workspace before joining the team.' });
    }

    const existing = await teamMemberQ.findMember(teamId, userId);
    if (existing) {
      return res.status(409).json({ message: 'User is already a team member.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await teamMemberQ.insert(conn, {
        teamId,
        userId,
        role: role || 'TEAM_MEMBER',
      });

      await activityQ.insert(conn, {
        actorId: req.user.id,
        workspaceId: team.workspace_id,
        action: 'TEAM_MEMBER_ADDED',
        metadata: { team_id: teamId, user_id: userId, role: role || 'TEAM_MEMBER' },
      });

      await conn.commit();
      return res.status(201).json({
        message: 'Team member added successfully',
        data: { teamId: Number(teamId), userId: Number(userId), role: role || 'TEAM_MEMBER' },
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

export async function removeMember(req, res) {
  try {
    const teamId = req.params.teamId || req.params.tId;
    const targetId = req.params.userId;

    const team = await teamQ.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const teamMember = await teamMemberQ.findMember(teamId, req.user.id);
    const wsMember = await wsMemberQ.findMember(team.workspace_id, req.user.id);
    const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
    const isTeamOwner = teamMember && teamMember.role === 'TEAM_OWNER';
    const isSelf = Number(req.user.id) === Number(targetId);

    if (!isWsAdmin && !isTeamOwner && !isSelf) {
      return res
        .status(403)
        .json({ message: 'Access denied: insufficient permissions to remove member.' });
    }

    const target = await teamMemberQ.findMember(teamId, targetId);
    if (!target) {
      return res.status(404).json({ message: 'Team member not found.' });
    }

    if (target.role === 'TEAM_OWNER') {
      const all = await teamMemberQ.findAllByTeam(teamId);
      const owners = all.filter((m) => m.role === 'TEAM_OWNER');
      if (owners.length <= 1) {
        return res.status(400).json({ message: 'Cannot remove the only team owner.' });
      }
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await teamMemberQ.remove(teamId, targetId);

      await activityQ.insert(conn, {
        actorId: req.user.id,
        workspaceId: team.workspace_id,
        action: 'TEAM_MEMBER_REMOVED',
        metadata: { team_id: teamId, user_id: targetId },
      });

      await conn.commit();
      return res.status(200).json({ message: 'Team member removed successfully' });
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
