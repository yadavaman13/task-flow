import mysql from 'mysql2/promise';
import { envConfig } from './env.config.js';

/**
 * Custom typeCast handler to automatically map MySQL TINYINT(1) / BOOLEAN columns
 * to native JavaScript booleans (true/false) instead of 1/0.
 */
export function typeCast(field, next) {
  if (field.type === 'TINY' && field.length === 1) {
    const val = field.string();
    return val === null ? null : val === '1';
  }
  return next();
}

export const pool = mysql.createPool({
  host: envConfig.db.host,
  port: envConfig.db.port,
  user: envConfig.db.user,
  password: envConfig.db.password,
  database: envConfig.db.database,
  waitForConnections: true,
  connectionLimit: envConfig.db.connectionLimit,
  namedPlaceholders: false,
  typeCast,
});

/** Run a query. Returns rows array. */
export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/** Run a query. Returns result metadata (insertId, affectedRows, changedRows). */
export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

export default pool;
