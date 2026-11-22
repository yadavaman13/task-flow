import { query, execute } from '../config/db.js';

/** Find user by email — returns full row INCLUDING password_hash (for auth only). */
export const findByEmail = async (email) => {
  const targetEmail =
    typeof email === 'object' && email?.normalizedEmail ? email.normalizedEmail : email;
  const rows = await query('SELECT * FROM users WHERE email = ?', [targetEmail]);
  return rows[0];
};

/** Backward compatibility alias */
export const findUserByEmail = findByEmail;
export const getUserByEmail = findByEmail;

/** Find user by ID — safe fields only (no password_hash). */
export const findById = async (id) => {
  const rows = await query(
    `SELECT id, name, email, avatar_url, is_active, is_verified,
            email_verified_at, created_at, updated_at
       FROM users WHERE id = ?`,
    [id]
  );
  return rows[0];
};

/** Find user by ID — includes password_hash (for password change verification). */
export const findByIdWithPassword = async (id) => {
  const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

export const insert = async (data) => {
  const name = data.name || data.normalizedName;
  const email = data.email || data.normalizedEmail;
  const passwordHash = data.passwordHash || data.hashedPassword;
  const isVerified = Boolean(data.isVerified || data.is_verified);

  return execute(
    'INSERT INTO users (name, email, password_hash, is_verified, email_verified_at) VALUES (?, ?, ?, ?, IF(? = TRUE, NOW(), NULL))',
    [name, email, passwordHash, isVerified, isVerified]
  );
};

/** Backward compatibility alias */
export const createUser = async (arg1, arg2, arg3) => {
  if (typeof arg1 === 'object' && arg1 !== null) {
    const res = await insert(arg1);
    const created = await findById(res.insertId);
    return created;
  }
  const res = await insert({ name: arg1, email: arg2, passwordHash: arg3 });
  return findById(res.insertId);
};

export const markEmailVerified = async (id) =>
  execute(
    'UPDATE users SET is_verified = TRUE, email_verified_at = NOW(), is_active = TRUE WHERE id = ?',
    [id]
  );

export const updateUser = async (id, fields) => {
  const updates = [];
  const params = [];

  if (fields.emailVerified !== undefined || fields.isVerified !== undefined) {
    const val = Boolean(fields.emailVerified ?? fields.isVerified);
    updates.push('is_verified = ?');
    params.push(val);
    if (val) {
      updates.push('email_verified_at = NOW()');
    }
  }

  if (fields.isActive !== undefined || fields.is_active !== undefined) {
    const val = Boolean(fields.isActive ?? fields.is_active);
    updates.push('is_active = ?');
    params.push(val);
  }

  if (fields.name) {
    updates.push('name = ?');
    params.push(fields.name);
  }

  if (fields.avatarUrl || fields.avatar_url) {
    updates.push('avatar_url = ?');
    params.push(fields.avatarUrl || fields.avatar_url);
  }

  if (updates.length === 0) return null;
  params.push(id);
  return execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
};

export const updateProfile = async (id, { name, avatarUrl }) =>
  execute(
    'UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
    [name || null, avatarUrl || null, id]
  );

export const updatePassword = async (id, passwordHash) =>
  execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
