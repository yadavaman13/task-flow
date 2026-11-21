import { Router } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { handleValidation } from '../../core/middleware/handleValidation.js';
import * as v from './auth.validator.js';
import * as ctrl from './auth.controller.js';

const router = Router();

// Public routes
router.post('/register', ...v.register, handleValidation, asyncHandler(ctrl.register));
router.post('/login', ...v.login, handleValidation, asyncHandler(ctrl.login));
router.post('/send-verification-otp', asyncHandler(ctrl.sendVerificationOtp));

// Authenticated routes
router.use(authenticate);
router.get('/me', asyncHandler(ctrl.getProfile));
router.patch('/me', ...v.updateProfile, handleValidation, asyncHandler(ctrl.updateProfile));
router.patch('/me/password', ...v.changePassword, handleValidation, asyncHandler(ctrl.changePassword));

export default router;
