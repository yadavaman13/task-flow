import * as projectQ from '../../../queries/project.queries.js';
import * as projectMemberQ from '../../../queries/projectMember.queries.js';
import * as teamQ from '../../../queries/team.queries.js';
import * as teamMemberQ from '../../../queries/teamMember.queries.js';
import * as wsMemberQ from '../../../queries/workspaceMember.queries.js';
import * as activityQ from '../../../queries/activity.queries.js';
import * as notificationQ from '../../../queries/notification.queries.js';
import { pool } from '../../../config/db.js';
import { verifyProjectAccess } from '../utils/projectAccess.util.js';

export async function create(req, res) {
  try {
    const teamId = req.params.teamId || req.params.tId;
    const { name, description, visibility, status, startDate, dueDate } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';

    if (!normalizedName) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const team = await teamQ.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    if (team.status === 'ARCHIVED') {
      return res.status(400).json({ message: 'Cannot create project in archived team.' });
    }

    const teamMember = await teamMemberQ.findMember(teamId, req.user.id);
    const wsMember = await wsMemberQ.findMember(team.workspace_id, req.user.id);
    if (!teamMember && (!wsMember || !['OWNER', 'ADMIN'].includes(wsMember.role))) {
      return res
        .status(403)
        .json({ message: 'Access denied: must be a team member to create projects.' });
    }

    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'Due date must be after or equal to start date.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [resInsert] = await projectQ.insert(conn, {
        teamId,
        name: normalizedName,
        description: typeof description === 'string' ? description.trim() : null,
        createdBy: req.user.id,
        visibility: visibility || 'TEAM',
        status: status || 'PLANNING',
        startDate,
        dueDate,
      });
      const projectId = resInsert.insertId;

      await projectMemberQ.insert(conn, {
        projectId,
        userId: req.user.id,
        role: 'PROJECT_OWNER',
      });

      await activityQ.insert(conn, {
        actorId: req.user.id,
        workspaceId: team.workspace_id,
        projectId,
        action: 'PROJECT_CREATED',
        metadata: { project_name: normalizedName },
      });

      await conn.commit();
      return res.status(201).json({
        message: 'Project created successfully',
        data: {
          id: projectId,
          team_id: Number(teamId),
          name: normalizedName,
          description: typeof description === 'string' ? description.trim() : null,
          visibility: visibility || 'TEAM',
          status: status || 'PLANNING',
          start_date: startDate || null,
          due_date: dueDate || null,
          created_by: req.user.id,
          role: 'PROJECT_OWNER',
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

export async function listByTeam(req, res) {
  try {
    const teamId = req.params.teamId || req.params.tId;
    const team = await teamQ.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const teamMember = await teamMemberQ.findMember(teamId, req.user.id);
    const wsMember = await wsMemberQ.findMember(team.workspace_id, req.user.id);
    if (!teamMember && (!wsMember || !['OWNER', 'ADMIN'].includes(wsMember.role))) {
      return res.status(403).json({ message: 'Access denied: not a team member.' });
    }

    const projects =
      wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role)
        ? await projectQ.findByTeam(teamId)
        : await projectQ.findAccessibleByTeam(teamId, req.user.id);

    return res.status(200).json({
      message: 'Projects retrieved successfully',
      data: projects,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function get(req, res) {
  try {
    const projectId = req.params.projectId || req.params.pId;
    const access = await verifyProjectAccess(req.user.id, projectId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    return res.status(200).json({
      message: 'Project retrieved successfully',
      data: { ...access.project, role: access.role },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function update(req, res) {
  try {
    const projectId = req.params.projectId || req.params.pId;
    const access = await verifyProjectAccess(req.user.id, projectId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    if (access.role !== 'PROJECT_OWNER' && !access.isWsAdmin) {
      return res
        .status(403)
        .json({
          message: 'Access denied: only project owner or workspace admin can update project.',
        });
    }

    const { name, description, visibility, status, startDate, dueDate } = req.body;
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'Due date must be after or equal to start date.' });
    }

    await projectQ.update(projectId, {
      name: typeof name === 'string' ? name.trim() : undefined,
      description: typeof description === 'string' ? description.trim() : description,
      visibility,
      status,
      startDate,
      dueDate,
    });

    await activityQ.insert({
      actorId: req.user.id,
      workspaceId: access.project.workspace_id,
      projectId,
      action: 'PROJECT_UPDATED',
      metadata: req.body,
    });

    const updated = await projectQ.findById(projectId);
    return res.status(200).json({
      message: 'Project updated successfully',
      data: { ...updated, role: access.role },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function archive(req, res) {
  try {
    const projectId = req.params.projectId || req.params.pId;
    const access = await verifyProjectAccess(req.user.id, projectId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    if (access.role !== 'PROJECT_OWNER' && !access.isWsAdmin) {
      return res
        .status(403)
        .json({
          message: 'Access denied: only project owner or workspace admin can archive project.',
        });
    }

    await projectQ.updateStatus(projectId, 'ARCHIVED');

    await activityQ.insert({
      actorId: req.user.id,
      workspaceId: access.project.workspace_id,
      projectId,
      action: 'PROJECT_ARCHIVED',
    });

    return res.status(200).json({ message: 'Project archived successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getMembers(req, res) {
  try {
    const projectId = req.params.projectId || req.params.pId;
    const access = await verifyProjectAccess(req.user.id, projectId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const members = await projectMemberQ.findAllByProject(projectId);
    return res.status(200).json({
      message: 'Project members retrieved successfully',
      data: members,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function addMember(req, res) {
  try {
    const projectId = req.params.projectId || req.params.pId;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const access = await verifyProjectAccess(req.user.id, projectId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    if (access.role !== 'PROJECT_OWNER' && !access.isWsAdmin) {
      return res
        .status(403)
        .json({ message: 'Access denied: only project owner can add members.' });
    }

    const targetTeamMember = await teamMemberQ.findMember(access.project.team_id, userId);
    if (!targetTeamMember) {
      return res
        .status(400)
        .json({ message: 'User must be a member of the team to be added to project.' });
    }

    const existing = await projectMemberQ.findMember(projectId, userId);
    if (existing) {
      return res.status(409).json({ message: 'User is already a project member.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await projectMemberQ.insert(conn, {
        projectId,
        userId,
        role: role || 'PROJECT_MEMBER',
      });

      await activityQ.insert(conn, {
        actorId: req.user.id,
        workspaceId: access.project.workspace_id,
        projectId,
        action: 'PROJECT_MEMBER_ADDED',
        metadata: { project_id: projectId, user_id: userId, role: role || 'PROJECT_MEMBER' },
      });

      await notificationQ.insert({
        userId,
        type: 'PROJECT_ADDED',
        title: 'Added to Project',
        message: `You were added to project ${access.project.name}`,
        referenceType: 'PROJECT',
        referenceId: projectId,
      });

      await conn.commit();
      return res.status(201).json({
        message: 'Project member added successfully',
        data: {
          projectId: Number(projectId),
          userId: Number(userId),
          role: role || 'PROJECT_MEMBER',
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

export async function removeMember(req, res) {
  try {
    const projectId = req.params.projectId || req.params.pId;
    const targetId = req.params.userId;

    const access = await verifyProjectAccess(req.user.id, projectId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const isSelf = Number(req.user.id) === Number(targetId);
    if (access.role !== 'PROJECT_OWNER' && !access.isWsAdmin && !isSelf) {
      return res
        .status(403)
        .json({ message: 'Access denied: insufficient permissions to remove member.' });
    }

    const target = await projectMemberQ.findMember(projectId, targetId);
    if (!target) {
      return res.status(404).json({ message: 'Project member not found.' });
    }

    if (target.role === 'PROJECT_OWNER') {
      const all = await projectMemberQ.findAllByProject(projectId);
      const owners = all.filter((m) => m.role === 'PROJECT_OWNER');
      if (owners.length <= 1) {
        return res.status(400).json({ message: 'Cannot remove the only project owner.' });
      }
    }

    await projectMemberQ.remove(projectId, targetId);
    return res.status(200).json({ message: 'Project member removed successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
