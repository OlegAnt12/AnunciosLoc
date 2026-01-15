const muleService = require('../services/muleService');

const muleController = {
  async listAssignments(req, res) {
    try {
      const userId = req.userId;
      const rows = await muleService.getAssignmentsForMule(userId);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error listing mule assignments:', error);
      res.status(500).json({ success: false, message: 'Erro ao obter atribuições de mula' });
    }
  },

  async acceptAssignment(req, res) {
    try {
      const userId = req.userId;
      const assignmentId = parseInt(req.params.id, 10);
      const result = await muleService.acceptAssignment(assignmentId, userId);
      res.json({ success: true, message: 'Atribuição aceite', data: result });
    } catch (error) {
      console.error('Error accepting assignment:', error);
      res.status(400).json({ success: false, message: error.message || 'Erro ao aceitar atribuição' });
    }
  },

  async getConfig(req, res) {
    try {
      const userId = req.userId;
      const cfg = await muleService.getConfigForUser(userId);
      res.json({ success: true, data: cfg });
    } catch (error) {
      console.error('Error getting mule config:', error);
      res.status(500).json({ success: false, message: 'Erro ao obter configuração de mula' });
    }
  },

  async upsertConfig(req, res) {
    try {
      const userId = req.userId;
      const { capacity = 10, active = true } = req.body;
      const cfg = await muleService.upsertConfig(userId, parseInt(capacity, 10), !!active);
      res.json({ success: true, message: 'Configuração atualizada', data: cfg });
    } catch (error) {
      console.error('Error upserting mule config:', error);
      res.status(400).json({ success: false, message: error.message || 'Erro ao atualizar configuração' });
    }
  },

  async removeConfig(req, res) {
    try {
      const userId = req.userId;
      const ok = await muleService.removeConfig(userId);
      if (ok) res.json({ success: true, message: 'Configuração removida' });
      else res.status(404).json({ success: false, message: 'Configuração não encontrada' });
    } catch (error) {
      console.error('Error removing mule config:', error);
      res.status(500).json({ success: false, message: 'Erro ao remover configuração' });
    }
  },

  async getStats(req, res) {
    try {
      const userId = req.userId;
      const stats = await muleService.getMuleStats(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error getting mule stats:', error);
      res.status(500).json({ success: false, message: 'Erro ao obter estatísticas' });
    }
  }
};

module.exports = muleController;