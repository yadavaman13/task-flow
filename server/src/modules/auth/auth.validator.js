import { body } from 'express-validator';

export const register = [
  body('name').trim().notEmpty().isLength({ max: 120 }).withMessage('Name required (max 120)'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 chars'),
];

export const login = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

export const updateProfile = [
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('avatarUrl').optional({ nullable: true }).isURL().isLength({ max: 2048 }),
];

export const changePassword = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8, max: 128 }).withMessage('New password must be 8-128 chars'),
];
