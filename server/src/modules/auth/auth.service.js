import bcrypt from 'bcrypt';
import * as userQ from '../../queries/user.queries.js';
import { envConfig } from '../../config/env.config.js';
import { signJwt } from '../../core/utils/token.js';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../core/errors/AppError.js';

export async function register({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userQ.findByEmail(normalizedEmail);
  if (existingUser) {
    throw new ConflictError('User already exists with this email');
  }

  const passwordHash = await bcrypt.hash(password, envConfig.bcrypt.saltRounds);
  const result = await userQ.insert({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const newUser = await userQ.findById(result.insertId);
  return newUser;
}

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userQ.findByEmail(normalizedEmail);
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.is_active) {
    throw new ForbiddenError('Account is deactivated');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = signJwt(user.id);
  const safeUser = await userQ.findById(user.id);

  return { token, user: safeUser };
}

export async function getProfile(userId) {
  const user = await userQ.findById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }
  return user;
}

export async function updateProfile(userId, { name, avatarUrl }) {
  await getProfile(userId);
  await userQ.updateProfile(userId, { name, avatarUrl });
  return userQ.findById(userId);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userQ.findByIdWithPassword(userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new BadRequestError('Current password does not match');
  }

  const passwordHash = await bcrypt.hash(newPassword, envConfig.bcrypt.saltRounds);
  await userQ.updatePassword(userId, passwordHash);
  return { message: 'Password updated successfully' };
}
