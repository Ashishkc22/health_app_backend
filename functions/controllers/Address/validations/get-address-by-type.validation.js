const Joi = require("joi");

module.exports = Joi.object({
  refId: Joi.string(),
  type: Joi.string().required(),
  isTeshilId: Joi.boolean(),
  showHidden: Joi.boolean(),
  showCardCount: Joi.boolean(),
  showGrams: Joi.boolean(),
});
