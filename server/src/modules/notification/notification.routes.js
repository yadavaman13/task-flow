import { Router } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { handleValidation } from '../../core/middleware/handleValidation.js';
import * as v from './notification.validator.js';
import * as notificationController from './notification.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', ...v.listNotifications, handleValidation, asyncHandler(notificationController.list));
router.get('/unread-count', asyncHandler(notificationController.getUnreadCount));
router.patch('/read-all', asyncHandler(notificationController.markAllRead));
router.patch('/:id/read', ...v.notificationIdParam, handleValidation, asyncHandler(notificationController.markRead));

export default router;
