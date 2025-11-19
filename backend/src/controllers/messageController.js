const Message = require('../models/Message');

const messageController = {
  async createMessage(req, res) {
    try {
      const { title, content, location_id, policy_type, start_time, end_time, policy_rules } = req.body;
      const author_id = req.userId;

      const messageData = {
        title,
        content,
        location_id,
        author_id,
        policy_type,
        start_time,
        end_time
      };

      const messageId = await Message.create(messageData);
      
      // Add policy rules if provided
      if (policy_rules && policy_rules.length > 0) {
        await Message.addPolicyRules(messageId, policy_rules);
      }

      res.status(201).json({
        success: true,
        message: 'Mensagem publicada com sucesso',
        data: { messageId }
      });
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async getAvailableMessages(req, res) {
    try {
      const userId = req.userId;
      const { latitude, longitude, wifi_ssids = [] } = req.body;

      const userLocation = { latitude, longitude, wifi_ssids };
      const messages = await Message.getMessagesForUser(userId, userLocation);

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Erro ao obter mensagens disponíveis:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async receiveMessage(req, res) {
    try {
      const { messageId } = req.body;
      const userId = req.userId;

      await Message.markAsReceived(userId, messageId);

      res.json({
        success: true,
        message: 'Mensagem recebida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao receber mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async getUserMessages(req, res) {
    try {
      const userId = req.userId;
      const messages = await Message.getUserMessages(userId);

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Erro ao obter mensagens do utilizador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async getSentMessages(req, res) {
    try {
      const userId = req.userId;
      const messages = await Message.getUserSentMessages(userId);

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Erro ao obter mensagens enviadas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.userId;

      const deleted = await Message.deleteMessage(messageId, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Mensagem não encontrada ou não tem permissão para a remover'
        });
      }

      res.json({
        success: true,
        message: 'Mensagem removida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async getMessageDetails(req, res) {
    try {
      const { messageId } = req.params;
      
      // This would typically join with other tables to get complete message details
      // For now, we'll return a simplified version
      const policyRules = await Message.getMessagePolicyRules(messageId);

      res.json({
        success: true,
        data: {
          messageId,
          policyRules
        }
      });
    } catch (error) {
      console.error('Erro ao obter detalhes da mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = messageController;