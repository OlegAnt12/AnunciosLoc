const { verifyToken } = require('../utils/auth');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação necessário' 
    });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Token inválido ou expirado' 
    });
  }
};

module.exports = { authenticateToken };