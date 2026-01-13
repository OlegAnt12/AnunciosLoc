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
      const { user_id, mensagem_id, acao = 'NOTIFICACAO', detalhes = '' } = req.body;

      if (!user_id || !mensagem_id) return res.status(400).json({ success: false, message: 'user_id e mensagem_id são obrigatórios' });

      await require('../config/database').execute(
        'INSERT INTO logs_mensagens (mensagem_id, acao, utilizador_id, detalhes) VALUES (?, ?, ?, ?)',
        [mensagem_id, acao, user_id, detalhes]
      );

      res.status(201).json({ success: true, message: 'Notificação criada' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao criar notificação' });
    }
  },

  async deleteNotification(req, res) {
    res.status(501).json({ success: false, message: 'Notificação - remoção não implementada' });
  }
};

module.exports = notificationController;