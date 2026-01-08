import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuração da URL base para Android
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api'; // Emulador Android
      // return 'http://192.168.x.x:3000/api'; // Para dispositivo físico - substitua x.x pelo seu IP
    } else {
      return 'http://localhost:3000/api'; // iOS
    }
  } else {
    return 'https://seu-dominio.com/api'; // Produção
  }
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Aumentei o timeout para Android
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Erro ao obter token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Erro API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('userToken');
      // Podemos usar um event emitter aqui para notificar o logout
    }
    
    return Promise.reject(error);
  }
);

export default api;