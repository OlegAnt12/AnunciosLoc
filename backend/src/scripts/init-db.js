const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  
  try {
    console.log('🔄 A inicializar base de dados MySQL...');

    // Conectar sem database específico
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    // Criar database se não existir
    const dbName = process.env.DB_NAME || 'anunciosloc';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.execute(`USE \`${dbName}\``);

    console.log('✅ Base de dados criada/verificada');

    // Ler e executar schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema-mysql.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Ficheiro de schema não encontrado: ${schemaPath}`);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir por statements (MySQL não suporta múltiplos statements de uma vez)
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 A executar ${statements.length} statements...`);

    for (const statement of statements) {
      try {
        await connection.execute(statement);
      } catch (error) {
        // Ignorar alguns erros esperados
        if (!error.message.includes('Already exists') && 
            !error.message.includes('unknown table') &&
            !error.message.includes('check that rights')) {
          console.warn(`⚠️  Aviso ao executar statement:`, error.message);
        }
      }
    }

    console.log('✅ Schema da base de dados criado com sucesso!');
    
    // Inserir dados iniciais
    await seedInitialData(connection);
    
  } catch (error) {
    console.error('❌ Erro a inicializar base de dados:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function seedInitialData(connection) {
  try {
    console.log('🌱 A inserir dados iniciais...');

    // Inserir tipos de coordenada
    await connection.execute(`
      INSERT IGNORE INTO tipos_coordenada (id, nome, descricao) VALUES 
      (1, 'GPS', 'Coordenadas geográficas com latitude, longitude e raio'),
      (2, 'WIFI', 'Identificação por SSIDs de redes WiFi')
    `);

    // Inserir tipos de política
    await connection.execute(`
      INSERT IGNORE INTO tipos_politica (id, nome, descricao) VALUES 
      (1, 'WHITELIST', 'Permite apenas utilizadores que correspondem à lista'),
      (2, 'BLACKLIST', 'Permite todos excepto os utilizadores da lista')
    `);

    // Inserir chaves de perfil públicas
    await connection.execute(`
      INSERT IGNORE INTO chaves_perfil_publicas (chave, descricao) VALUES 
      ('profissao', 'Profissão do utilizador'),
      ('interesse', 'Interesses pessoais'),
      ('clube', 'Clube de futebol preferido'),
      ('faculdade', 'Faculdade/Universidade'),
      ('hobby', 'Hobbies e atividades'),
      ('cidade', 'Cidade de residência'),
      ('curso', 'Curso académico')
    `);

    console.log('✅ Dados iniciais inseridos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro a inserir dados iniciais:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;