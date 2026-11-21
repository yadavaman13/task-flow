import * as commentQ from '../../../queries/comment.queries.js';
import * as activityQ from '../../../queries/activity.queries.js';
import * as notificationQ from '../../../queries/notification.queries.js';
import { verifyTaskAccess } from '../../task/utils/taskAccess.util.js';

export async function create(req, res) {
  try {
    const taskId = req.params.taskId || req.params.tId;
    const { comment } = req.body;
    const normalizedComment = typeof comment === 'string' ? comment.trim() : '';

    if (!normalizedComment) {
      return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    const access = await verifyTaskAccess(req.user.id, taskId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const resInsert = await commentQ.insert({
      taskId,
      userId: req.user.id,
      comment: normalizedComment,
    });
    const commentId = resInsert.insertId;

    await activityQ.insert({
      actorId: req.user.id,
      workspaceId: access.project.workspace_id,
      projectId: access.project.id,
      taskId,
      action: 'COMMENT_CREATED',
      metadata: { comment_id: commentId },
    });

    const recipient =
      access.task.assigned_to && Number(access.task.assigned_to) !== Number(req.user.id)
        ? access.task.assigned_to
        : Number(access.task.created_by) !== Number(req.user.id)
          ? access.task.created_by
          : null;

    if (recipient) {
      await notificationQ.insert({
        userId: recipient,
        type: 'COMMENT_ADDED',
        title: 'New Comment on Task',
        message: `New comment added on "${access.task.title}"`,
        referenceType: 'COMMENT',
        referenceId: commentId,
      });
    }

    const newComment = await commentQ.findById(commentId);
    return res.status(201).json({
      message: 'Comment added successfully',
      data: newComment,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getByTask(req, res) {
  try {
    const taskId = req.params.taskId || req.params.tId;
    const access = await verifyTaskAccess(req.user.id, taskId);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const comments = await commentQ.findByTask(taskId);
    return res.status(200).json({
      message: 'Comments retrieved successfully',
      data: comments,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function update(req, res) {
  try {
    const commentId = req.params.commentId || req.params.cId;
    const { comment } = req.body;
    const normalizedComment = typeof comment === 'string' ? comment.trim() : '';

    if (!normalizedComment) {
      return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    const existing = await commentQ.findById(commentId);
    if (!existing) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (Number(existing.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: only comment author can edit comment.' });
    }

    await commentQ.update(commentId, normalizedComment);
    const updated = await commentQ.findById(commentId);
    return res.status(200).json({
      message: 'Comment updated successfully',
      data: updated,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function remove(req, res) {
  try {
    const commentId = req.params.commentId || req.params.cId;
    const existing = await commentQ.findById(commentId);
    if (!existing) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const access = await verifyTaskAccess(req.user.id, existing.task_id);
    const isAuthor = Number(existing.user_id) === Number(req.user.id);
    const isProjectOwner = access.role === 'PROJECT_OWNER';

    if (!isAuthor && !isProjectOwner && !access.isWsAdmin) {
      return res.status(403).json({ message: 'Access denied: only comment author or project owner can delete comment.' });
    }

    await commentQ.remove(commentId);
    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
