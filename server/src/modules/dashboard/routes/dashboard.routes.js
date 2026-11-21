import { Router } from 'express';
import { authenticate } from '../../../core/middleware/authenticate.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = Router();

router.use(authenticate);

router.get('/workspace/:workspaceId', dashboardController.getWorkspace);
router.get('/team/:teamId', dashboardController.getTeam);
router.get('/project/:projectId', dashboardController.getProject);
router.get('/project/:projectId/workload', dashboardController.getProjectWorkload);

export default router;
