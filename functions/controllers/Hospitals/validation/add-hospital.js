const Joi = require("joi");

const hospitalSchema = Joi.object({
  state: Joi.string().required(),
  district: Joi.string().required(),
  category: Joi.string().required(),
  entity_name: Joi.string().required(),
  reg_no: Joi.string().required(),
  established_in: Joi.number()
    .integer()
    .min(1800)
    .max(new Date().getFullYear())
    .required(),
  doctors: Joi.array().items(Joi.string()).required(),
  basic_facilities: Joi.array().items(Joi.string()).required(),
  advance_facilities: Joi.array().items(Joi.string()).optional(),
  timings: Joi.string().required(),
  address: Joi.string().required(),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Pincode must be a 6-digit number",
    }),
  signatureImage: Joi.string().uri().optional(),
  city: Joi.string().required(),
  tel_no: Joi.string().pattern(/^\d+$/).optional(),
  mobile_no: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be a 10-digit number",
    }),
  email: Joi.string().email().required(),
  website: Joi.string().uri().optional(),
  hospital_rates: Joi.array().items(Joi.string()).optional(),
  discount_ipd: Joi.number().min(0).max(100).required(),
  discount_opd: Joi.number().min(0).max(100).required(),
  discount_medicine: Joi.number().min(0).max(100).required(),
  discount_diagnostic: Joi.number().min(0).max(100).required(),
  acknowledge: Joi.string().required(),
  auth_sign: Joi.string().required(),
  date_of_agreement: Joi.date().required(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  created_by: Joi.string().required(),
  created_by_name: Joi.string().required(),
  created_by_uid: Joi.string().required(),
  created_at: Joi.number().integer().required(),
  start_time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "Start time must be in HH:mm format",
    }),
  close_time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "Close time must be in HH:mm format",
    }),
  map_link: Joi.string().uri().optional(),
  status: Joi.string().valid("ENABLE", "DISABLE").default("ENABLE"),
  contactPersonName: Joi.string().required(),
  contactPersonPhone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Contact person phone number must be a 10-digit number",
    }),
});

module.exports = hospitalSchema;
