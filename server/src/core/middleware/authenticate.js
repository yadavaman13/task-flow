import jwt from 'jsonwebtoken';
import { envConfig } from '../../config/env.config.js';
import { UnauthorizedError } from '../errors/AppError.js';

export function authenticate(req, _res, next) {
  let token = null;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  try {
    const payload = jwt.verify(token, envConfig.JWT_SECRET || envConfig.jwt.secret);
    req.user = { id: payload.userId };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
