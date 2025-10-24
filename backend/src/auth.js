import pool from "./db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS || 72);

export async function registerUser(username, password) {
  const pwHash = await bcrypt.hash(password, 10);
  const q = `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id, username, created_at`;
  const res = await pool.query(q, [username, pwHash]);
  return res.rows[0];
}

export async function loginUser(username, password, device_id = null) {
  const q = `SELECT user_id, password_hash FROM users WHERE username = $1`;
  const res = await pool.query(q, [username]);
  if (!res.rowCount) return null;
  const { user_id, password_hash } = res.rows[0];
  const ok = await bcrypt.compare(password, password_hash);
  if (!ok) return null;

  // gerar session_id
  const session_id = uuidv4();
  const created_at = new Date();
  const expires_at = new Date(created_at.getTime() + SESSION_TTL_HOURS * 3600 * 1000);

  const q2 = `INSERT INTO sessions (session_id, user_id, device_id, created_at, expires_at)
              VALUES ($1,$2,$3,$4,$5)`;
  await pool.query(q2, [session_id, user_id, device_id, created_at, expires_at]);

  return { session_id, user_id, expires_at };
}

export async function validateSession(session_id) {
  if (!session_id) return null;
  const q = `SELECT s.session_id, s.user_id, s.expires_at, u.username
             FROM sessions s JOIN users u ON s.user_id = u.user_id
             WHERE s.session_id = $1`;
  const res = await pool.query(q, [session_id]);
  if (!res.rowCount) return null;
  const row = res.rows[0];
  if (new Date(row.expires_at) < new Date()) {
    // session expired: optional remove
    await pool.query(`DELETE FROM sessions WHERE session_id = $1`, [session_id]);
    return null;
  }
  return { session_id: row.session_id, user_id: row.user_id, username: row.username };
}

export async function logoutSession(session_id) {
  const q = `DELETE FROM sessions WHERE session_id = $1`;
  await pool.query(q, [session_id]);
  return true;
}
