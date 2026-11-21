import { body, param } from 'express-validator';

export const createTask = [
  param('projectId').isInt({ gt: 0 }),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
];
