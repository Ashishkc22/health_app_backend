const Joi = require("joi");

module.exports = Joi.object({
  id: Joi.string(),
  uid: Joi.string(),
  tlId: Joi.string(),
}).or("id", "tlId", "uid");
