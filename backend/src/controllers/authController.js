const authService = require('../services/authService');
const { validate } = require('../middleware/validation');
const { schemas } = require('../utils/validators');

const authController = {
  register: [
    validate(schemas.register),
    async (req, res) => {
      try {
        const { username, password } = req.body;
        
        const result = await authService.registerUser(username, password);
        
        res.status(201).json({
          success: true,
          message: 'Utilizador registado com sucesso',
          data: {
            user: result
          }
        });
      } catch (error) {
        console.error('Erro no registo:', error);
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  ],

  login: [
    validate(schemas.login),
    async (req, res) => {
      try {
        const { username, password } = req.body;
        
        const result = await authService.loginUser(username, password);
        
        res.json({
          success: true,
          message: 'Login bem-sucedido',
          data: result
        });
      } catch (error) {
        console.error('Erro no login:', error);
        res.status(401).json({
          success: false,
          error: error.message
        });
      }
    }
  ],

  logout: async (req, res) => {
    try {
      await authService.logoutUser(req.user.sessionId);
      
      res.json({
        success: true,
        message: 'Logout bem-sucedido'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  me: async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Erro a obter perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = authController;