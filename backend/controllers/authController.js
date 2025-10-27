const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateSessionId } = require('../middleware/auth');

const authController = {
  register: async (req, res) => {
    const { username, password } = req.body;

    // Validação básica
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password deve ter pelo menos 6 caracteres' });
    }

    try {
      // Verificar se username já existe
      const userExists = await db.query(
        'SELECT id FROM utilizadores WHERE username = $1',
        [username]
      );

      if (userExists.rows.length > 0) {
        return res.status(409).json({ error: 'Nome de utilizador já existe' });
      }

      // Hash da password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Inserir novo utilizador
      const result = await db.query(
        'INSERT INTO utilizadores (username, password_hash) VALUES ($1, $2) RETURNING id, username',
        [username, passwordHash]
      );

      res.status(201).json({
        message: 'Utilizador registado com sucesso',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Erro no registo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  login: async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    try {
      // Buscar utilizador
      const userResult = await db.query(
        'SELECT id, username, password_hash, ativo FROM utilizadores WHERE username = $1',
        [username]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const user = userResult.rows[0];

      // Verificar password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar nova sessão
      const sessionId = generateSessionId();
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + 24);

      await db.query(
        'INSERT INTO sessoes (utilizador_id, session_id, data_expiracao) VALUES ($1, $2, $3)',
        [user.id, sessionId, expiration]
      );

      res.json({
        message: 'Login bem-sucedido',
        sessionId,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  logout: async (req, res) => {
    try {
      await db.query(
        'UPDATE sessoes SET ativa = FALSE WHERE session_id = $1',
        [req.user.sessionId]
      );

      res.json({ message: 'Logout bem-sucedido' });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = authController;