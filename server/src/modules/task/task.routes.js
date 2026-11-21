import { Router } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { handleValidation } from '../../core/middleware/handleValidation.js';
import * as v from './task.validator.js';
import * as taskController from './task.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Project-nested tasks: /api/projects/:projectId/tasks
router.post('/projects/:projectId/tasks', ...v.createTask, handleValidation, asyncHandler(taskController.create));
router.get('/projects/:projectId/tasks', ...v.listTasks, handleValidation, asyncHandler(taskController.list));

// Direct task routes: /api/tasks/:taskId
router.get('/:taskId', ...v.taskIdParam, handleValidation, asyncHandler(taskController.get));
router.patch('/:taskId', ...v.updateTask, handleValidation, asyncHandler(taskController.update));
router.patch('/:taskId/status', ...v.updateStatus, handleValidation, asyncHandler(taskController.updateStatus));
router.patch('/:taskId/assign', ...v.assignTask, handleValidation, asyncHandler(taskController.assign));
router.delete('/:taskId', ...v.taskIdParam, handleValidation, asyncHandler(taskController.remove));

// When mounted directly as project child /api/projects/:projectId/tasks
router.post('/', ...v.createTask, handleValidation, asyncHandler(taskController.create));
router.get('/', ...v.listTasks, handleValidation, asyncHandler(taskController.list));

export default router;
