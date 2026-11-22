import request from 'supertest';
import app from '../../app.js';
import { FeatureApiDocLogger } from '../helpers/md-logger.js';
import { createAndLoginTestUser } from '../helpers/auth-helper.js';

const docLogger = new FeatureApiDocLogger(
  '03_invitation.md',
  'Feature 03: Workspace Invitation API',
  'Covers sending invitations, querying pending invites, accepting, declining, and cancelling invitations.'
);

describe('03: Invitation Module API', () => {
  let ownerUser;
  let inviteeUser;
  let workspace;
  let pendingInvite;

  beforeAll(async () => {
    ownerUser = await createAndLoginTestUser({ name: 'Invitation Owner' });
    inviteeUser = await createAndLoginTestUser({ name: 'Invitee Candidate' });

    // Create a workspace owned by ownerUser
    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Authorization', ownerUser.authHeader)
      .send({ name: 'Invitation Test Workspace' });
    workspace = wsRes.body.data;
  });

  afterAll(() => {
    docLogger.save();
  });

  describe('POST /api/invitations/workspaces/:workspaceId/invitations', () => {
    it('should send a workspace invitation to an email (201 Created)', async () => {
      const invitePayload = {
        email: inviteeUser.user.email,
        role: 'MEMBER',
      };

      const res = await request(app)
        .post(`/api/invitations/workspaces/${workspace.id}/invitations`)
        .set('Authorization', ownerUser.authHeader)
        .send(invitePayload);

      docLogger.record({
        scenario: 'Send Workspace Invitation (Success)',
        method: 'POST',
        endpoint: `/api/invitations/workspaces/${workspace.id}/invitations`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: invitePayload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Generates an invitation token with 72h expiry and sends notification/email.',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      pendingInvite = res.body.data;
    });

    it('should return 400 when invitation email is missing', async () => {
      const res = await request(app)
        .post(`/api/invitations/workspaces/${workspace.id}/invitations`)
        .set('Authorization', ownerUser.authHeader)
        .send({ email: '' });

      docLogger.record({
        scenario: 'Send Workspace Invitation (Missing Email Error)',
        method: 'POST',
        endpoint: `/api/invitations/workspaces/${workspace.id}/invitations`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { email: '' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 400 when email is not provided.',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/invitations/workspaces/:workspaceId/invitations', () => {
    it('should list all invitations for the workspace', async () => {
      const res = await request(app)
        .get(`/api/invitations/workspaces/${workspace.id}/invitations`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'List Workspace Invitations',
        method: 'GET',
        endpoint: `/api/invitations/workspaces/${workspace.id}/invitations`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves all sent invitations for the given workspace.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/invitations/pending', () => {
    it('should list pending invitations for the authenticated invitee', async () => {
      const res = await request(app)
        .get('/api/invitations/pending')
        .set('Authorization', inviteeUser.authHeader);

      docLogger.record({
        scenario: 'Get User Pending Invitations',
        method: 'GET',
        endpoint: '/api/invitations/pending',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Lists all pending invitations matching the current user email.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/invitations/accept & /decline', () => {
    it('should accept an invitation using token', async () => {
      const token = pendingInvite.token;
      const res = await request(app)
        .post('/api/invitations/accept')
        .set('Authorization', inviteeUser.authHeader)
        .send({ token });

      docLogger.record({
        scenario: 'Accept Workspace Invitation',
        method: 'POST',
        endpoint: '/api/invitations/accept',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { token: 'RAW_INVITATION_TOKEN' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Marks invitation as ACCEPTED and adds user to workspace_members.',
      });

      expect(res.status).toBe(200);
    });

    it('should return 404 when accepting an invalid or non-existent invitation', async () => {
      const res = await request(app)
        .post('/api/invitations/accept')
        .set('Authorization', inviteeUser.authHeader)
        .send({ token: 'invalid_token_12345' });

      docLogger.record({
        scenario: 'Accept Invitation (Invalid Token Error)',
        method: 'POST',
        endpoint: '/api/invitations/accept',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: { token: 'invalid_token_12345' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 404 when token does not match an active pending invitation.',
      });

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/invitations/workspaces/:workspaceId/invitations/:id/cancel', () => {
    it('should cancel an invitation (200 OK)', async () => {
      // Create another invite to cancel
      const anotherUser = await createAndLoginTestUser({ name: 'Cancel Target' });
      const createRes = await request(app)
        .post(`/api/invitations/workspaces/${workspace.id}/invitations`)
        .set('Authorization', ownerUser.authHeader)
        .send({ email: anotherUser.user.email, role: 'MEMBER' });

      const inviteId = createRes.body.data.id;

      const res = await request(app)
        .patch(`/api/invitations/workspaces/${workspace.id}/invitations/${inviteId}/cancel`)
        .set('Authorization', ownerUser.authHeader);

      docLogger.record({
        scenario: 'Cancel Workspace Invitation',
        method: 'PATCH',
        endpoint: `/api/invitations/workspaces/${workspace.id}/invitations/${inviteId}/cancel`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Marks invitation as CANCELLED by workspace admin.',
      });

      expect(res.status).toBe(200);
    });
  });
});
