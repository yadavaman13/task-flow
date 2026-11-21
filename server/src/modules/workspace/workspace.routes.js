import { Router } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { handleValidation } from '../../core/middleware/handleValidation.js';
import * as v from './workspace.validator.js';
import * as ctrl from './workspace.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', ...v.createWorkspace, handleValidation, asyncHandler(ctrl.create));
router.get('/', asyncHandler(ctrl.list));
router.get('/:workspaceId', ...v.workspaceIdParam, handleValidation, asyncHandler(ctrl.get));
router.patch('/:workspaceId', ...v.updateWorkspace, handleValidation, asyncHandler(ctrl.update));

router.get('/:workspaceId/members', ...v.workspaceIdParam, handleValidation, asyncHandler(ctrl.getMembers));
router.patch('/:workspaceId/members/:userId', ...v.updateMemberRole, handleValidation, asyncHandler(ctrl.updateMemberRole));
router.delete('/:workspaceId/members/:userId', ...v.memberParam, handleValidation, asyncHandler(ctrl.removeMember));

export default router;
