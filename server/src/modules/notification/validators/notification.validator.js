import { param, query } from 'express-validator';

export const listNotifications = [
  query('isRead').optional().isBoolean(),
  query('page').optional().isInt({ gt: 0 }),
  query('limit').optional().isInt({ gt: 0 }),
];
