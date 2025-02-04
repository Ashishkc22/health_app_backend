const Joi = require("joi");

const schema = Joi.object({
  recipientId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Recipient ID is required",
      "string.pattern.base": "Invalid recipient ID",
      "any.required": "Recipient ID is required",
    }),
  amount: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Amount must be a number",
      "number.integer": "Amount must be an integer",
      "number.positive": "Amount must be positive",
      "any.required": "Amount is required",
    }),
});

module.exports = schema;
