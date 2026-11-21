import { Router } from 'express';
import { param, query } from 'express-validator';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { handleValidation } from '../../core/middleware/handleValidation.js';
import * as activityController from './activity.controller.js';

const router = Router();

router.use(authenticate);

router.get(
  '/workspace/:workspaceId',
  param('workspaceId').isInt({ gt: 0 }).withMessage('Invalid workspace ID'),
  query('page').optional().isInt({ gt: 0 }),
  query('limit').optional().isInt({ gt: 0 }),
  handleValidation,
  asyncHandler(activityController.getByWorkspace)
);

router.get(
  '/project/:projectId',
  param('projectId').isInt({ gt: 0 }).withMessage('Invalid project ID'),
  query('page').optional().isInt({ gt: 0 }),
  query('limit').optional().isInt({ gt: 0 }),
  handleValidation,
  asyncHandler(activityController.getByProject)
);

router.get(
  '/task/:taskId',
  param('taskId').isInt({ gt: 0 }).withMessage('Invalid task ID'),
  query('page').optional().isInt({ gt: 0 }),
  query('limit').optional().isInt({ gt: 0 }),
  handleValidation,
  asyncHandler(activityController.getByTask)
);

export default router;
