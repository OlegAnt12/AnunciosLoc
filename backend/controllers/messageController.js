const { Message } = require('../models/Message');

const messageController = {
  async createMessage(req, res) {
    try {
      const { receiver_id, content, location_id } = req.body;
      
      const message = await Message.create({
        sender_id: req.userId,
        receiver_id,
        content,
        location_id
      });

      res.status(201).json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar mensagem'
      });
    }
  },

  async getUserMessages(req, res) {
    try {
      const messages = await Message.findAll({
        where: {
          $or: [
            { sender_id: req.userId },
            { receiver_id: req.userId }
          ]
        },
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao obter mensagens'
      });
    }
  },

  async getMessage(req, res) {
    try {
      const message = await Message.findByPk(req.params.id);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Mensagem não encontrada'
        });
      }

      // Verificar se o utilizador tem acesso à mensagem
      if (message.sender_id !== req.userId && message.receiver_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Não tem permissão para ver esta mensagem'
        });
      }

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao obter mensagem'
      });
    }
  },

  async updateMessage(req, res) {
    try {
      const message = await Message.findByPk(req.params.id);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Mensagem não encontrada'
        });
      }

      // Apenas o remetente pode editar a mensagem
      if (message.sender_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Não tem permissão para editar esta mensagem'
        });
      }

      await message.update({ content: req.body.content });

      res.json({
        success: true,
        message: 'Mensagem atualizada com sucesso',
        data: message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar mensagem'
      });
    }
  },

  async deleteMessage(req, res) {
    try {
      const message = await Message.findByPk(req.params.id);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Mensagem não encontrada'
        });
      }

      // Apenas o remetente ou destinatário podem eliminar
      if (message.sender_id !== req.userId && message.receiver_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Não tem permissão para eliminar esta mensagem'
        });
      }

      await message.destroy();

      res.json({
        success: true,
        message: 'Mensagem eliminada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao eliminar mensagem'
      });
    }
  }
};

module.exports = messageController;