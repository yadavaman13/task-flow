import request from 'supertest';
import app from '../../app.js';
import { FeatureApiDocLogger } from '../helpers/md-logger.js';
import { createAndLoginTestUser } from '../helpers/auth-helper.js';

const docLogger = new FeatureApiDocLogger(
  '06_task.md',
  'Feature 06: Task Management API',
  'Covers task creation under projects, status lifecycle updates, priority assignments, assignment to team members, and deletion.'
);

describe('06: Task Module API', () => {
  let ownerUser;
  let assigneeUser;
  let workspace;
  let team;
  let project;
  let createdTask;

  beforeAll(async () => {
    ownerUser = await createAndLoginTestUser({ name: 'Task Manager User' });
    assigneeUser = await createAndLoginTestUser({ name: 'Task Assignee User' });

    // Create workspace
    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Authorization', ownerUser.authHeader)
      .send({ name: 'Task Module Workspace' });
    workspace = wsRes.body.data;

    // Add assigneeUser to workspace
    const { insert: addWsMember } = await import('../../queries/workspaceMember.queries.js');
    await addWsMember({
      workspaceId: workspace.id,
      userId: assigneeUser.user.id,
      role: 'MEMBER',
    });

    // Create team
    const teamRes = await request(app)
      .post(`/api/workspaces/${workspace.id}/teams`)
      .set('Authorization', ownerUser.authHeader)
      .send({ name: 'Task Sprint Team' });
    team = teamRes.body.data;

    // Add assigneeUser to team
    await request(app)
      .post(`/api/teams/${team.id}/members`)
      .set('Authorization', ownerUser.authHeader)
      .send({ userId: assigneeUser.user.id, role: 'TEAM_MEMBER' });

    // Create project
    const projRes = await request(app)
      .post(`/api/teams/${team.id}/projects`)
      .set('Authorization', ownerUser.authHeader)
      .send({ name: 'Sprint 1 Tasks Project' });
    project = projRes.body.data;

    // Add assigneeUser to project
    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set('Authorization', ownerUser.authHeader)
      .send({ userId: assigneeUser.user.id, role: 'PROJECT_MEMBER' });
  });

  afterAll(() => {
    docLogger.save();
  });

  describe('POST /api/projects/:projectId/tasks', () => {
    it('should create a task successfully (201 Created)', async () => {
      const payload = {
        title: 'Implement Authentication Tests',
        description: 'Write end-to-end integration tests using Jest and Supertest',
        priority: 'HIGH',
        dueDate: '2026-12-01',
      };

      const res = await request(app)
        .post(`/api/projects/${project.id}/tasks`)
        .set('Authorization', ownerUser.authHeader)
        .send(payload);

      docLogger.record({
        scenario: 'Create Task (Success)',
        method: 'POST',
        endpoint: `/api/projects/${project.id}/tasks`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: payload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Creates new task in project with TODO status and logs activity.',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe(payload.title);
      createdTask = res.body.data;
    });

    it('should return 400 when task title is missing', async () => {
      const res = await request(app)
        .post(`/api/projects/${project.id}/tasks`)
        .set('Authorization', ownerUser.authHeader)
        .send({ title: '' });

      docLogger.record({
        scenario: 'Create Task (Missing Title Error)',
        method: 'POST',
        endpoint: `/api/projects/${project.id}/tasks`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { title: '' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 400 when title is empty.',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects/:projectId/tasks', () => {
    it('should list all tasks in the project', async () => {
      const res = await request(app)
        .get(`/api/projects/${project.id}/tasks`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'List Project Tasks',
        method: 'GET',
        endpoint: `/api/projects/${project.id}/tasks`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves all tasks in project with pagination.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/tasks/:taskId', () => {
    it('should get task details by ID', async () => {
      const res = await request(app)
        .get(`/api/tasks/${createdTask.id}`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Get Task by ID',
        method: 'GET',
        endpoint: `/api/tasks/${createdTask.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves task details and assigned user information.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdTask.id);
    });
  });

  describe('PATCH /api/tasks/:taskId', () => {
    it('should update task details (200 OK)', async () => {
      const updatePayload = {
        title: 'Implement Auth Tests with Full Coverage',
        description: 'Cover all edge cases and error states',
        priority: 'URGENT',
      };

      const res = await request(app)
        .patch(`/api/tasks/${createdTask.id}`)
        .set('Authorization', ownerUser.authHeader)
        .send(updatePayload);

      docLogger.record({
        scenario: 'Update Task Details',
        method: 'PATCH',
        endpoint: `/api/tasks/${createdTask.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: updatePayload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Updates task title, description, or priority.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe('URGENT');
    });
  });

  describe('PATCH /api/tasks/:taskId/status', () => {
    it('should update task status (200 OK)', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTask.id}/status`)
        .set('Authorization', ownerUser.authHeader)
        .send({ status: 'IN_PROGRESS' });

      docLogger.record({
        scenario: 'Update Task Status',
        method: 'PATCH',
        endpoint: `/api/tasks/${createdTask.id}/status`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { status: 'IN_PROGRESS' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Transitions task through workflow (TODO -> IN_PROGRESS -> COMPLETED).',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });
  });

  describe('PATCH /api/tasks/:taskId/assign', () => {
    it('should assign task to another project member (200 OK)', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTask.id}/assign`)
        .set('Authorization', ownerUser.authHeader)
        .send({ assignedTo: assigneeUser.user.id });

      docLogger.record({
        scenario: 'Assign Task',
        method: 'PATCH',
        endpoint: `/api/tasks/${createdTask.id}/assign`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { assignedTo: assigneeUser.user.id },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Assigns task to member and triggers TASK_ASSIGNED notification.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.assigned_to).toBe(assigneeUser.user.id);
    });
  });

  describe('DELETE /api/tasks/:taskId', () => {
    it('should delete task (200 OK)', async () => {
      // Create a temporary task to delete
      const tempTaskRes = await request(app)
        .post(`/api/projects/${project.id}/tasks`)
        .set('Authorization', ownerUser.authHeader)
        .send({ title: 'Temporary task to delete' });
      const tempTaskId = tempTaskRes.body.data.id;

      const res = await request(app)
        .delete(`/api/tasks/${tempTaskId}`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Delete Task',
        method: 'DELETE',
        endpoint: `/api/tasks/${tempTaskId}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Deletes task and associated comments.',
      });

      expect(res.status).toBe(200);
    });
  });
});
