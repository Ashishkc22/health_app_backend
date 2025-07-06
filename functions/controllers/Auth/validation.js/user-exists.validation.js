const joi = require("joi");

module.exports = joi
  .object({
    email: joi.string().email(),
    tlId: joi.string(),
    uId: joi.string(),
  })
  .or("email", "tlId", "uId");
