const Joi = require('joi');

const schemas = {
  // Autenticação
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required()
      .messages({
        'string.alphanum': 'Username deve conter apenas letras e números',
        'string.min': 'Username deve ter pelo menos 3 caracteres',
        'string.max': 'Username deve ter no máximo 50 caracteres',
        'any.required': 'Username é obrigatório'
      }),
    password: Joi.string().min(6).max(100).required()
      .messages({
        'string.min': 'Password deve ter pelo menos 6 caracteres',
        'string.max': 'Password deve ter no máximo 100 caracteres',
        'any.required': 'Password é obrigatória'
      })
  }),

  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  // Locais
  createLocation: Joi.object({
    nome: Joi.string().min(1).max(100).required(),
    descricao: Joi.string().max(500).optional().allow(''),
    tipo: Joi.string().valid('GPS', 'WIFI').required(),
    coordenadas: Joi.alternatives().conditional('tipo', {
      is: 'GPS',
      then: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
        raio_metros: Joi.number().min(1).max(10000).required()
      }).required(),
      otherwise: Joi.array().items(Joi.string().min(1).max(100)).min(1).max(10).required()
    })
  }),

  updateLocation: Joi.object({
    nome: Joi.string().min(1).max(100).optional(),
    descricao: Joi.string().max(500).optional().allow('')
  }),

  // Mensagens
  createMessage: Joi.object({
    titulo: Joi.string().min(1).max(200).required(),
    conteudo: Joi.string().min(1).max(5000).required(),
    local_id: Joi.number().integer().positive().required(),
    tipo_politica: Joi.string().valid('WHITELIST', 'BLACKLIST').default('WHITELIST'),
    modo_entrega: Joi.string().valid('CENTRALIZADO', 'DESCENTRALIZADO').default('CENTRALIZADO'),
    data_inicio: Joi.date().min('now').optional(),
    data_fim: Joi.date().greater(Joi.ref('data_inicio')).optional(),
    restricoes: Joi.array().items(
      Joi.object({
        chave: Joi.string().min(1).max(50).required(),
        valor: Joi.string().min(1).max(100).required()
      })
    ).max(10).optional()
  }),

  receiveMessage: Joi.object({
    deviceId: Joi.string().max(100).optional().allow(null)
  }),

  // Localização
  checkLocation: Joi.object({
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    ssids: Joi.array().items(Joi.string()).max(20).optional()
  }),

  // Dispositivos
  registerDevice: Joi.object({
    device_id: Joi.string().min(1).max(255).required(),
    device_name: Joi.string().max(100).optional(),
    tipo: Joi.string().max(50).optional(),
    so_version: Joi.string().max(50).optional()
  }),

  // Perfil
  updateProfile: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).optional()
  }),

  addProfileKey: Joi.object({
    chave: Joi.string().min(1).max(50).required(),
    valor: Joi.string().min(1).max(100).required()
  })
};

// Schemas para parâmetros de URL
const paramSchemas = {
  id: Joi.number().integer().positive().required(),
  locationId: Joi.number().integer().positive().required(),
  messageId: Joi.number().integer().positive().required(),
  userId: Joi.number().integer().positive().required()
};

// Schemas para query parameters
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};

module.exports = {
  schemas,
  paramSchemas,
  querySchemas
};