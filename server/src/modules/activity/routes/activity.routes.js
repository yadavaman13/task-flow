import { Router } from 'express';
import { authenticate } from '../../../core/middleware/authenticate.js';
import * as activityController from '../controllers/activity.controller.js';

const router = Router();

router.use(authenticate);

router.get('/workspace/:workspaceId', activityController.getByWorkspace);
router.get('/project/:projectId', activityController.getByProject);
router.get('/task/:taskId', activityController.getByTask);

export default router;
