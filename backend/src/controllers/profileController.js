const Profile = require('../models/Profile');

const profileController = {
  async addKeyValue(req, res) {
    try {
      const { key, value } = req.body;
      const userId = req.userId;

      await Profile.addKeyValue(userId, key, value);

      res.json({
        success: true,
        message: 'Chave-valor adicionada ao perfil com sucesso'
      });
    } catch (error) {
      console.error('Erro ao adicionar chave-valor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async removeKey(req, res) {
    try {
      const { key } = req.body;
      const userId = req.userId;

      const removed = await Profile.removeKey(userId, key);

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Chave não encontrada no perfil'
        });
      }

      res.json({
        success: true,
        message: 'Chave removida do perfil com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover chave:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async getUserProfile(req, res) {
    try {
      const userId = req.userId;
      const profile = await Profile.getUserProfile(userId);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async getAllKeys(req, res) {
    try {
      const keys = await Profile.getAllKeys();

      res.json({
        success: true,
        data: keys
      });
    } catch (error) {
      console.error('Erro ao obter chaves:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = profileController;