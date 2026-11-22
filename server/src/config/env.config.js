import 'dotenv/config';

function normalizeOrigin(origin = '') {
  return origin.trim().replace(/\/$/, '');
}

const clientOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const isProduction = (process.env.NODE_ENV || 'development').toLowerCase() === 'production';

// Strict validation of required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('MISSING ENVIRONMENT VARIABLE: JWT_SECRET');
}

if (!process.env.CLIENT_ORIGINS) {
  throw new Error('MISSING ENVIRONMENT VARIABLE: CLIENT_ORIGINS');
}

if (!clientOrigins.length) {
  throw new Error('MISSING VALID CLIENT_ORIGINS VALUES');
}

const databaseUrl =
  process.env.DATABASE_URL ||
  (process.env.DB_USER && process.env.DB_NAME
    ? `mysql://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD || '')}@${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`
    : undefined);

if (!databaseUrl && !process.env.DB_NAME) {
  throw new Error('MISSING ENVIRONMENT VARIABLE: DATABASE_URL');
}

if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.GOOGLE_REFRESH_TOKEN ||
  !process.env.GOOGLE_SENDER_EMAIL
) {
  throw new Error('MISSING ENVIRONMENT VARIABLES FOR GOOGLE API');
}

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT || !process.env.REDIS_PASSWORD) {
  throw new Error('MISSING ENVIRONMENT VARIABLES FOR REDIS');
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error('MISSING ENVIRONMENT VARIABLES FOR IMAGEKIT API');
}

export const envConfig = {
  // Server configuration keys
  SERVER_PORT: Number(process.env.SERVER_PORT || process.env.PORT || 3000),
  SERVER_URL: process.env.SERVER_URL || `http://localhost:${process.env.SERVER_PORT || process.env.PORT || 3000}`,
  CLIENT_ORIGINS: clientOrigins,
  CLIENT_ORIGIN: clientOrigins[0],
  IS_PRODUCTION: isProduction,
  AUTH_COOKIE_OPTIONS: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  },

  // JWT configuration keys
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '12h',

  // Redis configuration keys
  REDIS_HOST: (process.env.REDIS_HOST || '127.0.0.1').trim().replace(/:\d+$/, ''),
  REDIS_PORT: Number((process.env.REDIS_PORT || '6379').toString().trim()),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ? process.env.REDIS_PASSWORD.trim() : undefined,

  // Google Api keys
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.trim(),
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET?.trim(),
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN?.trim(),
  GOOGLE_SENDER_EMAIL: process.env.GOOGLE_SENDER_EMAIL?.trim(),

  // ImageKit
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY?.trim(),

  // Backward compatibility / convenience aliases
  port: Number(process.env.SERVER_PORT || process.env.PORT || 3000),
  nodeEnv: (process.env.NODE_ENV || 'development').toLowerCase(),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRY || '12h',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRY || '12h',
  },
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: Number(process.env.CONNECTION_LIMIT || 10),
  },
  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  },
  invitation: {
    expiresInHours: Number(process.env.INVITATION_EXPIRES_HOURS || 72),
  },

  isAllowedClientOrigin(origin) {
    if (!origin) return true;
    return clientOrigins.includes(normalizeOrigin(origin));
  },
};

export default envConfig;
