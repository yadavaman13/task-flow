import { Router } from 'express';
import { authenticate } from '../../../core/middleware/authenticate.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/send-verification-otp', authController.sendVerificationOtp);
router.post('/resend-verification-otp', authController.resendVerificationOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/verify-email', authController.verifyEmail);

// Authenticated routes
router.use(authenticate);
router.get('/me', authController.getProfile);
router.patch('/me', authController.updateProfile);
router.patch('/me/password', authController.changePassword);

export default router;
