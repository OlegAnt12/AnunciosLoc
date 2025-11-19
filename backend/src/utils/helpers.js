const crypto = require('crypto');

class Helpers {
  // Gerar ID único
  static generateId(length = 16) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Formatar data para MySQL
  static formatDateForMySQL(date = new Date()) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  // Calcular distância entre coordenadas (fórmula de Haversine)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distância em km
    
    return distance * 1000; // Converter para metros
  }

  static deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Validar coordenadas GPS
  static isValidCoordinates(latitude, longitude) {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  // Sanitizar string para SQL
  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/['"\\\x00-\x1F\x7F]/g, '');
  }

  // Gerar paginação
  static generatePagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : null,
      prevPage: hasPrev ? page - 1 : null
    };
  }

  // Delay assíncrono
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Extrair SSIDs de string
  static parseSSIDs(ssidsString) {
    if (!ssidsString) return [];
    return ssidsString.split(',').map(ssid => ssid.trim()).filter(ssid => ssid);
  }

  // Validar política de mensagem
  static validatePolicy(policy) {
    const validTypes = ['WHITELIST', 'BLACKLIST'];
    return validTypes.includes(policy);
  }
}

module.exports = Helpers;