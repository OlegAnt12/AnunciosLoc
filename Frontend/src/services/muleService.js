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
  },

  async getConfig() {
    try {
      const response = await api.get('/mules/config');
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao obter configuração',
        details: error.response?.data,
      };
    }
  },

  async updateConfig({ capacity = 10, active = true } = {}) {
    try {
      const response = await api.post('/mules/config', { capacity, active });
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao atualizar configuração',
        details: error.response?.data,
      };
    }
  },

  async unregister() {
    try {
      const response = await api.delete('/mules/config');
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao remover configuração',
        details: error.response?.data,
      };
    }
  },

  async getStats() {
    try {
      const response = await api.get('/mules/stats');
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao obter estatísticas',
        details: error.response?.data,
      };
    }
  }
};

export default muleService;