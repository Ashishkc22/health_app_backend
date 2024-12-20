const Joi = require("joi");

const locationCategories = [
  "state",
  "district",
  "tehsil",
  "janPanchayat",
  "gramPanchayat",
  "gram",
];
const baseValidation = {
  id: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Invalid ref Id"),
  name: Joi.string().optional(),
  ref_id: Joi.string()
    .optional()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Invalid ref Id"),
  active: Joi.boolean().optional().allow(""),
  type: Joi.string()
    .valid(...locationCategories)
    .required(),
};

module.exports = {
  state: Joi.object({
    id: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/)
      .message("Invalid ref Id"),
    name: Joi.string(),
    type: Joi.string()
      .valid(...locationCategories)
      .required(),
    active: Joi.boolean().optional().allow(""),
  }),
  district: Joi.object({
    ...baseValidation,
  }),
  tehsil: Joi.object(baseValidation),
  janPanchayat: Joi.object(baseValidation),
  gramPanchayat: Joi.object({
    ...baseValidation,
    sarpanch: Joi.string(),
    sachiv: Joi.string(),
    rojgar_sahayak: Joi.string(),
    pincode: Joi.string(),
    tehsil: Joi.string(),
  }),
  gram: Joi.object({ ...baseValidation, map_link: Joi.string() }),
};
