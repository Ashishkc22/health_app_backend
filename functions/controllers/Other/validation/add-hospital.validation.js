const Joi = require("joi");

const schema = Joi.object({
  category: Joi.string().valid("Hospital", "Medical","Labs & Diagnostic Centers").required(),
  entity_name: Joi.string().min(2).max(255).required(),
  contactPersonPhone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Contact person phone number must be a 10-digit number",
    }),
    address: Joi.string().required(),
});

module.exports = schema;
