import * as commentService from './comment.service.js';
import { success, created, noContent } from '../../core/utils/responseHelper.js';

export async function create(req, res) {
  const taskId = req.params.taskId || req.params.tId;
  const comment = await commentService.create(req.user.id, taskId, req.body.comment);
  return created(res, comment, 'Comment added successfully');
}

export async function getByTask(req, res) {
  const taskId = req.params.taskId || req.params.tId;
  const comments = await commentService.getByTask(req.user.id, taskId);
  return success(res, comments);
}

export async function update(req, res) {
  const commentId = req.params.commentId || req.params.cId;
  const comment = await commentService.update(req.user.id, commentId, req.body.comment);
  return success(res, comment, 'Comment updated successfully');
}

export async function remove(req, res) {
  const commentId = req.params.commentId || req.params.cId;
  await commentService.remove(req.user.id, commentId);
  return noContent(res);
}
