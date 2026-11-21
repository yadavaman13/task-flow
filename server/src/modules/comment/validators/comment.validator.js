import { body, param } from 'express-validator';

export const createComment = [
  param('taskId').isInt({ gt: 0 }),
  body('comment').trim().notEmpty().withMessage('Comment cannot be empty'),
];
