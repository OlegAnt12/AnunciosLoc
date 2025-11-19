const db = require('../config/database');

class Location {
  static async create(locationData) {
    const { name, type, latitude, longitude, radius, wifi_ssid, created_by } = locationData;
    
    const wifiSSIDString = wifi_ssid ? JSON.stringify(wifi_ssid) : null;
    
    const [result] = await db.execute(
      `INSERT INTO locations (name, type, latitude, longitude, radius, wifi_ssid, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, type, latitude, longitude, radius, wifiSSIDString, created_by]
    );
    
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.execute(`
      SELECT l.*, u.username as created_by_username 
      FROM locations l 
      JOIN users u ON l.created_by = u.id 
      ORDER BY l.name
    `);
    
    // Parse WiFi SSIDs from JSON string
    return rows.map(row => ({
      ...row,
      wifi_ssid: row.wifi_ssid ? JSON.parse(row.wifi_ssid) : null
    }));
  }

  static async findById(id) {
    const [rows] = await db.execute(`
      SELECT l.*, u.username as created_by_username 
      FROM locations l 
      JOIN users u ON l.created_by = u.id 
      WHERE l.id = ?
    `, [id]);
    
    if (rows.length === 0) return null;
    
    const location = rows[0];
    location.wifi_ssid = location.wifi_ssid ? JSON.parse(location.wifi_ssid) : null;
    
    return location;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM locations WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  static async findByCoordinates(lat, lng, radius = 100) {
    // Fórmula Haversine simplificada para encontrar locais próximos
    const [rows] = await db.execute(`
      SELECT *, 
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
        sin(radians(latitude)))) AS distance 
      FROM locations 
      WHERE type = 'gps' 
      HAVING distance < ? 
      ORDER BY distance
    `, [lat, lng, lat, radius / 1000]); // Convert meters to km
    
    return rows;
  }

  static async findByWifiSSID(ssid) {
    const [rows] = await db.execute(
      'SELECT * FROM locations WHERE type = "wifi" AND JSON_CONTAINS(wifi_ssid, ?)',
      [JSON.stringify(ssid)]
    );
    
    return rows.map(row => ({
      ...row,
      wifi_ssid: row.wifi_ssid ? JSON.parse(row.wifi_ssid) : null
    }));
  }
}

module.exports = Location;