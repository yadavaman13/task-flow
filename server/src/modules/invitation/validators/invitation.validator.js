import { body, param } from 'express-validator';

export const sendInvitation = [
  param('workspaceId').isInt({ gt: 0 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['ADMIN', 'MEMBER']),
];
