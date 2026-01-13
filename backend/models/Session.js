const db = require('../config/database');

class Session {
  // expiration is optional (Date or string)
  static async create(utilizadorId, sessionId, expiration = null) {
    const exp = expiration ? expiration : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const [result] = await db.execute(
      'INSERT INTO sessoes (utilizador_id, session_id, data_expiracao) VALUES (?, ?, ?)',
      [utilizadorId, sessionId, exp]
    );

    return result.insertId;
  }

  static async findByToken(sessionId) {
    const [rows] = await db.execute(
      'SELECT s.*, u.username FROM sessoes s JOIN utilizadores u ON s.utilizador_id = u.id WHERE s.session_id = ?',
      [sessionId]
    );

    return rows[0];
  }

  static async deleteByToken(sessionId) {
    await db.execute(
      'UPDATE sessoes SET ativa = FALSE WHERE session_id = ?',
      [sessionId]
    );
  }

  static async deleteByUserId(utilizadorId) {
    await db.execute(
      'UPDATE sessoes SET ativa = FALSE WHERE utilizador_id = ?',
      [utilizadorId]
    );
  }
}

module.exports = Session;