import express from 'express';
import cors from 'cors';
import { errorHandler } from './core/middleware/errorHandler.js';
import { query } from './config/db.js';

// Module routes
import authRoutes from './modules/auth/index.js';
import workspaceRoutes from './modules/workspace/index.js';
import invitationRoutes from './modules/invitation/index.js';
import teamRoutes from './modules/team/index.js';
import projectRoutes from './modules/project/index.js';
import taskRoutes from './modules/task/index.js';
import commentRoutes from './modules/comment/index.js';
import notificationRoutes from './modules/notification/index.js';
import activityRoutes from './modules/activity/index.js';
import dashboardRoutes from './modules/dashboard/index.js';

export const app = express();

// ─── Global Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ─────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ success: true, message: 'OK' });
  } catch {
    res.status(500).json({ success: false, message: 'DB unreachable' });
  }
});

// ─── Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/workspaces/:workspaceId/teams', teamRoutes);
app.use('/api/teams/:teamId/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/tasks/:taskId/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Additional top-level resource routes (direct access by ID)
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);

// ─── 404 Handler ──────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ─── Global Error Handler ─────────────────────────────
app.use(errorHandler);

export default app;
