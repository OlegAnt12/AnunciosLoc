const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const locationSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('gps', 'wifi').required(),
  latitude: Joi.number().min(-90).max(90).when('type', {
    is: 'gps',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  longitude: Joi.number().min(-180).max(180).when('type', {
    is: 'gps',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  radius: Joi.number().min(1).when('type', {
    is: 'gps',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  wifi_ssid: Joi.array().items(Joi.string()).when('type', {
    is: 'wifi',
    then: Joi.required().min(1),
    otherwise: Joi.optional()
  })
});

const messageSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).max(2000).required(),
  location_id: Joi.number().integer().required(),
  policy_type: Joi.string().valid('whitelist', 'blacklist').required(),
  start_time: Joi.date().required(),
  end_time: Joi.date().greater(Joi.ref('start_time')).required(),
  policy_rules: Joi.array().items(Joi.object({
    key: Joi.string().required(),
    value: Joi.string().required()
  })).optional()
});

const profileSchema = Joi.object({
  key: Joi.string().min(1).max(50).required(),
  value: Joi.string().min(1).max(100).required()
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  locationSchema,
  messageSchema,
  profileSchema
};