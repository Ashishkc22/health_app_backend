const Joi = require("joi");

const getTeamMemberStatus = Joi.object({
  id: Joi.string().required(),
});

module.exports = getTeamMemberStatus;
