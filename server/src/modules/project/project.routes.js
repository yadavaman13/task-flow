import { Router } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { handleValidation } from '../../core/middleware/handleValidation.js';
import * as v from './project.validator.js';
import * as projectController from './project.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Team-nested project routes: /api/teams/:teamId/projects
router.post('/teams/:teamId/projects', ...v.createProject, handleValidation, asyncHandler(projectController.create));
router.get('/teams/:teamId/projects', ...v.teamIdParam, handleValidation, asyncHandler(projectController.listByTeam));

// Root /:projectId routes (when mounted at /api/projects or used directly)
router.get('/:projectId', ...v.projectIdParam, handleValidation, asyncHandler(projectController.get));
router.patch('/:projectId', ...v.updateProject, handleValidation, asyncHandler(projectController.update));
router.patch('/:projectId/archive', ...v.projectIdParam, handleValidation, asyncHandler(projectController.archive));

router.get('/:projectId/members', ...v.projectIdParam, handleValidation, asyncHandler(projectController.getMembers));
router.post('/:projectId/members', ...v.addMember, handleValidation, asyncHandler(projectController.addMember));
router.delete('/:projectId/members/:userId', ...v.memberParam, handleValidation, asyncHandler(projectController.removeMember));

// When mounted directly as teamRoutes child /api/teams/:teamId/projects
router.post('/', ...v.createProject, handleValidation, asyncHandler(projectController.create));
router.get('/', asyncHandler(projectController.listByTeam));

export default router;
