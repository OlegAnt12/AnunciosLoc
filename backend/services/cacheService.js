// Serviço de cache simples em memória para desenvolvimento
// Em produção, usar Redis ou Memcached

class CacheService {
  constructor() {
    this.cache = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Limpar a cada minuto
  }

  async get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;

    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key, value, ttl = 300) { // TTL padrão: 5 minutos
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
  }

  async delete(key) {
    this.cache.delete(key);
  }

  async deletePattern(pattern) {
    const keys = Array.from(this.cache.keys());
    const regex = new RegExp(pattern);
    
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async flush() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && item.expiry < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache limpo: ${cleaned} itens expirados removidos`);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = new CacheService();