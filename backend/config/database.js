const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'anunciosloc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;const { Sequelize } = require('sequelize');
const config = require('./environment');

// Configuração da conexão MySQL
const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD, {
  host: config.DB_HOST,
  port: config.DB_PORT,
  dialect: 'mysql',
  logging: config.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao MySQL com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
    
    // Em desenvolvimento, não encerre o processo
    if (config.NODE_ENV === 'development') {
      console.log('⚠️  Continuando sem conexão com MySQL...');
      return false;
    } else {
      process.exit(1);
    }
  }
};

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    return false;
  }
};

// Sincronizar modelos (apenas em desenvolvimento)
const syncModels = async (force = false) => {
  if (config.NODE_ENV === 'development') {
    try {
      await sequelize.sync({ force });
      console.log('✅ Modelos sincronizados com a base de dados');
    } catch (error) {
      console.error('❌ Erro ao sincronizar modelos:', error);
    }
  }
};

module.exports = {
  sequelize,
  connectDB,
  testConnection,
  syncModels
};