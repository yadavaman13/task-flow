import { Router } from 'express';
import { authenticate } from '../../../core/middleware/authenticate.js';
import * as invitationController from '../controllers/invitation.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Workspace nested routes
router.post('/workspaces/:workspaceId/invitations', invitationController.send);
router.get('/workspaces/:workspaceId/invitations', invitationController.getByWorkspace);
router.patch('/workspaces/:workspaceId/invitations/:id/cancel', invitationController.cancel);

// General invitation routes
router.get('/pending', invitationController.getMyPending);
router.post('/accept', invitationController.accept);
router.post('/decline', invitationController.decline);

export default router;
