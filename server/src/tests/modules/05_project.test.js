import request from 'supertest';
import app from '../../app.js';
import { FeatureApiDocLogger } from '../helpers/md-logger.js';
import { createAndLoginTestUser } from '../helpers/auth-helper.js';

const docLogger = new FeatureApiDocLogger(
  '05_project.md',
  'Feature 05: Project Management API',
  'Covers project creation under teams, visibility rules, project membership, updates, and archiving.'
);

describe('05: Project Module API', () => {
  let ownerUser;
  let projectMemberUser;
  let workspace;
  let team;
  let createdProject;

  beforeAll(async () => {
    ownerUser = await createAndLoginTestUser({ name: 'Project Owner User' });
    projectMemberUser = await createAndLoginTestUser({ name: 'Project Member Candidate' });

    // Create workspace
    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Authorization', ownerUser.authHeader)
      .send({ name: 'Project Test Workspace' });
    workspace = wsRes.body.data;

    // Add projectMemberUser to workspace
    const { insert: addWsMember } = await import('../../queries/workspaceMember.queries.js');
    await addWsMember({
      workspaceId: workspace.id,
      userId: projectMemberUser.user.id,
      role: 'MEMBER',
    });

    // Create team
    const teamRes = await request(app)
      .post(`/api/workspaces/${workspace.id}/teams`)
      .set('Authorization', ownerUser.authHeader)
      .send({ name: 'Project Engineering Team' });
    team = teamRes.body.data;

    // Add projectMemberUser to team
    await request(app)
      .post(`/api/teams/${team.id}/members`)
      .set('Authorization', ownerUser.authHeader)
      .send({ userId: projectMemberUser.user.id, role: 'TEAM_MEMBER' });
  });

  afterAll(() => {
    docLogger.save();
  });

  describe('POST /api/teams/:teamId/projects', () => {
    it('should create a project successfully (201 Created)', async () => {
      const payload = {
        name: 'TaskFlow Web App',
        description: 'Next.js frontend and Express backend delivery',
        visibility: 'TEAM',
        status: 'ACTIVE',
      };

      const res = await request(app)
        .post(`/api/teams/${team.id}/projects`)
        .set('Authorization', ownerUser.authHeader)
        .send(payload);

      docLogger.record({
        scenario: 'Create Project (Success)',
        method: 'POST',
        endpoint: `/api/teams/${team.id}/projects`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: payload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Creates project under team and adds creator as PROJECT_OWNER.',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      createdProject = res.body.data;
    });

    it('should return 400 when project name is empty', async () => {
      const res = await request(app)
        .post(`/api/teams/${team.id}/projects`)
        .set('Authorization', ownerUser.authHeader)
        .send({ name: '' });

      docLogger.record({
        scenario: 'Create Project (Missing Name Error)',
        method: 'POST',
        endpoint: `/api/teams/${team.id}/projects`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { name: '' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 400 when name is missing.',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/teams/:teamId/projects', () => {
    it('should list all projects in the team', async () => {
      const res = await request(app)
        .get(`/api/teams/${team.id}/projects`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'List Team Projects',
        method: 'GET',
        endpoint: `/api/teams/${team.id}/projects`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves all projects belonging to the specified team.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/projects/:projectId', () => {
    it('should retrieve project details by ID', async () => {
      const res = await request(app)
        .get(`/api/projects/${createdProject.id}`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Get Project by ID',
        method: 'GET',
        endpoint: `/api/projects/${createdProject.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves single project record.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdProject.id);
    });
  });

  describe('PATCH /api/projects/:projectId', () => {
    it('should update project metadata (200 OK)', async () => {
      const updatePayload = {
        name: 'TaskFlow Mobile & Web App',
        description: 'Updated comprehensive project scope',
      };

      const res = await request(app)
        .patch(`/api/projects/${createdProject.id}`)
        .set('Authorization', ownerUser.authHeader)
        .send(updatePayload);

      docLogger.record({
        scenario: 'Update Project Details',
        method: 'PATCH',
        endpoint: `/api/projects/${createdProject.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: updatePayload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Updates project fields such as name, description, priority, dates.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(updatePayload.name);
    });
  });

  describe('POST & GET & DELETE /api/projects/:projectId/members', () => {
    it('should add a member to the project (201 Created)', async () => {
      const res = await request(app)
        .post(`/api/projects/${createdProject.id}/members`)
        .set('Authorization', ownerUser.authHeader)
        .send({
          userId: projectMemberUser.user.id,
          role: 'PROJECT_MEMBER',
        });

      docLogger.record({
        scenario: 'Add Project Member',
        method: 'POST',
        endpoint: `/api/projects/${createdProject.id}/members`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { userId: projectMemberUser.user.id, role: 'PROJECT_MEMBER' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Adds user to project member list with designated role.',
      });

      expect(res.status).toBe(201);
    });

    it('should list all project members', async () => {
      const res = await request(app)
        .get(`/api/projects/${createdProject.id}/members`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'List Project Members',
        method: 'GET',
        endpoint: `/api/projects/${createdProject.id}/members`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves all members assigned to project.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should remove member from project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${createdProject.id}/members/${projectMemberUser.user.id}`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Remove Project Member',
        method: 'DELETE',
        endpoint: `/api/projects/${createdProject.id}/members/${projectMemberUser.user.id}`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Removes member from project.',
      });

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/projects/:projectId/archive', () => {
    it('should archive project (200 OK)', async () => {
      const res = await request(app)
        .patch(`/api/projects/${createdProject.id}/archive`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Archive Project',
        method: 'PATCH',
        endpoint: `/api/projects/${createdProject.id}/archive`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Sets project status to ARCHIVED.',
      });

      expect(res.status).toBe(200);
    });
  });
});
