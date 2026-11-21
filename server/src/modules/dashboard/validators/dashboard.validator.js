import { param } from 'express-validator';

export const workspaceIdParam = [param('workspaceId').isInt({ gt: 0 })];
export const teamIdParam = [param('teamId').isInt({ gt: 0 })];
export const projectIdParam = [param('projectId').isInt({ gt: 0 })];
