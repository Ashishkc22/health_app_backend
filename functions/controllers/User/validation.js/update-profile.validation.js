const Joi = require("joi");

module.exports = Joi.object({
  image: Joi.string().uri().optional(),
  name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
});
