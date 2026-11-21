import mysql from 'mysql2/promise';
import { envConfig } from './env.config';

export const pool = mysql.createPool({
  host: envConfig.db.host,
  port: envConfig.db.port,
  user: envConfig.db.user,
  password: envConfig.db.password,
  database: envConfig.db.database,
  waitForConnections: true,
  connectionLimit: envConfig.db.connectionLimit,
  namedPlaceholders: false,
});

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}