const app = require('./app');
const db = require('./config/database');
const config = require('./config/environment');

const PORT = config.PORT;

async function startServer() {
  try {
    // Testar conexão à base de dados
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.error('❌ Não foi possível conectar à base de dados. A encerrar...');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 AnunciosLoc Backend - Versão Intermédia');
      console.log(`📍 Ambiente: ${config.NODE_ENV}`);
      console.log(`🔗 Servidor: http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api`);
      console.log('✅ Servidor iniciado com sucesso!');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Gestão graciosa de shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT. A encerrar graciosamente...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM. A encerrar graciosamente...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rejeição não tratada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não tratada:', error);
  process.exit(1);
});

startServer();