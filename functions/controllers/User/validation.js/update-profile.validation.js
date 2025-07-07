const Joi = require("joi");
module.exports = Joi.object({
  id_proof: {
    type: Joi.string(),
    front: Joi.string(),
    back: Joi.string(),
  },
  blood_group: Joi.string(),
  dob: Joi.string().pattern(/^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/),
  passportImage: Joi.string(),
  address: Joi.string(),
  state: Joi.string(),
  district: Joi.string(),
  emergency_contact: Joi.string().pattern(/^[6-9]\d{9}$/),
  blood_group: Joi.string(),
});
