import request from 'supertest';
import app from '../../app.js';
import { FeatureApiDocLogger } from '../helpers/md-logger.js';
import { createAndLoginTestUser } from '../helpers/auth-helper.js';

const docLogger = new FeatureApiDocLogger(
  '04_team.md',
  'Feature 04: Team Management API',
  'Covers team creation within workspaces, listing, member assignment, role updates, and team archiving.'
);

describe('04: Team Module API', () => {
  let ownerUser;
  let teamMemberUser;
  let workspace;
  let createdTeam;

  beforeAll(async () => {
    ownerUser = await createAndLoginTestUser({ name: 'Team Owner User' });
    teamMemberUser = await createAndLoginTestUser({ name: 'Team Member Candidate' });

    // Create workspace
    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Authorization', ownerUser.authHeader)
      .send({ name: 'Team Test Workspace' });
    workspace = wsRes.body.data;

    // Add teamMemberUser to workspace
    const { insert: addWsMember } = await import('../../queries/workspaceMember.queries.js');
    await addWsMember({
      workspaceId: workspace.id,
      userId: teamMemberUser.user.id,
      role: 'MEMBER',
    });
  });

  afterAll(() => {
    docLogger.save();
  });

  describe('POST /api/workspaces/:workspaceId/teams', () => {
    it('should create a new team in workspace (201 Created)', async () => {
      const payload = {
        name: 'Backend Dev Team',
        description: 'Microservices and backend engineering team',
      };

      const res = await request(app)
        .post(`/api/workspaces/${workspace.id}/teams`)
        .set('Authorization', ownerUser.authHeader)
        .send(payload);

      docLogger.record({
        scenario: 'Create Team (Success)',
        method: 'POST',
        endpoint: `/api/workspaces/${workspace.id}/teams`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: payload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Creates team in workspace and designates creator as TEAM_OWNER.',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.role).toBe('TEAM_OWNER');
      createdTeam = res.body.data;
    });

    it('should return 400 when team name is missing', async () => {
      const res = await request(app)
        .post(`/api/workspaces/${workspace.id}/teams`)
        .set('Authorization', ownerUser.authHeader)
        .send({ name: '' });

      docLogger.record({
        scenario: 'Create Team (Missing Name Error)',
        method: 'POST',
        endpoint: `/api/workspaces/${workspace.id}/teams`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { name: '' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 400 when team name is empty.',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/workspaces/:workspaceId/teams', () => {
    it('should list all teams in the workspace', async () => {
      const res = await request(app)
        .get(`/api/workspaces/${workspace.id}/teams`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'List Workspace Teams',
        method: 'GET',
        endpoint: `/api/workspaces/${workspace.id}/teams`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves all active teams in the given workspace.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/teams/:teamId', () => {
    it('should retrieve team details by ID', async () => {
      const res = await request(app)
        .get(`/api/teams/${createdTeam.id}`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Get Team by ID',
        method: 'GET',
        endpoint: `/api/teams/${createdTeam.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves team record by ID.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdTeam.id);
    });
  });

  describe('PATCH /api/teams/:teamId', () => {
    it('should update team metadata (200 OK)', async () => {
      const updatePayload = {
        name: 'Core Platform Team',
        description: 'Updated core platform and APIs',
      };

      const res = await request(app)
        .patch(`/api/teams/${createdTeam.id}`)
        .set('Authorization', ownerUser.authHeader)
        .send(updatePayload);

      docLogger.record({
        scenario: 'Update Team Details',
        method: 'PATCH',
        endpoint: `/api/teams/${createdTeam.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: updatePayload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Updates team name and description.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(updatePayload.name);
    });
  });

  describe('POST /api/teams/:teamId/members & GET members', () => {
    it('should add a member to the team (201 Created)', async () => {
      const res = await request(app)
        .post(`/api/teams/${createdTeam.id}/members`)
        .set('Authorization', ownerUser.authHeader)
        .send({
          userId: teamMemberUser.user.id,
          role: 'TEAM_MEMBER',
        });

      docLogger.record({
        scenario: 'Add Team Member',
        method: 'POST',
        endpoint: `/api/teams/${createdTeam.id}/members`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { userId: teamMemberUser.user.id, role: 'TEAM_MEMBER' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Adds a workspace member to the team roster.',
      });

      expect(res.status).toBe(201);
    });

    it('should list all members of the team', async () => {
      const res = await request(app)
        .get(`/api/teams/${createdTeam.id}/members`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'List Team Members',
        method: 'GET',
        endpoint: `/api/teams/${createdTeam.id}/members`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves all users belonging to the team.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/teams/:teamId/members/:userId', () => {
    it('should remove a member from the team', async () => {
      const res = await request(app)
        .delete(`/api/teams/${createdTeam.id}/members/${teamMemberUser.user.id}`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Remove Team Member',
        method: 'DELETE',
        endpoint: `/api/teams/${createdTeam.id}/members/${teamMemberUser.user.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Removes member from team.',
      });

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/teams/:teamId/archive', () => {
    it('should archive the team (200 OK)', async () => {
      const res = await request(app)
        .patch(`/api/teams/${createdTeam.id}/archive`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Archive Team',
        method: 'PATCH',
        endpoint: `/api/teams/${createdTeam.id}/archive`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Sets team status to ARCHIVED.',
      });

      expect(res.status).toBe(200);
    });
  });
});
