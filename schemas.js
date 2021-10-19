const Joi = require('joi')

module.exports.signupSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
}).required()

module.exports.loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(5).required(),
}).required()
