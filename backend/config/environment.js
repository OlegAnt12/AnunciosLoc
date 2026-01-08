require('dotenv').config();

const config = {
  // Servidor
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // Base de dados MySQL
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_NAME: process.env.DB_NAME || 'anunciosloc',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  
  // Segurança
  JWT_SECRET: process.env.JWT_SECRET || 'anunciosloc-secret-key-change-in-production',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Cache
  CACHE_TTL: parseInt(process.env.CACHE_TTL) || 300, // 5 minutos
  
  // Notificações
  NOTIFICATION_CHECK_INTERVAL: parseInt(process.env.NOTIFICATION_CHECK_INTERVAL) || 30000, // 30 segundos
};

// Validação de configuração obrigatória
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Aviso: ${envVar} não está definida`);
  }
});

module.exports = config;