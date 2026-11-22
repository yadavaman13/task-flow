import bcrypt from 'bcrypt';
import redis from '../../../config/cache.config.js';
import { envConfig } from '../../../config/env.config.js';
import { signJwt } from '../../../core/utils/token.js';
import {
  findUserByEmail,
  getUserByEmail,
  createUser,
  findById,
  findByIdWithPassword,
  updateUser,
  updateProfile as updateProfileQuery,
  updatePassword as updatePasswordQuery,
} from '../../../queries/user.queries.js';
import {
  getOtpHtml,
  issueOtp,
  verifyOtp as verifyOtpUtil,
  resendOtp,
  normalizeEmail,
  normalizeOtp,
  OTP_PURPOSES,
} from '../../../utils/otp.utils.js';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedPassword = typeof password === 'string' ? password.trim() : '';

    if (!normalizedEmail || !normalizedName || !normalizedPassword) {
      return res.status(400).json({
        message: 'Name, Email and Password are required to create account.',
      });
    }

    const existingUser = await findUserByEmail({ normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email.',
      });
    }

    // Check if this email was pre-verified via OTP stored in Redis
    const isPreVerified = (await redis.get(`verified_email:${normalizedEmail}`)) === 'true';

    const hashedPassword = await bcrypt.hash(normalizedPassword, envConfig.bcrypt.saltRounds);

    const user = await createUser({
      normalizedName,
      normalizedEmail,
      hashedPassword,
      isVerified: isPreVerified,
    });

    if (isPreVerified) {
      await redis.del(`verified_email:${normalizedEmail}`);
    }

    return res.status(201).json({
      message: 'User registered successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        isVerified: Boolean(user.is_verified),
        isActive: Boolean(user.is_active),
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = typeof password === 'string' ? password.trim() : '';

    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const user = await findUserByEmail({ normalizedEmail });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        message: 'Account is deactivated.',
      });
    }

    const isMatch = await bcrypt.compare(normalizedPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const token = signJwt(user.id);
    const safeUser = await findById(user.id);

    if (envConfig.AUTH_COOKIE_OPTIONS) {
      res.cookie('token', token, envConfig.AUTH_COOKIE_OPTIONS);
    }

    return res.status(200).json({
      message: 'Logged in successfully',
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function logout(req, res) {
  try {
    if (envConfig.AUTH_COOKIE_OPTIONS) {
      res.clearCookie('token', envConfig.AUTH_COOKIE_OPTIONS);
    }
    return res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function sendVerificationOtp(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({
        message: 'Please enter email to send verification email',
      });
    }

    const otpResult = await issueOtp({
      email,
      purpose: OTP_PURPOSES.VERIFY_EMAIL,
      subject: 'Email Verification OTP',
      buildHtml: getOtpHtml,
    });

    if (!otpResult.ok) {
      return res.status(400).json({
        message: 'Unable to generate OTP',
      });
    }

    return res.status(200).json({
      message: 'Email verification OTP sent successfully',
      data: {
        expiresIn: otpResult.expiresIn,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function resendVerificationOtp(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({
        message: 'Please enter email to resend verification email',
      });
    }

    const result = await resendOtp({
      email,
      purpose: OTP_PURPOSES.VERIFY_EMAIL,
      subject: 'Email Verification OTP',
      buildHtml: getOtpHtml,
    });

    if (!result.ok) {
      if (result.reason === 'cooldown') {
        return res.status(429).json({
          message: `Please wait ${result.cooldownRemaining}s before requesting a new OTP`,
          cooldownRemaining: result.cooldownRemaining,
        });
      }
      if (result.reason === 'resend-limit') {
        return res.status(429).json({
          message: 'Maximum OTP resend limit reached. Please try again later.',
        });
      }
      if (result.reason === 'missing') {
        return res.status(404).json({
          message: 'No active OTP request found. Please request a new OTP.',
        });
      }
      return res.status(400).json({
        message: 'Unable to resend OTP',
      });
    }

    return res.status(200).json({
      message: 'Email verification OTP resent successfully',
      data: {
        expiresIn: result.expiresIn,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function verifyOtp(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = normalizeOtp(req.body?.otp);

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required',
      });
    }

    const verifyResult = await verifyOtpUtil({
      email,
      otp,
      purpose: OTP_PURPOSES.VERIFY_EMAIL,
    });

    if (!verifyResult.ok) {
      if (verifyResult.reason === 'locked') {
        return res.status(429).json({
          message: 'Too many attempts. Please register again.',
        });
      }

      if (verifyResult.reason === 'expired') {
        return res.status(400).json({
          message: 'OTP expired',
        });
      }

      if (verifyResult.reason === 'invalid') {
        return res.status(400).json({
          message: 'Invalid OTP',
          attemptsLeft: verifyResult.attemptsLeft,
          cooldownRemaining: verifyResult.cooldownRemaining,
        });
      }

      return res.status(400).json({
        message: 'OTP expired or invalid',
      });
    }

    const user = await getUserByEmail(email);
    if (user) {
      await updateUser(user.id, { emailVerified: true, isActive: true });
    } else {
      await redis.set(`verified_email:${email}`, 'true', 'EX', 3600);
    }

    return res.status(200).json({
      message: 'Email verified successfully',
      data: {
        email,
        isVerified: true,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

/** Backward compatibility alias for verifyOtp */
export const verifyEmail = verifyOtp;

export async function getProfile(req, res) {
  try {
    const user = await findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      message: 'Profile fetched successfully',
      data: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, avatarUrl } = req.body;

    const user = await findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await updateProfileQuery(req.user.id, {
      name: typeof name === 'string' ? name.trim() : undefined,
      avatarUrl: typeof avatarUrl === 'string' ? avatarUrl.trim() : undefined,
    });

    const updated = await findById(req.user.id);
    return res.status(200).json({
      message: 'Profile updated successfully',
      data: updated,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    const normalizedCurrent = typeof currentPassword === 'string' ? currentPassword.trim() : '';
    const normalizedNew = typeof newPassword === 'string' ? newPassword.trim() : '';

    if (!normalizedCurrent || !normalizedNew) {
      return res.status(400).json({
        message: 'Current password and new password are required.',
      });
    }

    if (normalizedNew.length < 8) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long.',
      });
    }

    const user = await findByIdWithPassword(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(normalizedCurrent, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password does not match.',
      });
    }

    const passwordHash = await bcrypt.hash(normalizedNew, envConfig.bcrypt.saltRounds);
    await updatePasswordQuery(req.user.id, passwordHash);

    return res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
