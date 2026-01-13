const messageService = require('../services/messageService');
const db = require('../config/database');

const messageController = {
  async createMessage(req, res) {
    try {
      const messageId = await messageService.createMessage(req.body, req.userId);
      res.status(201).json({ success: true, message: 'Mensagem criada com sucesso', data: { id: messageId } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Erro ao criar mensagem' });
    }
  },

  async getUserMessages(req, res) {
    try {
      const userId = parseInt(req.params.userId || req.userId, 10);
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const result = await messageService.getReceivedMessages(userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao obter mensagens do utilizador' });
    }
  },

  async getMessage(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await messageService.getMessageById(id);
      if (!data) return res.status(404).json({ success: false, message: 'Mensagem não encontrada' });
      res.json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Erro ao obter mensagem' });
    }
  },

  async updateMessage(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      await messageService.updateMessage(id, req.userId, req.body);
      res.json({ success: true, message: 'Mensagem atualizada' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Erro ao atualizar mensagem' });
    }
  },

  async deleteMessage(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      await messageService.deleteMessage(id, req.userId);
      res.json({ success: true, message: 'Mensagem removida' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Erro ao remover mensagem' });
    }
  },

  async receiveMessage(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await messageService.receiveMessage(id, req.userId, req.body.deviceId || null);
      res.json({ success: true, message: 'Mensagem recebida', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Erro ao receber mensagem' });
    }
  },

  async getMyMessages(req, res) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const result = await messageService.getMyMessages(req.userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao obter mensagens do utilizador' });
    }
  },

  async nearby(req, res) {
    try {
      const { latitude = null, longitude = null, wifi_ssids = null } = req.body || {};

      const [rows] = await db.query('SELECT verificar_localizacao_utilizador(?, ?, ?, ?) as local_id', [req.userId, latitude, longitude, (wifi_ssids || []).join('|')]);
      const localId = rows[0].local_id;

      if (!localId) return res.json({ success: true, data: [] });

      const messages = await messageService.getMessagesForLocation(localId, req.userId);
      res.json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao obter mensagens próximas' });
    }
  }
};

module.exports = messageController;