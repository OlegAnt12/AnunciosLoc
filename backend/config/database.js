const mysql = require('mysql2/promise');
require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./environment');

// Pool MySQL (mysql2)
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

// Helper wrappers so the rest of the code can use a consistent API
const execute = (...args) => pool.execute(...args);
const query = (...args) => pool.query(...args);

// Simple transaction helper API: db.transaction(async (conn) => { await conn.execute(...); })
const transaction = async (worker) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const tx = {
      execute: (...args) => connection.execute(...args),
      query: (...args) => connection.query(...args),
      commit: () => connection.commit(),
      rollback: () => connection.rollback()
    };

    const result = await worker(tx);
    await connection.commit();
    connection.release();
    return result;
  } catch (err) {
    await connection.rollback();
    connection.release();
    throw err;
  }
};

// Sequelize (for parts that still use it)
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
  pool,
  execute,
  query,
  transaction,
  sequelize,
  connectDB,
  testConnection,
  syncModels,
  // Close pool (used by tests to shutdown)
  end: async () => {
    try {
      await pool.end();
    } catch (err) {
      console.warn('Warning while ending pool:', err.message);
    }
  }
};