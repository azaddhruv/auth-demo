const express = require('express')
const Joi = require('joi')
const { signupSchema, loginSchema } = require('./schemas.js')

module.exports.signupValidate = (req, res, next) => {
  const { error } = signupSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ')
    res.json({ error: msg })
  } else {
    next()
  }
}

module.exports.loginValidate = (req, res, next) => {
  const { error } = loginSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ')
    res.json({ error: msg })
  } else {
    next()
  }
}
