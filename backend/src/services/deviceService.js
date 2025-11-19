const db = require('../config/database');

class DeviceService {
  async registerDevice(userId, deviceData) {
    const { device_id, device_name, tipo, so_version } = deviceData;

    // Verificar se o dispositivo já existe
    const [existingDevices] = await db.query(
      'SELECT id FROM dispositivos WHERE device_id = ? AND utilizador_id = ?',
      [device_id, userId]
    );

    if (existingDevices.length > 0) {
      // Atualizar dispositivo existente
      await db.query(
        `UPDATE dispositivos 
         SET device_name = ?, tipo = ?, so_version = ?, data_ultimo_acesso = NOW(), ativo = TRUE 
         WHERE device_id = ? AND utilizador_id = ?`,
        [device_name, tipo, so_version, device_id, userId]
      );
      return existingDevices[0].id;
    } else {
      // Inserir novo dispositivo
      const [result] = await db.query(
        `INSERT INTO dispositivos (utilizador_id, device_id, device_name, tipo, so_version) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, device_id, device_name, tipo, so_version]
      );
      return result.insertId;
    }
  }

  async updateDeviceConnectivity(deviceId, connectivityData) {
    const { tipo_conexao, endereco_ip, endereco_mac, online } = connectivityData;

    await db.query(
      `INSERT INTO conectividade_dispositivos (dispositivo_id, tipo_conexao, endereco_ip, endereco_mac, online) 
       VALUES (?, ?, ?, ?, ?)`,
      [deviceId, tipo_conexao, endereco_ip, endereco_mac, online]
    );
  }

  async getUserDevices(userId) {
    const devices = await db.query(`
      SELECT 
        d.*,
        cd.tipo_conexao,
        cd.online,
        cd.data_verificacao
      FROM dispositivos d
      LEFT JOIN conectividade_dispositivos cd ON d.id = cd.dispositivo_id
      WHERE d.utilizador_id = ? AND d.ativo = TRUE
      ORDER BY cd.data_verificacao DESC
    `, [userId]);

    return devices;
  }

  async deactivateDevice(deviceId, userId) {
    await db.query(
      'UPDATE dispositivos SET ativo = FALSE WHERE id = ? AND utilizador_id = ?',
      [deviceId, userId]
    );
  }

  async cleanupInactiveDevices() {
    const result = await db.query(
      'UPDATE dispositivos SET ativo = FALSE WHERE data_ultimo_acesso < DATE_SUB(NOW(), INTERVAL 30 DAY) AND ativo = TRUE'
    );
    
    console.log(`🧹 Dispositivos inativos desativados: ${result.affectedRows}`);
    return result.affectedRows;
  }
}

module.exports = new DeviceService();