const db = require('../config/database');

class Message {
  static async create(messageData) {
    const { title, content, location_id, author_id, policy_type, start_time, end_time } = messageData;
    
    const [result] = await db.execute(
      `INSERT INTO messages (title, content, location_id, author_id, policy_type, start_time, end_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, content, location_id, author_id, policy_type, start_time, end_time]
    );
    
    return result.insertId;
  }

  static async addPolicyRules(messageId, policyRules) {
    if (!policyRules || policyRules.length === 0) return;
    
    const values = policyRules.map(rule => [messageId, rule.key, rule.value]);
    const placeholders = policyRules.map(() => '(?, ?, ?)').join(', ');
    
    await db.execute(
      `INSERT INTO message_policy_rules (message_id, key, value) VALUES ${placeholders}`,
      values.flat()
    );
  }

  static async getMessagesForUser(userId, userLocation) {
    const { latitude, longitude, wifi_ssids = [] } = userLocation;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Get GPS-based locations
    const gpsLocations = await db.execute(`
      SELECT l.id 
      FROM locations l 
      WHERE l.type = 'gps' 
      AND (6371 * acos(cos(radians(?)) * cos(radians(l.latitude)) * 
        cos(radians(l.longitude) - radians(?)) + sin(radians(?)) * 
        sin(radians(l.latitude)))) * 1000 <= l.radius
    `, [latitude, longitude, latitude]);
    
    // Get WiFi-based locations
    const wifiSSIDString = JSON.stringify(wifi_ssids);
    const wifiLocations = await db.execute(`
      SELECT l.id 
      FROM locations l 
      WHERE l.type = 'wifi' 
      AND JSON_OVERLAPS(l.wifi_ssid, ?)
    `, [wifiSSIDString]);
    
    const locationIds = [
      ...gpsLocations[0].map(row => row.id),
      ...wifiLocations[0].map(row => row.id)
    ];
    
    if (locationIds.length === 0) return [];
    
    // Get messages for these locations that match user profile and time window
    const [messages] = await db.execute(`
      SELECT DISTINCT m.*, u.username as author_username, l.name as location_name
      FROM messages m
      JOIN users u ON m.author_id = u.id
      JOIN locations l ON m.location_id = l.id
      LEFT JOIN message_policy_rules mpr ON m.id = mpr.message_id
      LEFT JOIN user_profiles up ON (up.user_id = ? AND up.key = mpr.key AND up.value = mpr.value)
      WHERE m.location_id IN (?)
      AND m.start_time <= ? AND m.end_time >= ?
      AND (
        m.policy_type = 'whitelist' AND mpr.message_id IS NOT NULL AND up.user_id IS NOT NULL
        OR
        m.policy_type = 'blacklist' AND (mpr.message_id IS NULL OR up.user_id IS NULL)
        OR
        (m.policy_type = 'whitelist' AND NOT EXISTS (
          SELECT 1 FROM message_policy_rules mpr2 WHERE mpr2.message_id = m.id
        ))
      )
      AND m.id NOT IN (
        SELECT message_id FROM user_received_messages WHERE user_id = ?
      )
    `, [userId, locationIds, now, now, userId]);
    
    return messages;
  }

  static async markAsReceived(userId, messageId) {
    const [result] = await db.execute(
      'INSERT INTO user_received_messages (user_id, message_id) VALUES (?, ?)',
      [userId, messageId]
    );
    
    return result.insertId;
  }

  static async getUserMessages(userId) {
    const [rows] = await db.execute(`
      SELECT m.*, u.username as author_username, l.name as location_name, urm.received_at
      FROM user_received_messages urm
      JOIN messages m ON urm.message_id = m.id
      JOIN users u ON m.author_id = u.id
      JOIN locations l ON m.location_id = l.id
      WHERE urm.user_id = ?
      ORDER BY urm.received_at DESC
    `, [userId]);
    
    return rows;
  }

  static async getUserSentMessages(userId) {
    const [rows] = await db.execute(`
      SELECT m.*, l.name as location_name, COUNT(urm.user_id) as received_count
      FROM messages m
      JOIN locations l ON m.location_id = l.id
      LEFT JOIN user_received_messages urm ON m.id = urm.message_id
      WHERE m.author_id = ?
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `, [userId]);
    
    return rows;
  }

  static async deleteMessage(messageId, authorId) {
    const [result] = await db.execute(
      'DELETE FROM messages WHERE id = ? AND author_id = ?',
      [messageId, authorId]
    );
    
    return result.affectedRows > 0;
  }

  static async getMessagePolicyRules(messageId) {
    const [rows] = await db.execute(
      'SELECT key, value FROM message_policy_rules WHERE message_id = ?',
      [messageId]
    );
    
    return rows;
  }
}

module.exports = Message;