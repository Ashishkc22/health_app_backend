const Joi = require("joi");

module.exports = Joi.object({
  otp: Joi.string().length(5).required(),
  email: Joi.string().email().required(),
});
