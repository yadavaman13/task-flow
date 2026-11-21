import { Router } from 'express';
import { authenticate } from '../../../core/middleware/authenticate.js';
import * as projectController from '../controllers/project.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Team nested: /api/teams/:teamId/projects
router.post('/teams/:teamId/projects', projectController.create);
router.get('/teams/:teamId/projects', projectController.listByTeam);

// Project direct: /api/projects/:projectId
router.get('/:projectId', projectController.get);
router.patch('/:projectId', projectController.update);
router.patch('/:projectId/archive', projectController.archive);

router.get('/:projectId/members', projectController.getMembers);
router.post('/:projectId/members', projectController.addMember);
router.delete('/:projectId/members/:userId', projectController.removeMember);

// Direct mount
router.post('/', projectController.create);
router.get('/', projectController.listByTeam);

export default router;
