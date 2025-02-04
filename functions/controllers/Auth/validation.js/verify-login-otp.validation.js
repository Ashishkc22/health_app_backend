const Joi = require("joi");

module.exports = Joi.object({
  otp: Joi.string().length(6).required(),
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
});
