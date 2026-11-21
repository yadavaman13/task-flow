import { Router } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { handleValidation } from '../../core/middleware/handleValidation.js';
import * as v from './invitation.validator.js';
import * as ctrl from './invitation.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Workspace-scoped invitation routes
router.post('/workspaces/:workspaceId/invitations', ...v.sendInvitation, handleValidation, asyncHandler(ctrl.send));
router.get('/workspaces/:workspaceId/invitations', ...v.workspaceIdParam, handleValidation, asyncHandler(ctrl.getByWorkspace));
router.patch('/workspaces/:workspaceId/invitations/:id/cancel', ...v.cancelInvitation, handleValidation, asyncHandler(ctrl.cancel));

// General invitation routes
router.get('/pending', asyncHandler(ctrl.getMyPending));
router.post('/accept', ...v.tokenBody, handleValidation, asyncHandler(ctrl.accept));
router.post('/decline', ...v.tokenBody, handleValidation, asyncHandler(ctrl.decline));

export default router;
