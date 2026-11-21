import { Router } from 'express';
import { authenticate } from '../../../core/middleware/authenticate.js';
import * as workspaceController from '../controllers/workspace.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', workspaceController.create);
router.get('/', workspaceController.list);
router.get('/:workspaceId', workspaceController.get);
router.patch('/:workspaceId', workspaceController.update);

router.get('/:workspaceId/members', workspaceController.getMembers);
router.patch('/:workspaceId/members/:userId', workspaceController.updateMemberRole);
router.delete('/:workspaceId/members/:userId', workspaceController.removeMember);

export default router;
