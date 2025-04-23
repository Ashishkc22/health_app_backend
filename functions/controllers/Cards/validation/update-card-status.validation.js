const Joi = require("joi");
const { CardEnums, DBEnums } = require("../../../Enums");

const updateCardStatusValidation = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "Card ID is required",
    "string.empty": "Card ID cannot be empty",
  }),
  discard_reason: Joi.string().allow("").optional().messages({
    "string.empty": "Discard reason cannot be empty",
  }),
  status: Joi.string()
    .valid(...Object.values(DBEnums.CARD_STATUS))
    .required()
    .messages({
      "any.required": "Status is required",
      "string.empty": "Status cannot be empty",
      "any.only": "Status must be one of [active, inactive, suspended]",
    }),
});

module.exports = updateCardStatusValidation;
