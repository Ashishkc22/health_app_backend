const Joi = require("joi");
const currentYear = new Date().getFullYear();
module.exports = Joi.object({
  id_proof: {
    type: Joi.string(),
    front: Joi.string(),
    back: Joi.string(),
  },
  blood_group: Joi.string(),
  dob: Joi.number()
    .min(currentYear - 120) // Max 120 years old
    .max(currentYear - 10), // Min 10 years old
  passportImage: Joi.string(),
  address: Joi.string(),
  state: Joi.string(),
  district: Joi.string(),
  emergency_contact: Joi.string().pattern(/^[6-9]\d{9}$/),
  blood_group: Joi.string(),
});
