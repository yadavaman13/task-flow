import { body, param } from 'express-validator';

export const createWorkspace = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 120 })
    .withMessage('Name must be at most 120 characters'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
];

export const updateWorkspace = [
  param('workspaceId').isInt({ gt: 0 }).withMessage('Invalid workspace ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Name must be at most 120 characters'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
];

export const workspaceIdParam = [
  param('workspaceId').isInt({ gt: 0 }).withMessage('Invalid workspace ID'),
];

export const memberParam = [
  param('workspaceId').isInt({ gt: 0 }).withMessage('Invalid workspace ID'),
  param('userId').isInt({ gt: 0 }).withMessage('Invalid user ID'),
];

export const updateMemberRole = [
  param('workspaceId').isInt({ gt: 0 }).withMessage('Invalid workspace ID'),
  param('userId').isInt({ gt: 0 }).withMessage('Invalid user ID'),
  body('role')
    .isIn(['ADMIN', 'MEMBER'])
    .withMessage('Role must be ADMIN or MEMBER'),
];
