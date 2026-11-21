import { body, param, query } from 'express-validator';

export const createTask = [
  param('projectId').isInt({ gt: 0 }).withMessage('Invalid project ID'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('description').optional({ nullable: true }).trim(),
  body('assignedTo').optional({ nullable: true }).isInt({ gt: 0 }),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority'),
  body('dueDate').optional({ nullable: true }).isISO8601().toDate(),
];

export const updateTask = [
  param('taskId').isInt({ gt: 0 }).withMessage('Invalid task ID'),
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional({ nullable: true }).trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('dueDate').optional({ nullable: true }).isISO8601().toDate(),
];

export const updateStatus = [
  param('taskId').isInt({ gt: 0 }).withMessage('Invalid task ID'),
  body('status')
    .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'COMPLETED'])
    .withMessage('Invalid task status'),
];

export const assignTask = [
  param('taskId').isInt({ gt: 0 }).withMessage('Invalid task ID'),
  body('assignedTo')
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage('assignedTo must be a valid user ID or null'),
];

export const taskIdParam = [
  param('taskId').isInt({ gt: 0 }).withMessage('Invalid task ID'),
];

export const projectIdParam = [
  param('projectId').isInt({ gt: 0 }).withMessage('Invalid project ID'),
];

export const listTasks = [
  param('projectId').isInt({ gt: 0 }).withMessage('Invalid project ID'),
  query('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'COMPLETED']),
  query('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  query('assignedTo').optional().isInt({ gt: 0 }),
  query('page').optional().isInt({ gt: 0 }),
  query('limit').optional().isInt({ gt: 0 }),
];
