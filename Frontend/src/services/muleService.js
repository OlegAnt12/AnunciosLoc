import api from './api';

export const muleService = {
  async getAssignments() {
    try {
      const response = await api.get('/mules/assignments');
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao carregar atribuições',
        details: error.response?.data,
      };
    }
  },

  async acceptAssignment(assignmentId) {
    try {
      const response = await api.post(`/mules/assignments/${assignmentId}/accept`);
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao aceitar atribuição',
        details: error.response?.data,
      };
    }
  }
};

export default muleService;