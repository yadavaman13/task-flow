import bcrypt from 'bcrypt';
import { signJwt } from '../../core/utils/token.js';
import { createUser } from '../../queries/user.queries.js';

export function generateTestUserData(prefix = 'test_user') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return {
    name: 'Test User',
    email: `${prefix}_${timestamp}_${random}@example.com`,
    password: 'Password@123',
  };
}

export async function createAndLoginTestUser(overrides = {}) {
  const data = {
    ...generateTestUserData(),
    ...overrides,
  };

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await createUser({
    name: data.name,
    email: data.email,
    passwordHash: hashedPassword,
    isVerified: true,
  });

  const token = signJwt(user.id);

  return {
    user,
    token,
    cookie: `token=${token}`,
    authHeader: `Bearer ${token}`,
  };
}
