const db = require('../config/database');

class Profile {
  static async addKeyValue(userId, key, value) {
    // Remove existing key for this user
    await this.removeKey(userId, key);
    
    const [result] = await db.execute(
      'INSERT INTO user_profiles (user_id, key, value) VALUES (?, ?, ?)',
      [userId, key, value]
    );
    
    return result.insertId;
  }

  static async removeKey(userId, key) {
    const [result] = await db.execute(
      'DELETE FROM user_profiles WHERE user_id = ? AND key = ?',
      [userId, key]
    );
    
    return result.affectedRows > 0;
  }

  static async getUserProfile(userId) {
    const [rows] = await db.execute(
      'SELECT key, value FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    
    return rows;
  }

  static async getAllKeys() {
    const [rows] = await db.execute(
      'SELECT DISTINCT key FROM user_profiles ORDER BY key'
    );
    
    return rows.map(row => row.key);
  }

  static async getUsersByKeyValue(key, value) {
    const [rows] = await db.execute(
      'SELECT user_id FROM user_profiles WHERE key = ? AND value = ?',
      [key, value]
    );
    
    return rows.map(row => row.user_id);
  }
}

module.exports = Profile;