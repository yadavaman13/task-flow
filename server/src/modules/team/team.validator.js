import { body, param } from 'express-validator';

export const createTeam = [
  param('workspaceId').isInt({ gt: 0 }).withMessage('Invalid workspace ID'),
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

export const updateTeam = [
  param('teamId').isInt({ gt: 0 }).withMessage('Invalid team ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 120 }),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }),
];

export const teamIdParam = [
  param('teamId').isInt({ gt: 0 }).withMessage('Invalid team ID'),
];

export const addMember = [
  param('teamId').isInt({ gt: 0 }).withMessage('Invalid team ID'),
  body('userId').isInt({ gt: 0 }).withMessage('Valid user ID required'),
  body('role')
    .optional()
    .isIn(['TEAM_OWNER', 'TEAM_MEMBER'])
    .withMessage('Role must be TEAM_OWNER or TEAM_MEMBER'),
];

export const memberParam = [
  param('teamId').isInt({ gt: 0 }).withMessage('Invalid team ID'),
  param('userId').isInt({ gt: 0 }).withMessage('Invalid user ID'),
];
