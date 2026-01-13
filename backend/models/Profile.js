const db = require('../config/database');

class Profile {
  static async addKeyValue(userId, key, value) {
    // Remove existing key for this user
    await this.removeKey(userId, key);

    const [result] = await db.execute(
      'INSERT INTO perfis_utilizador (utilizador_id, chave, valor) VALUES (?, ?, ?)',
      [userId, key, value]
    );

    return result.insertId;
  }

  static async removeKey(userId, key) {
    const [result] = await db.execute(
      'DELETE FROM perfis_utilizador WHERE utilizador_id = ? AND chave = ?',
      [userId, key]
    );

    return result.affectedRows > 0;
  }

  static async getUserProfile(userId) {
    const [rows] = await db.execute(
      'SELECT chave AS `key`, valor AS `value` FROM perfis_utilizador WHERE utilizador_id = ?',
      [userId]
    );

    // Return as key/value object for convenience
    const profile = {};
    rows.forEach(r => (profile[r.key] = r.value));
    return profile;
  }

  static async getAllKeys() {
    const [rows] = await db.execute(
      'SELECT DISTINCT chave as `key` FROM perfis_utilizador ORDER BY chave'
    );

    return rows.map(row => row.key);
  }

  static async getUsersByKeyValue(key, value) {
    const [rows] = await db.execute(
      'SELECT utilizador_id FROM perfis_utilizador WHERE chave = ? AND valor = ?',
      [key, value]
    );

    return rows.map(row => row.utilizador_id);
  }
}

module.exports = Profile;