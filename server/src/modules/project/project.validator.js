import { body, param } from 'express-validator';

export const createProject = [
  param('teamId').isInt({ gt: 0 }).withMessage('Invalid team ID'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 160 })
    .withMessage('Name must be at most 160 characters'),
  body('description').optional({ nullable: true }).trim(),
  body('visibility')
    .optional()
    .isIn(['TEAM', 'PRIVATE'])
    .withMessage('Visibility must be TEAM or PRIVATE'),
  body('status')
    .optional()
    .isIn(['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'])
    .withMessage('Invalid status'),
  body('startDate').optional({ nullable: true }).isISO8601().toDate(),
  body('dueDate').optional({ nullable: true }).isISO8601().toDate(),
];

export const updateProject = [
  param('projectId').isInt({ gt: 0 }).withMessage('Invalid project ID'),
  body('name').optional().trim().notEmpty().isLength({ max: 160 }),
  body('description').optional({ nullable: true }).trim(),
  body('visibility').optional().isIn(['TEAM', 'PRIVATE']),
  body('status').optional().isIn(['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
  body('startDate').optional({ nullable: true }).isISO8601().toDate(),
  body('dueDate').optional({ nullable: true }).isISO8601().toDate(),
];

export const projectIdParam = [
  param('projectId').isInt({ gt: 0 }).withMessage('Invalid project ID'),
];

export const teamIdParam = [
  param('teamId').isInt({ gt: 0 }).withMessage('Invalid team ID'),
];

export const addMember = [
  param('projectId').isInt({ gt: 0 }).withMessage('Invalid project ID'),
  body('userId').isInt({ gt: 0 }).withMessage('Valid user ID required'),
  body('role')
    .optional()
    .isIn(['PROJECT_OWNER', 'PROJECT_MEMBER'])
    .withMessage('Role must be PROJECT_OWNER or PROJECT_MEMBER'),
];

export const memberParam = [
  param('projectId').isInt({ gt: 0 }).withMessage('Invalid project ID'),
  param('userId').isInt({ gt: 0 }).withMessage('Invalid user ID'),
];
