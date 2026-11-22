import request from 'supertest';
import app from '../../app.js';
import { FeatureApiDocLogger } from '../helpers/md-logger.js';
import { createAndLoginTestUser } from '../helpers/auth-helper.js';

const docLogger = new FeatureApiDocLogger(
  '02_workspace.md',
  'Feature 02: Workspace Management API',
  'Covers workspace creation, listing, updating, member administration, and role assignments.'
);

describe('02: Workspace Module API', () => {
  let ownerUser;
  let memberUser;
  let createdWorkspace;

  beforeAll(async () => {
    ownerUser = await createAndLoginTestUser({ name: 'Workspace Owner' });
    memberUser = await createAndLoginTestUser({ name: 'Workspace Member' });
  });

  afterAll(() => {
    docLogger.save();
  });

  describe('POST /api/workspaces', () => {
    it('should create a new workspace successfully (201 Created)', async () => {
      const payload = {
        name: 'Engineering Workspace',
        description: 'Core product engineering and development',
      };

      const res = await request(app)
        .post('/api/workspaces')
        .set('Authorization', ownerUser.authHeader)
        .send(payload);

      docLogger.record({
        scenario: 'Create Workspace (Success)',
        method: 'POST',
        endpoint: '/api/workspaces',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: payload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Creates workspace, adds creator as OWNER, and logs audit activity.',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.role).toBe('OWNER');
      createdWorkspace = res.body.data;
    });

    it('should return 400 when workspace name is missing', async () => {
      const res = await request(app)
        .post('/api/workspaces')
        .set('Authorization', ownerUser.authHeader)
        .send({ name: '', description: 'Empty name' });

      docLogger.record({
        scenario: 'Create Workspace (Validation Failure)',
        method: 'POST',
        endpoint: '/api/workspaces',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { name: '', description: 'Empty name' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 400 when name is empty or missing.',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/workspaces', () => {
    it('should list all workspaces the authenticated user belongs to', async () => {
      const res = await request(app)
        .get('/api/workspaces')
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'List User Workspaces',
        method: 'GET',
        endpoint: '/api/workspaces',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves all workspaces where user is an active member or owner.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((w) => w.id === createdWorkspace.id)).toBe(true);
    });
  });

  describe('GET /api/workspaces/:workspaceId', () => {
    it('should get workspace details by ID for member', async () => {
      const res = await request(app)
        .get(`/api/workspaces/${createdWorkspace.id}`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Get Workspace by ID (Success)',
        method: 'GET',
        endpoint: `/api/workspaces/${createdWorkspace.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves workspace metadata and membership info.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdWorkspace.id);
    });

    it('should return 403 when non-member requests workspace details', async () => {
      const nonMember = await createAndLoginTestUser({ name: 'Non Member' });
      const res = await request(app)
        .get(`/api/workspaces/${createdWorkspace.id}`)
        .set('Authorization', nonMember.authHeader);

      docLogger.record({
        scenario: 'Get Workspace by ID (Access Denied)',
        method: 'GET',
        endpoint: `/api/workspaces/${createdWorkspace.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 403 when user is not a member of the workspace.',
      });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/workspaces/:workspaceId', () => {
    it('should update workspace metadata (200 OK)', async () => {
      const updatePayload = {
        name: 'Platform Engineering Workspace',
        description: 'Updated engineering description',
      };

      const res = await request(app)
        .patch(`/api/workspaces/${createdWorkspace.id}`)
        .set('Authorization', ownerUser.authHeader)
        .send(updatePayload);

      docLogger.record({
        scenario: 'Update Workspace Metadata',
        method: 'PATCH',
        endpoint: `/api/workspaces/${createdWorkspace.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: updatePayload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Updates name/description for OWNER or ADMIN.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(updatePayload.name);
    });
  });

  describe('GET /api/workspaces/:workspaceId/members', () => {
    it('should list all members of the workspace', async () => {
      const res = await request(app)
        .get(`/api/workspaces/${createdWorkspace.id}/members`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'List Workspace Members',
        method: 'GET',
        endpoint: `/api/workspaces/${createdWorkspace.id}/members`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves all members with roles and join dates.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PATCH & DELETE /api/workspaces/:workspaceId/members/:userId', () => {
    it('should update member role in workspace', async () => {
      // Add memberUser directly to workspace via query first
      const { insert: addMember } = await import('../../queries/workspaceMember.queries.js');
      await addMember({
        workspaceId: createdWorkspace.id,
        userId: memberUser.user.id,
        role: 'MEMBER',
      });

      const res = await request(app)
        .patch(`/api/workspaces/${createdWorkspace.id}/members/${memberUser.user.id}`)
        .set('Authorization', ownerUser.authHeader)
        .send({ role: 'ADMIN' });

      docLogger.record({
        scenario: 'Update Workspace Member Role',
        method: 'PATCH',
        endpoint: `/api/workspaces/${createdWorkspace.id}/members/${memberUser.user.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { role: 'ADMIN' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Changes a member role between OWNER, ADMIN, and MEMBER.',
      });

      expect(res.status).toBe(200);
    });

    it('should remove member from workspace', async () => {
      const res = await request(app)
        .delete(`/api/workspaces/${createdWorkspace.id}/members/${memberUser.user.id}`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Remove Member from Workspace',
        method: 'DELETE',
        endpoint: `/api/workspaces/${createdWorkspace.id}/members/${memberUser.user.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Removes member from workspace and cascades cleanup.',
      });

      expect(res.status).toBe(200);
    });
  });
});
