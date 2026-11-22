import request from 'supertest';
import app from '../../app.js';
import { FeatureApiDocLogger } from '../helpers/md-logger.js';
import { createAndLoginTestUser } from '../helpers/auth-helper.js';

const docLogger = new FeatureApiDocLogger(
  '09_activity.md',
  'Feature 09: Audit & Activity Log API',
  'Covers retrieving audit activity logs across workspaces, projects, and specific tasks.'
);

describe('09: Activity Module API', () => {
  let user;
  let workspace;
  let team;
  let project;
  let task;

  beforeAll(async () => {
    user = await createAndLoginTestUser({ name: 'Activity Log User' });

    // Workspace
    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Authorization', user.authHeader)
      .send({ name: 'Activity Workspace' });
    workspace = wsRes.body.data;

    // Team
    const teamRes = await request(app)
      .post(`/api/workspaces/${workspace.id}/teams`)
      .set('Authorization', user.authHeader)
      .send({ name: 'Activity Team' });
    team = teamRes.body.data;

    // Project
    const projRes = await request(app)
      .post(`/api/teams/${team.id}/projects`)
      .set('Authorization', user.authHeader)
      .send({ name: 'Activity Project' });
    project = projRes.body.data;

    // Task
    const taskRes = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set('Authorization', user.authHeader)
      .send({ title: 'Activity Task' });
    task = taskRes.body.data;
  });

  afterAll(() => {
    docLogger.save();
  });

  describe('GET /api/activity/workspace/:workspaceId', () => {
    it('should retrieve activity logs for workspace', async () => {
      const res = await request(app)
        .get(`/api/activity/workspace/${workspace.id}`)
        .set('Authorization', user.authHeader);

      docLogger.record({
        scenario: 'Get Workspace Activities',
        method: 'GET',
        endpoint: `/api/activity/workspace/${workspace.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves chronological audit trail of all workspace events.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/activity/project/:projectId', () => {
    it('should retrieve activity logs for project', async () => {
      const res = await request(app)
        .get(`/api/activity/project/${project.id}`)
        .set('Authorization', user.authHeader);

      docLogger.record({
        scenario: 'Get Project Activities',
        method: 'GET',
        endpoint: `/api/activity/project/${project.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves audit activity logs specific to a project.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/activity/task/:taskId', () => {
    it('should retrieve activity logs for task', async () => {
      const res = await request(app)
        .get(`/api/activity/task/${task.id}`)
        .set('Authorization', user.authHeader);

      docLogger.record({
        scenario: 'Get Task Activities',
        method: 'GET',
        endpoint: `/api/activity/task/${task.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves history logs specific to a task lifecycle.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
