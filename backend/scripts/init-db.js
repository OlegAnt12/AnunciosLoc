const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🔄 A inicializar base de dados...');

    // Ler ficheiro SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Executar SQL
    await pool.query(sql);
    
    console.log('✅ Base de dados inicializada com sucesso!');
    
    // Inserir dados de exemplo
    await insertSampleData();
    
  } catch (error) {
    console.error('❌ Erro a inicializar base de dados:', error);
  } finally {
    await pool.end();
  }
}

async function insertSampleData() {
  try {
    // Inserir tipos de coordenada
    await pool.query(`
      INSERT INTO tipos_coordenada (nome, descricao) VALUES 
      ('GPS', 'Coordenadas geográficas com latitude, longitude e raio'),
      ('WIFI', 'Identificação por SSIDs de redes WiFi')
      ON CONFLICT (nome) DO NOTHING
    `);

    // Inserir tipos de política
    await pool.query(`
      INSERT INTO tipos_politica (nome, descricao) VALUES 
      ('WHITELIST', 'Permite apenas utilizadores que correspondem à lista'),
      ('BLACKLIST', 'Permite todos excepto os utilizadores da lista')
      ON CONFLICT (nome) DO NOTHING
    `);

    // Inserir chaves de perfil públicas
    await pool.query(`
      INSERT INTO chaves_perfil_publicas (chave, descricao) VALUES 
      ('profissao', 'Profissão do utilizador'),
      ('interesse', 'Interesses pessoais'),
      ('clube', 'Clube de futebol preferido'),
      ('faculdade', 'Faculdade/Universidade'),
      ('hobby', 'Hobbies e atividades')
      ON CONFLICT (chave) DO NOTHING
    `);

    console.log('✅ Dados de exemplo inseridos!');
  } catch (error) {
    console.error('❌ Erro a inserir dados de exemplo:', error);
  }
}

initializeDatabase();