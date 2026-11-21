import { body, param } from 'express-validator';

export const sendInvitation = [
  param('workspaceId').isInt({ gt: 0 }).withMessage('Invalid workspace ID'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MEMBER'])
    .withMessage('Role must be ADMIN or MEMBER'),
];

export const tokenBody = [
  body('token').trim().notEmpty().withMessage('Invitation token required'),
];

export const cancelInvitation = [
  param('id').isInt({ gt: 0 }).withMessage('Invalid invitation ID'),
  param('workspaceId').optional().isInt({ gt: 0 }),
];

export const workspaceIdParam = [
  param('workspaceId').isInt({ gt: 0 }).withMessage('Invalid workspace ID'),
];
