const Joi = require("joi");
module.exports = Joi.object({
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile must be a valid 10-digit number.",
      "any.required": "Mobile is required.",
    }),
});
