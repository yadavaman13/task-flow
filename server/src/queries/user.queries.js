import { query } from '../config/db.js';

export const findUserByEmail = async (email) => {
  const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const createUser = async (name, email, password) => {
  const rows = await query(
    'INSERT INTO users(name, email, password_hash) VALUE(?, ?, ?)'[(name, email, password)]
  );
};
