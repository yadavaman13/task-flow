import { body, param } from 'express-validator';

export const createWorkspace = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 1000 }),
];

export const updateWorkspace = [
  param('workspaceId').isInt({ gt: 0 }),
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 1000 }),
];
