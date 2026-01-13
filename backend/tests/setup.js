const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

// Runs before tests: initialize DB schema
module.exports = async () => {
  console.log('🧪 Test setup: initializing DB schema');

  const initScript = path.resolve(__dirname, '../database/init.js');
  if (!fs.existsSync(initScript)) {
    throw new Error('DB init script not found: ' + initScript);
  }

  await new Promise((resolve, reject) => {
    const proc = spawn('node', [initScript], { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error('DB init failed with code ' + code));
    });
    proc.on('error', reject);
  });

  // Small delay to allow MySQL to settle
  await new Promise((r) => setTimeout(r, 500));

  // Ensure database pool is ready
  const ok = await db.testConnection();
  if (!ok) throw new Error('Database not available for tests');

  // Truncate tables commonly used by tests to ensure clean state
  const tablesToTruncate = ['entregas_mensagens', 'mensagens', 'perfis_utilizador', 'sessoes', 'utilizadores', 'dispositivos', 'locais', 'logs_mensagens', 'matching_localizacao', 'ssids_wifi', 'coordenadas_gps'];
  for (const t of tablesToTruncate) {
    try {
      await db.execute(`DELETE FROM ${t}`);
    } catch (err) {
      // ignore if table doesn't exist in early stages
    }
  }

  console.log('✅ Test DB ready');

  // export a global helper to close DB after tests
  global.__dbEnd = db.end;
};