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
  }
};

module.exports = muleController;