import { Router } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { handleValidation } from '../../core/middleware/handleValidation.js';
import * as v from './comment.validator.js';
import * as commentController from './comment.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Task-nested comment routes: /api/tasks/:taskId/comments
router.post('/tasks/:taskId/comments', ...v.createComment, handleValidation, asyncHandler(commentController.create));
router.get('/tasks/:taskId/comments', ...v.taskIdParam, handleValidation, asyncHandler(commentController.getByTask));

// Root comments routes: /api/comments/:commentId
router.patch('/:commentId', ...v.updateComment, handleValidation, asyncHandler(commentController.update));
router.delete('/:commentId', ...v.commentIdParam, handleValidation, asyncHandler(commentController.remove));

// Direct mounts for /api/tasks/:taskId/comments
router.post('/', ...v.createComment, handleValidation, asyncHandler(commentController.create));
router.get('/', asyncHandler(commentController.getByTask));

export default router;
