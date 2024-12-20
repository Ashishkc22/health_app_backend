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
  type: Joi.string()
    .valid(...locationCategories)
    .required(),
  name: Joi.string().required(),
  ref_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Invalid ref Id"),
  active: Joi.boolean().optional().allow(""),
};

module.exports = {
  state: Joi.object({
    type: Joi.string()
      .valid(...locationCategories)
      .required(),
    name: Joi.string().required(),
    active: Joi.boolean().optional().allow(""),
  }),
  district: Joi.object({
    ...baseValidation,
  }),
  tehsil: Joi.object(baseValidation),
  janPanchayat: Joi.object(baseValidation),
  gramPanchayat: Joi.object({
    ...baseValidation,
    janPanchayatId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .message("Invalid janPanchayatId Id"),
    tehsilId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .message("Invalid tehsilId Id"),
    sarpanch: Joi.string(),
    sachiv: Joi.string(),
    rojgar_sahayak: Joi.string(),
    pincode: Joi.string(),
    tehsil: Joi.string(),
  }).or("janPanchayatId", "tehsilId"),
  gram: Joi.object({ ...baseValidation, map_link: Joi.string() }),
};
