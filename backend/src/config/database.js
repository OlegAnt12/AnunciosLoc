const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'anunciosloc',
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      charset: 'utf8mb4',
      timezone: '+00:00',
      reconnect: true,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.pool.on('connection', (connection) => {
      console.log('✅ Nova conexão MySQL estabelecida');
    });

    this.pool.on('acquire', (connection) => {
      console.log('🔗 Conexão MySQL adquirida');
    });

    this.pool.on('release', (connection) => {
      console.log('🔄 Conexão MySQL libertada');
    });

    this.pool.on('error', (err) => {
      console.error('❌ Erro na pool MySQL:', err);
    });
  }

  async testConnection() {
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ Conectado à base de dados MySQL');
      connection.release();
      return true;
    } catch (error) {
      console.error('❌ Erro na conexão MySQL:', error.message);
      return false;
    }
  }

  async query(sql, params = []) {
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('❌ Erro na query:', error);
      throw error;
    }
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();

    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new Database();