import { Router } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { handleValidation } from '../../core/middleware/handleValidation.js';
import * as v from './team.validator.js';
import * as teamController from './team.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', ...v.createTeam, handleValidation, asyncHandler(teamController.create));
router.get('/', asyncHandler(teamController.list));
router.get('/:teamId', ...v.teamIdParam, handleValidation, asyncHandler(teamController.get));
router.patch('/:teamId', ...v.updateTeam, handleValidation, asyncHandler(teamController.update));
router.patch('/:teamId/archive', ...v.teamIdParam, handleValidation, asyncHandler(teamController.archive));

router.get('/:teamId/members', ...v.teamIdParam, handleValidation, asyncHandler(teamController.getMembers));
router.post('/:teamId/members', ...v.addMember, handleValidation, asyncHandler(teamController.addMember));
router.delete('/:teamId/members/:userId', ...v.memberParam, handleValidation, asyncHandler(teamController.removeMember));

export default router;
