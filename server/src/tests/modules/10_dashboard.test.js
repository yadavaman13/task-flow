import request from 'supertest';
import app from '../../app.js';
import { FeatureApiDocLogger } from '../helpers/md-logger.js';
import { createAndLoginTestUser } from '../helpers/auth-helper.js';

const docLogger = new FeatureApiDocLogger(
  '10_dashboard.md',
  'Feature 10: Metrics & Dashboard API',
  'Covers aggregated analytical metrics and statistics across workspaces, teams, projects, and member workload distributions.'
);

describe('10: Dashboard Module API', () => {
  let user;
  let workspace;
  let team;
  let project;

  beforeAll(async () => {
    user = await createAndLoginTestUser({ name: 'Dashboard User' });

    // Workspace
    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Authorization', user.authHeader)
      .send({ name: 'Dashboard Workspace' });
    workspace = wsRes.body.data;

    // Team
    const teamRes = await request(app)
      .post(`/api/workspaces/${workspace.id}/teams`)
      .set('Authorization', user.authHeader)
      .send({ name: 'Dashboard Analytics Team' });
    team = teamRes.body.data;

    // Project
    const projRes = await request(app)
      .post(`/api/teams/${team.id}/projects`)
      .set('Authorization', user.authHeader)
      .send({ name: 'Analytics Delivery Project' });
    project = projRes.body.data;

    // Task
    await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set('Authorization', user.authHeader)
      .send({ title: 'Dashboard Task 1', priority: 'HIGH' });
  });

  afterAll(() => {
    docLogger.save();
  });

  describe('GET /api/dashboard/workspace/:workspaceId', () => {
    it('should retrieve workspace dashboard stats', async () => {
      const res = await request(app)
        .get(`/api/dashboard/workspace/${workspace.id}`)
        .set('Authorization', user.authHeader);

      docLogger.record({
        scenario: 'Get Workspace Dashboard Stats',
        method: 'GET',
        endpoint: `/api/dashboard/workspace/${workspace.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Aggregates team counts, project counts, member counts, and active tasks.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/dashboard/team/:teamId', () => {
    it('should retrieve team dashboard stats', async () => {
      const res = await request(app)
        .get(`/api/dashboard/team/${team.id}`)
        .set('Authorization', user.authHeader);

      docLogger.record({
        scenario: 'Get Team Dashboard Stats',
        method: 'GET',
        endpoint: `/api/dashboard/team/${team.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Aggregates project stats and active members for a specific team.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/dashboard/project/:projectId', () => {
    it('should retrieve project dashboard stats', async () => {
      const res = await request(app)
        .get(`/api/dashboard/project/${project.id}`)
        .set('Authorization', user.authHeader);

      docLogger.record({
        scenario: 'Get Project Dashboard Stats',
        method: 'GET',
        endpoint: `/api/dashboard/project/${project.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Summarizes tasks by status (TODO, IN_PROGRESS, COMPLETED) and completion rate.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/dashboard/project/:projectId/workload', () => {
    it('should retrieve project workload distribution', async () => {
      const res = await request(app)
        .get(`/api/dashboard/project/${project.id}/workload`)
        .set('Authorization', user.authHeader);

      docLogger.record({
        scenario: 'Get Project Member Workload',
        method: 'GET',
        endpoint: `/api/dashboard/project/${project.id}/workload`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Displays assigned task distribution across project members.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
