const Joi = require("joi");

const schema = Joi.object({
  planId: Joi.string().messages({
    "string.empty": "Plan ID is required",
    "any.required": "Plan ID is required",
  }),
  isPlanRenew: Joi.boolean().optional(),
  isCoinPurchase: Joi.boolean().optional(),
  amount: Joi.number().optional(),
  description: Joi.string().allow("").optional(),
  notes: Joi.string().allow("").optional(),
}).or("planId", "amount");

module.exports = schema;
