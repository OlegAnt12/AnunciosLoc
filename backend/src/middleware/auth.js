const authService = require('../services/authService');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de acesso requerido'
    });
  }

  try {
    const user = await authService.validateSession(token);
    
    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'Sessão inválida ou expirada'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

const generateSessionId = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const user = await authService.validateSession(token);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Ignorar erros de autenticação opcional
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  generateSessionId,
  optionalAuth
};