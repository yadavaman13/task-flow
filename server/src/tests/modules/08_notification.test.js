import request from 'supertest';
import app from '../../app.js';
import { FeatureApiDocLogger } from '../helpers/md-logger.js';
import { createAndLoginTestUser } from '../helpers/auth-helper.js';

const docLogger = new FeatureApiDocLogger(
  '08_notification.md',
  'Feature 08: Notification API',
  'Covers listing user notifications, reading unread count, marking single notification as read, and batch marking all as read.'
);

describe('08: Notification Module API', () => {
  let user;
  let testNotificationId;

  beforeAll(async () => {
    user = await createAndLoginTestUser({ name: 'Notification User' });

    // Seed a notification directly for this user
    const { insert: insertNotification } = await import('../../queries/notification.queries.js');
    const res = await insertNotification({
      userId: user.user.id,
      type: 'TASK_ASSIGNED',
      title: 'Task Assigned',
      message: 'You have been assigned to task: Sprint Testing',
      referenceType: 'TASK',
      referenceId: 1,
    });
    testNotificationId = res.insertId;
  });

  afterAll(() => {
    docLogger.save();
  });

  describe('GET /api/notifications', () => {
    it('should list user notifications (200 OK)', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', user.authHeader);

      docLogger.record({
        scenario: 'List Notifications',
        method: 'GET',
        endpoint: '/api/notifications',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Retrieves paginated notifications for current user.',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should get unread notifications count (200 OK)', async () => {
      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', user.authHeader);

      docLogger.record({
        scenario: 'Get Unread Count',
        method: 'GET',
        endpoint: '/api/notifications/unread-count',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Returns count of unread notifications.',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.unreadCount).toBeDefined();
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark single notification as read (200 OK)', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${testNotificationId}/read`)
        .set('Authorization', user.authHeader);

      docLogger.record({
        scenario: 'Mark Notification Read',
        method: 'PATCH',
        endpoint: `/api/notifications/${testNotificationId}/read`,
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Marks a notification as read for user.',
      });

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('should mark all notifications as read (200 OK)', async () => {
      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', user.authHeader);

      docLogger.record({
        scenario: 'Mark All Notifications Read',
        method: 'PATCH',
        endpoint: '/api/notifications/read-all',
        headers: { Authorization: 'Bearer JWT_TOKEN_VALUE' },
        statusCode: res.status,
        responseBody: res.body,
        notes: 'Batch marks all pending notifications as read.',
      });

      expect(res.status).toBe(200);
    });
  });
});
