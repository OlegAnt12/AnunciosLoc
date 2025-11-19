module.exports = {
  CATEGORIES: [
    'Apartamento',
    'Casa',
    'Quarto',
    'Escritório',
    'Loja',
    'Galpão',
    'Terreno',
    'Outro'
  ],

  PRICE_RANGES: {
    MIN: 0,
    MAX: 1000000
  },

  LOCATION_TYPES: {
    RENT: 'aluguel',
    SALE: 'venda'
  },

  NOTIFICATION_TYPES: {
    MESSAGE: 'message',
    LOCATION_APPROVAL: 'location_approval',
    LOCATION_REJECTION: 'location_rejection',
    SYSTEM: 'system'
  },

  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50
  },

  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
  },

  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCK_TIME: 30 * 60 * 1000 // 30 minutes
  }
};