import { body, param } from 'express-validator';

export const createProject = [
  param('teamId').isInt({ gt: 0 }),
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 160 }),
];
