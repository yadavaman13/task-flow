import { param, query } from 'express-validator';

export const workspaceParam = [
  param('workspaceId').isInt({ gt: 0 }),
  query('page').optional().isInt({ gt: 0 }),
  query('limit').optional().isInt({ gt: 0 }),
];
