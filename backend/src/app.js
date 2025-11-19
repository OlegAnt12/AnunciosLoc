const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cron = require('node-cron');

const config = require('./config/environment');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter, authLimiter } = require('./middleware/rateLimit');

// Importar routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const locationRoutes = require('./routes/locations');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const deviceRoutes = require('./routes/devices');
const statsRoutes = require('./routes/stats');

// Importar serviços para cleanup
const authService = require('./services/authService');
const messageService = require('./services/messageService');
const deviceService = require('./services/deviceService');

const app = express();

// Middleware de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compressão
app.use(compression());

// Logging
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global
app.use(generalLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const db = require('./config/database');
  const dbStatus = await db.testConnection();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: dbStatus ? 'CONNECTED' : 'DISCONNECTED',
    version: '1.0.0-intermedia'
  });
});

// Info da API
app.get('/api', (req, res) => {
  res.json({
    name: 'AnunciosLoc API',
    version: '1.0.0-intermedia',
    description: 'Sistema de anúncios baseado em localização',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      locations: '/api/locations',
      messages: '/api/messages',
      notifications: '/api/notifications',
      devices: '/api/devices',
      stats: '/api/stats'
    }
  });
});

// 404 Handler
app.use('*', notFoundHandler);

// Error handler
app.use(errorHandler);

// Tarefas agendadas para cleanup
if (config.NODE_ENV !== 'test') {
  // Limpar sessões expiradas a cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('🕐 Executando cleanup de sessões expiradas...');
    await authService.cleanupExpiredSessions();
  });

  // Limpar mensagens expiradas a cada 6 horas
  cron.schedule('0 */6 * * *', async () => {
    console.log('🕐 Executando cleanup de mensagens expiradas...');
    await messageService.checkForExpiredMessages();
  });

  // Limpar dispositivos inativos diariamente
  cron.schedule('0 2 * * *', async () => {
    console.log('🕐 Executando cleanup de dispositivos inativos...');
    await deviceService.cleanupInactiveDevices();
  });
}

module.exports = app;