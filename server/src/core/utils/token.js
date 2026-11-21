import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { envConfig } from '../../config/env.config.js';

export const signJwt = (userId) =>
  jwt.sign({ userId }, envConfig.jwt.secret, { expiresIn: envConfig.jwt.expiresIn });

export const verifyJwt = (token) => jwt.verify(token, envConfig.jwt.secret);

export function generateInvitationToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
}

export const hashToken = (raw) =>
  crypto.createHash('sha256').update(raw).digest('hex');
