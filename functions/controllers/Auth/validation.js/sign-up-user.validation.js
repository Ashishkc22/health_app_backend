const Joi = require("joi");

const validationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().label("Name"),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .label("Phone Number"),
  password: Joi.string().min(6).max(50).required().label("Password"),
  email: Joi.string().email().required().label("Email"),
  image: Joi.string().uri().optional().label("Image URL"), // Assuming image is a URL
  address: Joi.string().min(5).max(255).optional().label("Address"),
  state: Joi.string().min(2).max(100).optional().label("State"),
  district: Joi.string().min(2).max(100).optional().label("District"),
  id_proof: Joi.string().min(5).max(255).optional().label("ID Proof"),
  alternate_phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .label("alternate_phone"),
  team_leader_id: Joi.string().optional().label("Team Leader ID"),
  device_id: Joi.string().optional().label("Device ID"),
  lat: Joi.number().min(-90).max(90).optional().default(0.0).label("Latitude"),
  lon: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .default(0.0)
    .label("Longitude"),
});
module.exports = validationSchema;
