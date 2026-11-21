import { Router } from 'express';
import { register, sendVerificationOtp } from '../controllers/auth.controller';

const router = Router();

//Public routes
router.post('/register', register);
router.post('/send-verification-otp', sendVerificationOtp);

export default router;
