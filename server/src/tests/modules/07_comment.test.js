import request from 'supertest';
import app from '../../app.js';
import { FeatureApiDocLogger } from '../helpers/md-logger.js';
import { createAndLoginTestUser } from '../helpers/auth-helper.js';

const docLogger = new FeatureApiDocLogger(
  '07_comment.md',
  'Feature 07: Task Comment API',
  'Covers creating comments on tasks, listing comment threads, editing comments, and deleting comments.'
);

describe('07: Comment Module API', () => {
  let ownerUser;
  let workspace;
  let team;
  let project;
  let task;
  let createdComment;

  beforeAll(async () => {
    ownerUser = await createAndLoginTestUser({ name: 'Comment Author User' });

    // Workspace
    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Authorization', ownerUser.authHeader)
      .send({ name: 'Comment Module Workspace' });
    workspace = wsRes.body.data;

    // Team
    const teamRes = await request(app)
      .post(`/api/workspaces/${workspace.id}/teams`)
      .set('Authorization', ownerUser.authHeader)
      .send({ name: 'Comment Team' });
    team = teamRes.body.data;

    // Project
    const projRes = await request(app)
      .post(`/api/teams/${team.id}/projects`)
      .set('Authorization', ownerUser.authHeader)
      .send({ name: 'Comment Project' });
    project = projRes.body.data;

    // Task
    const taskRes = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set('Authorization', ownerUser.authHeader)
      .send({ title: 'Task with Comments' });
    task = taskRes.body.data;
  });

  afterAll(() => {
    docLogger.save();
  });

  describe('POST /api/tasks/:taskId/comments', () => {
    it('should add a comment to a task (201 Created)', async () => {
      const payload = {
        comment: 'Initial code review completed. Ready for QA testing.',
      };

      const res = await request(app)
        .post(`/api/tasks/${task.id}/comments`)
        .set('Authorization', ownerUser.authHeader)
        .send(payload);

      docLogger.record({
        scenario: 'Add Task Comment (Success)',
        method: 'POST',
        endpoint: `/api/tasks/${task.id}/comments`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: payload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Creates comment and notifies task creator/assignee.',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.comment).toBe(payload.comment);
      createdComment = res.body.data;
    });

    it('should return 400 when comment text is empty', async () => {
      const res = await request(app)
        .post(`/api/tasks/${task.id}/comments`)
        .set('Authorization', ownerUser.authHeader)
        .send({ comment: '' });

      docLogger.record({
        scenario: 'Add Task Comment (Empty Comment Error)',
        method: 'POST',
        endpoint: `/api/tasks/${task.id}/comments`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { comment: '' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 400 when comment is empty.',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks/:taskId/comments', () => {
    it('should list all comments for the task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${task.id}/comments`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'List Task Comments',
        method: 'GET',
        endpoint: `/api/tasks/${task.id}/comments`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves chronological comment list with author metadata.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/comments/:commentId', () => {
    it('should update existing comment (200 OK)', async () => {
      const updatePayload = {
        comment: 'Updated review note: all automated tests passed.',
      };

      const res = await request(app)
        .patch(`/api/comments/${createdComment.id}`)
        .set('Authorization', ownerUser.authHeader)
        .send(updatePayload);

      docLogger.record({
        scenario: 'Update Comment',
        method: 'PATCH',
        endpoint: `/api/comments/${createdComment.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: updatePayload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Updates comment text by author.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.comment).toBe(updatePayload.comment);
    });
  });

  describe('DELETE /api/comments/:commentId', () => {
    it('should delete comment (200 OK)', async () => {
      const res = await request(app)
        .delete(`/api/comments/${createdComment.id}`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Delete Comment',
        method: 'DELETE',
        endpoint: `/api/comments/${createdComment.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Deletes comment record.',
      });

      expect(res.status).toBe(200);
    });
  });
});
