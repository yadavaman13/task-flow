import * as authService from './auth.service.js';
import { success, created } from '../../core/utils/responseHelper.js';
import { getOtpHtml, issueOtp, OTP_PURPOSES } from '../../utils/otp.utils.js';

export async function register(req, res) {
  const { name, email, password } = req.body;
  const user = await authService.register({ name, email, password });
  return created(res, user, 'User registered successfully');
}

export async function login(req, res) {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return success(res, result, 'Logged in successfully');
}

export async function getProfile(req, res) {
  const user = await authService.getProfile(req.user.id);
  return success(res, user);
}

export async function updateProfile(req, res) {
  const user = await authService.updateProfile(req.user.id, req.body);
  return success(res, user, 'Profile updated successfully');
}

export async function changePassword(req, res) {
  const result = await authService.changePassword(req.user.id, req.body);
  return success(res, result, 'Password changed successfully');
}

/** Preserving OTP functionality written by user */
export async function sendVerificationOtp(req, res) {
  const { email } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Please enter email to send verification email' },
    });
  }

  const otpResult = await issueOtp({
    email: normalizedEmail,
    purpose: OTP_PURPOSES.VERIFY_EMAIL,
    subject: 'Email Verification OTP',
    buildHtml: getOtpHtml,
  });

  if (!otpResult.ok) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Unable to generate OTP' },
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Email verification OTP sent successfully',
  });
}
