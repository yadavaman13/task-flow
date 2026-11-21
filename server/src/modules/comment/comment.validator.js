import { body, param } from 'express-validator';

export const createComment = [
  param('taskId').isInt({ gt: 0 }).withMessage('Invalid task ID'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment cannot be empty'),
];

export const updateComment = [
  param('commentId').isInt({ gt: 0 }).withMessage('Invalid comment ID'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment cannot be empty'),
];

export const taskIdParam = [
  param('taskId').isInt({ gt: 0 }).withMessage('Invalid task ID'),
];

export const commentIdParam = [
  param('commentId').isInt({ gt: 0 }).withMessage('Invalid comment ID'),
];
