const db = require('../config/database');
const Profile = require('../models/Profile');

const profileController = {
  async getProfile(req, res) {
    try {
      const userId = req.userId;

      const [users] = await db.query('SELECT id, username, data_criacao as created_at, ativo FROM utilizadores WHERE id = ?', [userId]);
      const user = users[0];

      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
      }

      const profile = await Profile.getUserProfile(userId);

      res.json({ success: true, data: { ...user, profile } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao obter perfil' });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.userId;
      const profileData = req.body; // expect direct key-value pairs

      // Ensure user exists
      const [users] = await db.query('SELECT id FROM utilizadores WHERE id = ?', [userId]);
      if (users.length === 0) return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });

      // Update provided profile keys
      for (const [k, v] of Object.entries(profileData)) {
        await Profile.addKeyValue(userId, k, String(v));
      }

      const updatedProfile = await Profile.getUserProfile(userId);

      res.json({ success: true, message: 'Perfil atualizado com sucesso', data: updatedProfile });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar perfil' });
    }
  },

  async deleteProfile(req, res) {
    try {
      const userId = req.userId;

      // Soft-delete: mark user as inactive
      await db.query('UPDATE utilizadores SET ativo = FALSE WHERE id = ?', [userId]);

      res.json({ success: true, message: 'Perfil desativado com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao eliminar perfil' });
    }
  }
};

module.exports = profileController;