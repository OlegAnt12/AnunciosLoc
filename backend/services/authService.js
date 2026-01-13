const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateSessionId } = require('../utils/auth');
const config = require('../config/environment');

class AuthService {
  async registerUser(username, password) {
    // Validações
    if (!username || !password) {
      throw new Error('Username e password são obrigatórios');
    }

    if (username.length < 3 || username.length > 50) {
      throw new Error('Username deve ter entre 3 e 50 caracteres');
    }

    if (password.length < 6) {
      throw new Error('Password deve ter pelo menos 6 caracteres');
    }

    return await db.transaction(async (connection) => {
      // Verificar se username já existe
      const [existingUsers] = await connection.execute(
        'SELECT id FROM utilizadores WHERE username = ?',
        [username]
      );

      if (existingUsers.length > 0) {
        throw new Error('Nome de utilizador já existe');
      }

      // Hash da password
      const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

      // Inserir utilizador
      const [result] = await connection.execute(
        'INSERT INTO utilizadores (username, password_hash) VALUES (?, ?)',
        [username, passwordHash]
      );

      // Criar perfil básico
      await connection.execute(
        'INSERT INTO perfis_utilizador (utilizador_id, chave, valor) VALUES (?, ?, ?)',
        [result.insertId, 'data_registo', new Date().toISOString()]
      );

      return {
        id: result.insertId,
        username: username
      };
    });
  }

  async loginUser(username, password) {
    if (!username || !password) {
      throw new Error('Username e password são obrigatórios');
    }

    // Buscar utilizador
    const [users] = await db.query(
      'SELECT id, username, password_hash, ativo FROM utilizadores WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      throw new Error('Credenciais inválidas');
    }

    const user = users[0];

    if (!user.ativo) {
      throw new Error('Conta desativada');
    }

    // Verificar password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar sessão
    const sessionId = generateSessionId();
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await db.query(
      'INSERT INTO sessoes (utilizador_id, session_id, data_expiracao) VALUES (?, ?, ?)',
      [user.id, sessionId, expiration]
    );

    // Log de acesso
    await db.query(
      'INSERT INTO logs_acesso (utilizador_id, acao, descricao) VALUES (?, ?, ?)',
      [user.id, 'LOGIN', 'Login realizado com sucesso']
    );

    return {
      user: {
        id: user.id,
        username: user.username
      },
      sessionId,
      expiresAt: expiration
    };
  }

  async logoutUser(sessionId) {
    await db.query(
      'UPDATE sessoes SET ativa = FALSE WHERE session_id = ?',
      [sessionId]
    );

    // Log de logout
    const [sessions] = await db.query(
      'SELECT utilizador_id FROM sessoes WHERE session_id = ?',
      [sessionId]
    );

    if (sessions.length > 0) {
      await db.query(
        'INSERT INTO logs_acesso (utilizador_id, acao, descricao) VALUES (?, ?, ?)',
        [sessions[0].utilizador_id, 'LOGOUT', 'Logout realizado']
      );
    }
  }

  async validateSession(sessionId) {
    const [sessions] = await db.query(
      `SELECT s.*, u.username, u.ativo 
       FROM sessoes s 
       JOIN utilizadores u ON s.utilizador_id = u.id 
       WHERE s.session_id = ? AND s.ativa = TRUE AND s.data_expiracao > NOW()`,
      [sessionId]
    );

    if (sessions.length === 0) {
      return null;
    }

    return {
      id: sessions[0].utilizador_id,
      username: sessions[0].username,
      sessionId: sessionId
    };
  }

  async cleanupExpiredSessions() {
    const result = await db.query(
      'UPDATE sessoes SET ativa = FALSE WHERE data_expiracao <= NOW() AND ativa = TRUE'
    );
    
    console.log(`🧹 Sessões expiradas limpas: ${result.affectedRows}`);
    return result.affectedRows;
  }
}

module.exports = new AuthService();