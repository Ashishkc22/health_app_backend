const Joi = require("joi");

// Joi validation schema
const bodyValidationSchema = Joi.object({
  id: Joi.string().required(),
  state: Joi.string(),
  district: Joi.string(),
  category: Joi.string(),
  entity_name: Joi.string(),
  reg_no: Joi.string().optional(),
  address: Joi.string(),
  established_in: Joi.number()
    .integer()
    .min(1800)
    .max(new Date().getFullYear()),
  doctors: Joi.array(),
  basic_facilities: Joi.array(),
  advance_facilities: Joi.array(),
  timings: Joi.array().optional(),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional()
    .messages({
      "string.pattern.base": "Pincode must be a 6-digit number",
    }),
  city: Joi.string(),
  tel_no: Joi.string().pattern(/^\d+$/).optional(),
  mobile_no: Joi.string()
    .pattern(/^\d{10}$/)
    .optional()
    .messages({
      "string.pattern.base": "Mobile number must be a 10-digit number",
    }),
  email: Joi.string().email().optional(),
  website: Joi.string().uri().optional(),
  hospital_rates: Joi.array().items(Joi.string()).optional(),
  discount_ipd: Joi.number().min(0).max(100).optional(),
  discount_opd: Joi.number().min(0).max(100).optional(),
  discount_medicine: Joi.number().min(0).max(100).optional(),
  discount_diagnostic: Joi.number().min(0).max(100).optional(),
  acknowledge: Joi.string().optional(),
  auth_sign: Joi.string().optional(),
  date_of_agreement: Joi.string()
    .pattern(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/)
    .optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  start_time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      "string.pattern.base": "Start time must be in HH:mm format",
    }),
  close_time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      "string.pattern.base": "Close time must be in HH:mm format",
    }),
  map_link: Joi.string().uri().optional(),
  status: Joi.string().valid("ENABLE", "DISABLE").optional(),
  signatureImage: Joi.string().uri().optional(),
});

module.exports = bodyValidationSchema;
