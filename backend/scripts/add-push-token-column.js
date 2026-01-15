const db = require('../config/database');

async function addPushTokenColumns() {
  try {
    console.log('Adding push notification columns to utilizadores table...');

    // Check and add push_token column
    const [pushTokenColumns] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'utilizadores'
      AND COLUMN_NAME = 'push_token'
    `);

    if (pushTokenColumns.length === 0) {
      await db.query(`
        ALTER TABLE utilizadores
        ADD COLUMN push_token VARCHAR(255) NULL
      `);
      console.log('✅ push_token column added successfully');
    } else {
      console.log('ℹ️ push_token column already exists');
    }

    // Check and add ultima_notificacao_lida column
    const [lastReadColumns] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'utilizadores'
      AND COLUMN_NAME = 'ultima_notificacao_lida'
    `);

    if (lastReadColumns.length === 0) {
      await db.query(`
        ALTER TABLE utilizadores
        ADD COLUMN ultima_notificacao_lida INT DEFAULT 0
      `);
      console.log('✅ ultima_notificacao_lida column added successfully');
    } else {
      console.log('ℹ️ ultima_notificacao_lida column already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding push notification columns:', error);
    process.exit(1);
  }
}

addPushTokenColumns();