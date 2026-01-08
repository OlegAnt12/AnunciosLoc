const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });

  next();
};

const errorLogger = (error, req, res, next) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  next(error);
};

module.exports = {
  requestLogger,
  errorLogger
};