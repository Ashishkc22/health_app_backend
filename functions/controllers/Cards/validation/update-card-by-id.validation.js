const Joi = require("joi");

const updateSchema = Joi.object({
  id: Joi.string().required(),
  image: Joi.string().uri().optional().messages({
    "string.uri": "Image must be a valid URL.",
  }),
  card_type: Joi.string().valid("Single", "Family").optional(),
  name: Joi.string().min(2).max(50).optional().messages({
    "string.empty": "Name cannot be empty.",
    "string.min": "Name must be at least 2 characters long.",
    "string.max": "Name must be no more than 50 characters long.",
  }),

  birth_year: Joi.number()
    .integer()
    .min(1100)
    .max(new Date().getFullYear())
    .optional()
    .messages({
      "number.base": "Birth year must be a number.",
      "number.min": "Birth year must be later than or equal to 1100.",
      "number.max": `Birth year cannot be in the future.`,
    }),

  gender: Joi.string().valid("Male", "Female", "Other").optional().messages({
    "any.only": 'Gender must be one of "Male", "Female", or "Transgender".',
  }),

  id_proof: Joi.object({
    type: Joi.string().required().messages({
      "any.required": "ID proof type is required.",
    }),
    value: Joi.string().required().messages({
      "any.required": "ID proof value is required.",
    }),
  }).optional(),
  pincode: Joi.string().optional().messages({
    "string.empty": "Pincode cannot be empty.",
  }),
  city: Joi.string().optional().messages({
    "string.empty": "City cannot be empty.",
  }),
  state: Joi.string().optional().messages({
    "string.empty": "State cannot be empty.",
  }),

  district: Joi.string().optional().messages({
    "string.empty": "District cannot be empty.",
  }),

  tehsil: Joi.string().optional().messages({
    "string.empty": "Tehsil cannot be empty.",
  }),

  area: Joi.string().optional().messages({
    "string.empty": "Area cannot be empty.",
  }),
  // selectedPlanId: Joi.string().optional(),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone must be a valid 10-digit number.",
    }),

  father_husband_name: Joi.string().min(2).max(50).optional().messages({
    "string.empty": "Father/Husband name cannot be empty.",
    "string.min": "Father/Husband name must be at least 2 characters long.",
    "string.max":
      "Father/Husband name must be no more than 50 characters long.",
  }),

  blood_group: Joi.string()
    .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
    .optional()
    .messages({
      "any.only":
        'Blood group must be one of "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-".',
    }),

  emergency_contact: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Emergency contact must be a valid 10-digit number.",
    }),

  expiry_date: Joi.number().integer().optional().messages({
    "number.base": "Expiry date must be a valid timestamp.",
  }),

  expiry_years: Joi.number().integer().optional().messages({
    "number.base": "Expiry years must be a valid number.",
  }),

  discard_reason: Joi.string().optional().messages({
    "string.empty": "Discard reason cannot be empty.",
  }),

  family_members: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required().messages({
          "any.required": "Family member name is required.",
        }),
        gender: Joi.string()
          .valid("Male", "Female", "Transgender")
          .required()
          .messages({
            "any.only":
              'Gender must be one of "Male", "Female", or "Transgender".',
          }),
        birth_year: Joi.number()
          .integer()
          .min(1100)
          .max(new Date().getFullYear())
          .required()
          .messages({
            "number.base": "Birth year must be a number.",
            "number.min": "Birth year must be later than or equal to 1100.",
            "number.max": `Birth year cannot be in the future.`,
          }),
        relation: Joi.string().required().messages({
          "any.required": "Relation is required.",
        }),
      })
    )
    .max(4)
    .optional()
    .messages({
      "array.max": "You can add a maximum of 4 family members.",
    }),

  reSubmit: Joi.boolean().optional().messages({
    "boolean.base": "reSubmit must be a boolean.",
  }),
});

module.exports = updateSchema;
