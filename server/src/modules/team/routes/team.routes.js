import { Router } from 'express';
import { authenticate } from '../../../core/middleware/authenticate.js';
import * as teamController from '../controllers/team.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', teamController.create);
router.get('/', teamController.list);
router.get('/:teamId', teamController.get);
router.patch('/:teamId', teamController.update);
router.patch('/:teamId/archive', teamController.archive);

router.get('/:teamId/members', teamController.getMembers);
router.post('/:teamId/members', teamController.addMember);
router.delete('/:teamId/members/:userId', teamController.removeMember);

export default router;
