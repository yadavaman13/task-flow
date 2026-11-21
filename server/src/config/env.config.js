import 'dotenv/config';

export const envConfig = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.trim(),
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET?.trim(),
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN?.trim(),
  GOOGLE_SENDER_EMAIL: process.env.GOOGLE_SENDER_EMAIL?.trim(),

  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY?.trim(),

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: Number(process.env.CONNECTION_LIMIT || 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-in-prod',
    expiresIn: process.env.JWT_EXPIRY || '12h',
  },
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key-change-in-prod',
  jwtExpiresIn: process.env.JWT_EXPIRY || '12h',

  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  },

  invitation: {
    expiresInHours: Number(process.env.INVITATION_EXPIRES_HOURS || 72),
  },
};

export default envConfig;
