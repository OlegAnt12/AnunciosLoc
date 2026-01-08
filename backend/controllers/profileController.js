const { User } = require('../models/User');

const profileController = {
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password'] }
      });
      
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
      res.status(500).json({
        success: false,
        message: 'Erro ao obter perfil'
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizador não encontrado'
        });
      }

      const { name, email, phone } = req.body;
      await user.update({ name, email, phone });

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil'
      });
    }
  },

  async deleteProfile(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizador não encontrado'
        });
      }

      await user.destroy();

      res.json({
        success: true,
        message: 'Perfil eliminado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao eliminar perfil'
      });
    }
  }
};

module.exports = profileController;