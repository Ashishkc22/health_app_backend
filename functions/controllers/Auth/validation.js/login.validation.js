const Joi = require("joi");

module.exports = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/) // Validate as a 10-digit phone number
    .optional(),
  password: Joi.string().required(),
}).or("email", "phone");
