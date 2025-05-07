const Joi = require("joi");
const area = require("../../../models/area");
const gram = require("../../../models/gram");

module.exports = Joi.object({
  state: Joi.string().required(),
  district: Joi.string().required(),
  janpad: Joi.string().required(),
  locationType: Joi.string().required(),
  area: Joi.string().when("locationType", {
    is: "City",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  gramPanchayat: Joi.string().when("locationType", {
    is: "Village",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  gram: Joi.string().required(),
  tehsil: Joi.string().required(),
  pinCode: Joi.string().optional(),
  mapLink: Joi.string().optional(),
});
