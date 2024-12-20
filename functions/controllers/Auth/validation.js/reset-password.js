const Joi = require("joi");

module.exports = Joi.object({
  password: Joi.string()
    .min(8) // Minimum length of 8 characters
    .max(30) // Maximum length of 30 characters
    .required()
    .label("Password")
    .messages({
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password must not exceed 30 characters.",
      "any.required": "Password is required.",
    }),
  token: Joi.string().required(),
});
