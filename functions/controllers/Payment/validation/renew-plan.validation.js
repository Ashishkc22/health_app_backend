const Joi = require("joi");

const schema = Joi.object({
  planId: Joi.string().required().messages({
    "string.empty": "Plan ID is required",
    "any.required": "Plan ID is required",
  }),
  subscriptionId: Joi.string().required().messages({
    "string.empty": "Subscription ID is required",
    "any.required": "Subscription ID is required",
  }),
  notes: Joi.string().allow("").optional(),
});

module.exports = schema;