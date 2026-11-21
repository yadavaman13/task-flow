import { Router } from 'express';
import { authenticate } from '../../../core/middleware/authenticate.js';
import * as taskController from '../controllers/task.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Project nested tasks: /api/projects/:projectId/tasks
router.post('/projects/:projectId/tasks', taskController.create);
router.get('/projects/:projectId/tasks', taskController.list);

// Direct tasks: /api/tasks/:taskId
router.get('/:taskId', taskController.get);
router.patch('/:taskId', taskController.update);
router.patch('/:taskId/status', taskController.updateStatus);
router.patch('/:taskId/assign', taskController.assign);
router.delete('/:taskId', taskController.remove);

// Direct mount
router.post('/', taskController.create);
router.get('/', taskController.list);

export default router;
