import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function resetDb() {
  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const conn = await pool.getConnection();
  try {
    const stmts = schema
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of stmts) {
      await conn.query(stmt);
    }
    console.log('Schema applied successfully.');
  } finally {
    conn.release();
    await pool.end();
  }
}

resetDb().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
