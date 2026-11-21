import * as commentQ from '../../queries/comment.queries.js';
import * as activityQ from '../../queries/activity.queries.js';
import * as notificationQ from '../../queries/notification.queries.js';
import { verifyTaskAccess } from '../task/task.service.js';
import {
  ForbiddenError,
  NotFoundError,
} from '../../core/errors/AppError.js';

export async function create(userId, taskId, commentText) {
  const { task, project } = await verifyTaskAccess(userId, taskId);

  const res = await commentQ.insert({
    taskId,
    userId,
    comment: commentText,
  });
  const commentId = res.insertId;

  await activityQ.insert({
    actorId: userId,
    workspaceId: project.workspace_id,
    projectId: project.id,
    taskId,
    action: 'COMMENT_CREATED',
    metadata: { comment_id: commentId },
  });

  const recipient =
    task.assigned_to && Number(task.assigned_to) !== Number(userId)
      ? task.assigned_to
      : Number(task.created_by) !== Number(userId)
        ? task.created_by
        : null;

  if (recipient) {
    await notificationQ.insert({
      userId: recipient,
      type: 'COMMENT_ADDED',
      title: 'New Comment on Task',
      message: `New comment added on "${task.title}"`,
      referenceType: 'COMMENT',
      referenceId: commentId,
    });
  }

  return commentQ.findById(commentId);
}

export async function getByTask(userId, taskId) {
  await verifyTaskAccess(userId, taskId);
  return commentQ.findByTask(taskId);
}

export async function update(userId, commentId, commentText) {
  const comment = await commentQ.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment');
  }

  if (Number(comment.user_id) !== Number(userId)) {
    throw new ForbiddenError('Only the comment author can edit this comment');
  }

  await commentQ.update(commentId, commentText);
  return commentQ.findById(commentId);
}

export async function remove(userId, commentId) {
  const comment = await commentQ.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment');
  }

  const { role, isWsAdmin } = await verifyTaskAccess(userId, comment.task_id);
  const isAuthor = Number(comment.user_id) === Number(userId);
  const isProjectOwner = role === 'PROJECT_OWNER';

  if (!isAuthor && !isProjectOwner && !isWsAdmin) {
    throw new ForbiddenError('Only comment author or project owner can delete comment');
  }

  await commentQ.remove(commentId);
  return { success: true };
}
