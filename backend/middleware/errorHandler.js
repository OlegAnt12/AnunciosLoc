const config = require('../config/environment');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', err);

  // Erro de validação Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Dados de entrada inválidos',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erro de base de dados
  if (err.code && err.code.startsWith('ER_')) {
    return res.status(400).json({
      success: false,
      error: 'Erro na base de dados',
      message: config.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
    });
  }

  // Erro de autenticação
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado'
    });
  }

  // Erro personalizado com status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: config.NODE_ENV === 'development' ? err.message : undefined
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.originalUrl
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};