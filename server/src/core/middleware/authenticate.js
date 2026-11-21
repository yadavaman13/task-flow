import jwt from 'jsonwebtoken';
import { envConfig } from '../../config/env.config.js';
import { UnauthorizedError } from '../errors/AppError.js';

export function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  try {
    const payload = jwt.verify(header.split(' ')[1], envConfig.jwt.secret);
    req.user = { id: payload.userId };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
