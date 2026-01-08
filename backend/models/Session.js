const db = require('../config/database');

class Session {
  static async create(userId, token) {
    const [result] = await db.execute(
      'INSERT INTO sessions (user_id, token) VALUES (?, ?)',
      [userId, token]
    );
    
    return result.insertId;
  }

  static async findByToken(token) {
    const [rows] = await db.execute(
      'SELECT s.*, u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?',
      [token]
    );
    
    return rows[0];
  }

  static async deleteByToken(token) {
    await db.execute(
      'DELETE FROM sessions WHERE token = ?',
      [token]
    );
  }

  static async deleteByUserId(userId) {
    await db.execute(
      'DELETE FROM sessions WHERE user_id = ?',
      [userId]
    );
  }
}

module.exports = Session;