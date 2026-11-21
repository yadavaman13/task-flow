import { param, query } from 'express-validator';

export const listNotifications = [
  query('isRead').optional().isBoolean().toBoolean(),
  query('page').optional().isInt({ gt: 0 }),
  query('limit').optional().isInt({ gt: 0 }),
];

export const notificationIdParam = [
  param('id').isInt({ gt: 0 }).withMessage('Invalid notification ID'),
];
