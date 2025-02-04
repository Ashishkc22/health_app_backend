const Joi = require("joi");

module.exports = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  dob: Joi.string().isoDate().required(),
  gender: Joi.string().valid("Male", "Female", "Transgender","Other").required(),
  current_pincode: Joi.string().min(6).max(6).required(),
  current_district: Joi.string().min(2).max(100).required(),
  current_city: Joi.string().min(2).max(100).required(),
  image: Joi.string().uri().optional(),
});
