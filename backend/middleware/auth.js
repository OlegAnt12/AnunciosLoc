const db = require('../config/database');
const crypto = require('crypto');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const result = await db.query(
      `SELECT s.*, u.username 
       FROM sessoes s 
       JOIN utilizadores u ON s.utilizador_id = u.id 
       WHERE s.session_id = $1 AND s.ativa = TRUE AND s.data_expiracao > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Sessão inválida ou expirada' });
    }

    req.user = {
      id: result.rows[0].utilizador_id,
      username: result.rows[0].username,
      sessionId: token
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { authenticateToken, generateSessionId };