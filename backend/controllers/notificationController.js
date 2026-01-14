const notificationService = require('../services/notificationService');

const notificationController = {
  async getNotifications(req, res) {
    try {
      const notifications = await notificationService.getUserNotifications(req.userId);
      res.json({ success: true, data: notifications });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao obter notificações' });
    }
  },

  async markAsRead(req, res) {
    try {
      const id = req.params.id ? parseInt(req.params.id, 10) : null;
      await notificationService.markNotificationsAsRead(req.userId, id);
      res.json({ success: true, message: 'Notificações marcadas como lidas' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar notificação' });
    }
  },

  async createNotification(req, res) {
    try {
      const { user_id, mensagem_id = null, acao = 'NOTIFICACAO', detalhes = '' } = req.body;

      const targetUser = user_id || req.userId;

      const [result] = await require('../config/database').execute(
        'INSERT INTO logs_mensagens (mensagem_id, acao, utilizador_id, detalhes) VALUES (?, ?, ?, ?)',
        [mensagem_id, acao, targetUser, detalhes]
      );

      res.status(201).json({ success: true, message: 'Notificação criada', data: { id: result.insertId } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao criar notificação' });
    }
  },

  async deleteNotification(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const ok = await notificationService.deleteNotification(req.userId, id);
      if (!ok) return res.status(404).json({ success: false, message: 'Notificação não encontrada' });
      res.json({ success: true, message: 'Notificação removida' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao remover notificação' });
    }
  },

  async getCount(req, res) {
    try {
      const count = await notificationService.getUnreadNotificationCount(req.userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao obter contador de notificações' });
    }
  }
};

module.exports = notificationController;