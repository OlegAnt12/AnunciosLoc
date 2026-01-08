const { Notification } = require('../models/Notification');

const notificationController = {
  async getNotifications(req, res) {
    try {
      const notifications = await Notification.findAll({
        where: { user_id: req.userId },
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao obter notificações'
      });
    }
  },

  async markAsRead(req, res) {
    try {
      const notification = await Notification.findByPk(req.params.id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificação não encontrada'
        });
      }

      // Verificar se a notificação pertence ao utilizador
      if (notification.user_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Não tem permissão para esta notificação'
        });
      }

      await notification.update({ read: true });

      res.json({
        success: true,
        message: 'Notificação marcada como lida'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar notificação'
      });
    }
  },

  async createNotification(req, res) {
    try {
      const { user_id, title, message, type, related_entity, related_entity_id } = req.body;

      const notification = await Notification.create({
        user_id,
        title,
        message,
        type,
        related_entity,
        related_entity_id
      });

      res.status(201).json({
        success: true,
        message: 'Notificação criada com sucesso',
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar notificação'
      });
    }
  },

  async deleteNotification(req, res) {
    try {
      const notification = await Notification.findByPk(req.params.id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificação não encontrada'
        });
      }

      if (notification.user_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Não tem permissão para eliminar esta notificação'
        });
      }

      await notification.destroy();

      res.json({
        success: true,
        message: 'Notificação eliminada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao eliminar notificação'
      });
    }
  }
};

module.exports = notificationController;