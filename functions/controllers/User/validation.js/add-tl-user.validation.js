const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  legalName: Joi.string().min(1).max(255).required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  alternatePhone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow(null, ""),
  password: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
  email: Joi.string().email().required(),
  image: Joi.string().uri().allow(null, ""),
  address: Joi.string().min(1).max(500).required(),
  state: Joi.string().min(1).max(255).required(),
  district: Joi.string().min(1).max(255).required(),
  janPanchayat: Joi.string().min(1).max(255).allow(null, ""),
  id_proof: Joi.object({
    back: Joi.string(),
    front: Joi.string(),
  }),

  passportImage: Joi.string().uri().allow(null, ""),
  registrationFormImage: Joi.string().uri().allow(null, ""),
  agreementImage: Joi.string().uri().allow(null, ""),
  panCardImage: Joi.string().uri().allow(null, ""),
  signatureImage: Joi.string().uri().allow(null, ""),
  lat: Joi.number().min(-90).max(90).default(0.0),
  lon: Joi.number().min(-180).max(180).default(0.0),
});

module.exports = schema;
