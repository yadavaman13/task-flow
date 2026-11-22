import request from 'supertest';
import app from '../../app.js';
import { FeatureApiDocLogger } from '../helpers/md-logger.js';
import { generateTestUserData, createAndLoginTestUser } from '../helpers/auth-helper.js';

const docLogger = new FeatureApiDocLogger(
  '01_auth.md',
  'Feature 01: Authentication & User Profile API',
  'Covers user registration, credential authentication, OTP verification flows, profile management, and logout.'
);

describe('01: Auth & User Profile Management API', () => {
  let authUser;
  let registeredUserData;

  beforeAll(async () => {
    authUser = await createAndLoginTestUser({ name: 'Auth Test User' });
  });

  afterAll(() => {
    docLogger.save();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully (201 Created)', async () => {
      registeredUserData = generateTestUserData('reg_test');

      const res = await request(app).post('/api/auth/register').send({
        name: registeredUserData.name,
        email: registeredUserData.email,
        password: registeredUserData.password,
      });

      docLogger.record({
        scenario: 'Register New User (Success)',
        method: 'POST',
        endpoint: '/api/auth/register',
        requestBody: {
          name: registeredUserData.name,
          email: registeredUserData.email,
          password: 'Password@123',
        },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Registers new user and returns safe user data.',
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe(registeredUserData.email);
    });

    it('should return 400 when registration is missing required fields', async () => {
      const invalidPayload = { name: '', email: 'invalid@example.com' };

      const res = await request(app).post('/api/auth/register').send(invalidPayload);

      docLogger.record({
        scenario: 'Register User (Validation Failure)',
        method: 'POST',
        endpoint: '/api/auth/register',
        requestBody: invalidPayload,
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 400 when name, email, or password is missing or empty.',
      });

      expect(res.status).toBe(400);
    });

    it('should return 400 when email already exists', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: registeredUserData.name,
        email: registeredUserData.email,
        password: registeredUserData.password,
      });

      docLogger.record({
        scenario: 'Register User (Duplicate Email Conflict)',
        method: 'POST',
        endpoint: '/api/auth/register',
        requestBody: {
          name: registeredUserData.name,
          email: registeredUserData.email,
          password: 'Password@123',
        },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 400 when attempting to register with an existing email.',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in successfully with valid credentials (200 OK)', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: registeredUserData.email,
        password: registeredUserData.password,
      });

      docLogger.record({
        scenario: 'Login User (Success)',
        method: 'POST',
        endpoint: '/api/auth/login',
        requestBody: {
          email: registeredUserData.email,
          password: 'Password@123',
        },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Authenticates user, sets HTTP-only session cookie, and returns JWT token.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(registeredUserData.email);
    });

    it('should return 401 when password is invalid', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: registeredUserData.email,
        password: 'WrongPassword!',
      });

      docLogger.record({
        scenario: 'Login User (Invalid Password)',
        method: 'POST',
        endpoint: '/api/auth/login',
        requestBody: {
          email: registeredUserData.email,
          password: 'WrongPassword!',
        },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 401 on incorrect password.',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/send-verification-otp & /verify-otp', () => {
    it('should send verification OTP to email', async () => {
      const testEmail = `otp_test_${Date.now()}@example.com`;
      const res = await request(app).post('/api/auth/send-verification-otp').send({
        email: testEmail,
      });

      docLogger.record({
        scenario: 'Send Verification OTP',
        method: 'POST',
        endpoint: '/api/auth/send-verification-otp',
        requestBody: { email: testEmail },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Issues a 6-digit verification OTP stored in Redis cache with 10-minute expiry.',
      });

      expect(res.status).toBe(200);
    });

    it('should return 400 when verifying with invalid OTP', async () => {
      const res = await request(app).post('/api/auth/verify-otp').send({
        email: registeredUserData.email,
        otp: '000000',
      });

      docLogger.record({
        scenario: 'Verify OTP (Invalid OTP Error)',
        method: 'POST',
        endpoint: '/api/auth/verify-otp',
        requestBody: {
          email: registeredUserData.email,
          otp: '000000',
        },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 400 when OTP code is incorrect or expired.',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current authenticated user profile (200 OK)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', authUser.authHeader);

      docLogger.record({
        scenario: 'Get Current Profile (Authenticated)',
        method: 'GET',
        endpoint: '/api/auth/me',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves authenticated user profile safe details.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(authUser.user.email);
    });

    it('should return 401 when accessed without authorization', async () => {
      const res = await request(app).get('/api/auth/me');

      docLogger.record({
        scenario: 'Get Current Profile (Unauthenticated)',
        method: 'GET',
        endpoint: '/api/auth/me',
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 401 when missing Authorization header and session cookie.',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/auth/me', () => {
    it('should update user profile details (200 OK)', async () => {
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', authUser.authHeader)
        .send({
          name: 'Updated Name',
          avatar_url: 'https://ik.imagekit.io/cuq3fe9wm/task-flow/new-avatar.png',
        });

      docLogger.record({
        scenario: 'Update Profile Details',
        method: 'PATCH',
        endpoint: '/api/auth/me',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: {
          name: 'Updated Name',
          avatar_url: 'https://ik.imagekit.io/cuq3fe9wm/task-flow/new-avatar.png',
        },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Updates user name and avatar url.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });
  });

  describe('PATCH /api/auth/me/password', () => {
    it('should update password with valid current password (200 OK)', async () => {
      const res = await request(app)
        .patch('/api/auth/me/password')
        .set('Authorization', authUser.authHeader)
        .send({
          currentPassword: 'Password@123',
          newPassword: 'NewPassword@456',
        });

      docLogger.record({
        scenario: 'Change Password (Success)',
        method: 'PATCH',
        endpoint: '/api/auth/me/password',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: {
          currentPassword: 'Password@123',
          newPassword: 'NewPassword@456',
        },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Verifies current password and updates with newly hashed password.',
      });

      expect(res.status).toBe(200);
    });

    it('should return 400 when current password does not match', async () => {
      const res = await request(app)
        .patch('/api/auth/me/password')
        .set('Authorization', authUser.authHeader)
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'AnotherPassword@789',
        });

      docLogger.record({
        scenario: 'Change Password (Current Password Mismatch)',
        method: 'PATCH',
        endpoint: '/api/auth/me/password',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        requestBody: {
          currentPassword: 'WrongPassword!',
          newPassword: 'AnotherPassword@789',
        },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns 400 when current password is wrong.',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should log out user and clear session cookie (200 OK)', async () => {
      const res = await request(app).post('/api/auth/logout');

      docLogger.record({
        scenario: 'Logout User',
        method: 'POST',
        endpoint: '/api/auth/logout',
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Clears HTTP-only session cookie and returns success.',
      });

      expect(res.status).toBe(200);
    });
  });
});
