import { Router } from 'express';
import { authenticate } from '../../../core/middleware/authenticate.js';
import * as commentController from '../controllers/comment.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Task nested: /api/tasks/:taskId/comments
router.post('/tasks/:taskId/comments', commentController.create);
router.get('/tasks/:taskId/comments', commentController.getByTask);

// Direct comments: /api/comments/:commentId
router.patch('/:commentId', commentController.update);
router.delete('/:commentId', commentController.remove);

// Direct mount
router.post('/', commentController.create);
router.get('/', commentController.getByTask);

export default router;
