const db = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/auth');

class User {
  static async create(username, password) {
    const hashedPassword = await hashPassword(password);

    const [result] = await db.execute(
      'INSERT INTO utilizadores (username, password_hash) VALUES (?, ?)',
      [username, hashedPassword]
    );

    return result.insertId;
  }

  static async findByUsername(username) {
    const [rows] = await db.execute(
      'SELECT * FROM utilizadores WHERE username = ?',
      [username]
    );

    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, username, data_criacao as created_at, ativo FROM utilizadores WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async verifyCredentials(username, password) {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isValid = await comparePassword(password, user.password_hash);
    return isValid ? user : null;
  }

  static async usernameExists(username) {
    const user = await this.findByUsername(username);
    return !!user;
  }
}

module.exports = User;