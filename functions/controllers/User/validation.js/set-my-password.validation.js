const Joi = require("joi");

const setPasswordValidation = Joi.object({
  password: Joi.string()
    .min(8)
    .max(30)
    .required()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .messages({
      "string.base": `"password" should be a type of 'text'`,
      "string.empty": `"password" cannot be an empty field`,
      "string.min": `"password" should have a minimum length of {#limit}`,
      "string.max": `"password" should have a maximum length of {#limit}`,
      "any.required": `"password" is a required field`,
    }),
});

module.exports = setPasswordValidation;
