import { body, param } from 'express-validator';

export const createTeam = [
  param('workspaceId').isInt({ gt: 0 }),
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 1000 }),
];
