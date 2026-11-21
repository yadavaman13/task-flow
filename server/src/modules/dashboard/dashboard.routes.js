import { Router } from 'express';
import { param } from 'express-validator';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { handleValidation } from '../../core/middleware/handleValidation.js';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

router.use(authenticate);

router.get(
  '/workspace/:workspaceId',
  param('workspaceId').isInt({ gt: 0 }).withMessage('Invalid workspace ID'),
  handleValidation,
  asyncHandler(dashboardController.getWorkspace)
);

router.get(
  '/team/:teamId',
  param('teamId').isInt({ gt: 0 }).withMessage('Invalid team ID'),
  handleValidation,
  asyncHandler(dashboardController.getTeam)
);

router.get(
  '/project/:projectId',
  param('projectId').isInt({ gt: 0 }).withMessage('Invalid project ID'),
  handleValidation,
  asyncHandler(dashboardController.getProject)
);

router.get(
  '/project/:projectId/workload',
  param('projectId').isInt({ gt: 0 }).withMessage('Invalid project ID'),
  handleValidation,
  asyncHandler(dashboardController.getProjectWorkload)
);

export default router;
