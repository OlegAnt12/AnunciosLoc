import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuração robusta da URL base
const getBaseURL = () => {
  if (__DEV__) {
    console.log('🔄 Modo desenvolvimento - Configurando URL base...');
    
    if (Platform.OS === 'android') {
      const androidURLs = [
        'http://10.0.2.2:3000/api',
        'http://localhost:3000/api',
        'http://192.168.1.100:3000/api'
      ];
      return androidURLs[0];
    } else {
      const iosURLs = [
        'http://localhost:3000/api',
        'http://127.0.0.1:3000/api'
      ];
      return iosURLs[0];
    }
  } else {
    return 'https://seu-dominio.com/api';
  }
};

const API_BASE_URL = getBaseURL();
console.log('🎯 URL Base da API:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Token adicionado ao header');
      }
    } catch (error) {
      console.log('❌ Erro ao obter token:', error);
    }
    return config;
  },
  (error) => {
    console.log('❌ Erro no interceptor de token:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log('❌ Erro na resposta:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    
    if (error.response?.status === 401) {
      console.log('🔐 Token expirado ou inválido');
      AsyncStorage.removeItem('userToken');
      AsyncStorage.removeItem('userData');
    }
    
    // Melhorar a mensagem de erro
    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Timeout - O servidor demorou muito para responder';
    } else if (error.message === 'Network Error') {
      error.userMessage = 'Erro de rede - Verifique sua conexão e se o servidor está rodando';
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Erro interno do servidor';
    } else if (error.response?.status === 404) {
      error.userMessage = 'Endpoint não encontrado';
    } else {
      error.userMessage = error.response?.data?.message || error.message || 'Erro de conexão';
    }
    
    return Promise.reject(error);
  }
);

// Serviços de Autenticação
export const authService = {
  async register(userData) {
    try {
      console.log('📝 Tentando registrar usuário:', { ...userData, password: '***' });
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success && response.data.data?.token) {
        console.log('✅ Registro bem-sucedido, guardando token...');
        await AsyncStorage.setItem('userToken', response.data.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error) {
      console.log('❌ Erro no registro:', error);
      throw {
        message: error.userMessage || 'Erro ao criar conta',
        details: error.response?.data,
      };
    }
  },

  async login(credentials) {
    try {
      console.log('🔐 Tentando login:', { ...credentials, password: '***' });
      
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data?.token) {
        console.log('✅ Login bem-sucedido, guardando token...');
        await AsyncStorage.setItem('userToken', response.data.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error) {
      console.log('❌ Erro no login:', error);
      throw {
        message: error.userMessage || 'Erro ao fazer login',
        details: error.response?.data,
      };
    }
  },

  async logout() {
    try {
      console.log('🚪 Fazendo logout...');
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      return { success: true, message: 'Logout realizado com sucesso' };
    } catch (error) {
      console.log('❌ Erro no logout:', error);
      throw { message: 'Erro ao fazer logout' };
    }
  },
};

// Serviços de Mensagens
export const messageService = {
  async create(messageData) {
    try {
      const response = await api.post('/messages', messageData);
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao criar mensagem',
        details: error.response?.data,
      };
    }
  },

  async getUserMessages(userId) {
    try {
      const response = await api.get(`/users/${userId}/messages`);
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao carregar mensagens',
        details: error.response?.data,
      };
    }
  },

  async getSentMessages(userId) {
    try {
      const response = await api.get(`/users/${userId}/sent-messages`);
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao carregar mensagens enviadas',
        details: error.response?.data,
      };
    }
  },

  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao eliminar mensagem',
        details: error.response?.data,
      };
    }
  },

  async getMessagesForUser(userLocation) {
    try {
      const response = await api.post('/messages/nearby', userLocation);
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao carregar mensagens próximas',
        details: error.response?.data,
      };
    }
  },
};

// Serviços de Localizações
export const locationService = {
  async create(locationData) {
    try {
      const response = await api.post('/locations', locationData);
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao criar localização',
        details: error.response?.data,
      };
    }
  },

  async getUserLocations(userId) {
    try {
      const response = await api.get(`/users/${userId}/locations`);
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao carregar localizações',
        details: error.response?.data,
      };
    }
  },

  async deleteLocation(locationId) {
    try {
      const response = await api.delete(`/locations/${locationId}`);
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao eliminar localização',
        details: error.response?.data,
      };
    }
  },
};

// Serviços de Perfil
export const profileService = {
  async addKeyValue(key, value) {
    try {
      const response = await api.post('/profiles/key', { key, value });
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao adicionar chave',
        details: error.response?.data,
      };
    }
  },

  async removeKey(key) {
    try {
      const response = await api.delete('/profiles/key', { data: { key } });
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao remover chave',
        details: error.response?.data,
      };
    }
  },

  async getUserProfile(userId) {
    try {
      // Backend exposes user profile at GET /api/users/:id (contains profile field)
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw {
        message: error.userMessage || 'Erro ao carregar perfil',
        details: error.response?.data,
      };
    }
  },
};

// Teste de conexão
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return { 
      success: true, 
      data: response.data,
      message: 'Conectado ao backend com sucesso'
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.userMessage || error.message,
      details: `URL: ${API_BASE_URL}/health`
    };
  }
};

export default api;