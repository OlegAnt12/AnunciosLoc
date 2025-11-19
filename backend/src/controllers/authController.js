const User = require('../models/User');
const Session = require('../models/Session');
const { generateToken } = require('../utils/auth');

const authController = {
  async register(req, res) {
    try {
      const { username, password } = req.body;

      // Check if username already exists
      if (await User.usernameExists(username)) {
        return res.status(400).json({
          success: false,
          message: 'Nome de utilizador já existe'
        });
      }

      // Create user
      const userId = await User.create(username, password);
      
      // Generate token
      const token = generateToken(userId);
      await Session.create(userId, token);

      res.status(201).json({
        success: true,
        message: 'Utilizador registado com sucesso',
        data: {
          userId,
          username,
          token
        }
      });
    } catch (error) {
      console.error('Erro no registo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Verify credentials
      const user = await User.verifyCredentials(username, password);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Delete existing sessions
      await Session.deleteByUserId(user.id);

      // Generate new token
      const token = generateToken(user.id);
      await Session.create(user.id, token);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          userId: user.id,
          username: user.username,
          token
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async logout(req, res) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      await Session.deleteByToken(token);

      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizador não encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = authController;