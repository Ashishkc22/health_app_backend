const joi = require("joi");

const individual = {
  image: joi.string().uri().optional().messages({
    "string.uri": "Image must be a valid URL.",
  }),

  birth_year: joi
    .number()
    .integer()
    .min(1100)
    .max(new Date().getFullYear())
    .required()
    .messages({
      "number.base": "Birth year must be a number.",
      "number.min": "Birth year must be later than or equal to 1100.",
      "number.max": `Birth year cannot be in the future.`,
      "any.required": "Birth year is required.",
    }),

  name: joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 2 characters long.",
    "string.max": "Name must be no more than 50 characters long.",
  }),

  gender: joi
    .string()
    .valid("Male", "Female", "Transgender")
    .required()
    .messages({
      "any.only": 'Gender must be one of "Male", "Female", or "Transgender".',
      "any.required": "Gender is required.",
    }),

  id_proof: joi.object({
    type: joi.string().required(),
    value: joi.string().required(),
  }),

  state: joi.string().required().messages({
    "string.empty": "State is empty.",
  }),

  district: joi.string().optional().messages({
    "string.empty": "District is empty.",
  }),

  tehsil: joi.string().optional().messages({
    "string.empty": "Tehsil is empty.",
  }),

  area: joi.string().optional().messages({
    "string.empty": "Area is empty.",
  }),
  address: joi.string(),
  phone: joi
    .string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be a 10-digit number.",
      "any.required": "Phone is required.",
    }),

  father_husband_name: joi.string().min(2).max(50).required().messages({
    "string.min": "Father/Husband Name must be at least 2 characters long.",
    "string.max":
      "Father/Husband Name must be no more than 50 characters long.",
  }),

  blood_group: joi
    .string()
    .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
    .required()
    .messages({
      "string.valid":
        'Blood group must be one of "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-".',
    }),

  emergency_contact: joi
    .string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      "string.pattern.base": "Emergency contact must be a 10-digit number.",
    }),

  s_no: joi.string().optional().allow("").messages({
    "string.base": "Serial number must be a string.",
  }),
};

const familyCard = {
  family_members: joi
    .array()
    .items(
      joi.object({
        name: joi.string().required(),
        gender: joi.string().valid("Male", "Female", "Transgender").required(),
        birth_year: joi
          .number()
          .min(1100)
          .max(new Date().getFullYear())
          .required(),
        relation: joi.string().required(),
      })
    )
    .required()
    .min(1)
    .max(4),
  total_price_before_discount: joi.number().required(),
  total_price_after_discount: joi
    .number()
    .max(joi.ref("total_price_before_discount"))
    .required(),
  recevied_amount: joi.number().required(),
  plan_validity: joi.string().required(),
  abha_id: joi
    .string()
    .pattern(/^\d{14}$/) // Matches exactly 14 digits
    .required()
    .messages({
      "string.pattern.base": "ABHA ID must be a valid 14-digit number.",
      "any.required": "ABHA ID is required.",
    }),
  notes: joi.string(),
  pwd: joi.boolean(),
};

module.exports = joi
  .object({
    card_type: joi.string().valid("Individual", "Family").required(),
  })
  .when(joi.object({ card_type: joi.string().valid("Individual") }).unknown(), {
    then: {
      ...individual, // Add individual-specific fields
    },
    otherwise: {
      ...individual, // Add individual fields first (common to both)
      ...familyCard, // Add family-specific fields
    },
  });
