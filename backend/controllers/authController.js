const authService = require('../services/authService');
const { generateToken } = require('../utils/auth');

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authService.registerUser(username, password);
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Utilizador registado com sucesso',
      data: {
        id: user.id,
        username: user.username,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro durante o registo'
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.loginUser(username, password);
    const token = generateToken(result.user.id);

    res.json({
      success: true,
      message: 'Login efetuado com sucesso',
      data: {
        user: result.user,
        sessionId: result.sessionId,
        expiresAt: result.expiresAt,
        token
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Credenciais inválidas'
    });
  }
};

const logout = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;
    await authService.logoutUser(sessionId);
    res.json({ success: true, message: 'Logout efetuado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro durante o logout' });
  }
};

const refreshToken = async (req, res) => {
  try {
    // For simplicity, refresh using old token's userId if present
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) throw new Error('Token necessário');

    const decoded = require('../utils/auth').verifyToken(token);
    const newToken = generateToken(decoded.userId);
    res.json({ success: true, message: 'Token atualizado', data: { token: newToken } });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message || 'Erro ao atualizar token' });
  }
};

const verifyToken = async (req, res) => {
  try {
    // If we reach here, token is valid due to protect middleware
    const user = await authService.getUserById(req.user.id);
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao verificar token' });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyToken
};