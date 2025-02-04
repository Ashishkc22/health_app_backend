const { userSchema } = require("../models");
const { CustomError } = require("../utils/custom-errors");
const { logger } = require("../utils/logger");
const { ProcessorErrors } = require("../Enums");
const { isEmpty } = require("lodash");
const mongoose = require("mongoose");

const getUser = async ({
  id = "",
  email = "",
  phone = "",
  tlID = "",
  teamLeaderID = "",
  uid = "",
  searchOptions= {},
  projection = {},
}) => {
  try {
    if (!id && !email && !phone && !tlID && !uid && isEmpty(searchOptions))
      throw new CustomError(ProcessorErrors.USERS.GET_USER_ERROR);

    return await userSchema.findOne(
      {
        ...(id && { _id: mongoose.Types.ObjectId(id) }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(tlID && { tl_id: tlID }),
        ...(teamLeaderID && { team_leader_id: teamLeaderID }),
        ...(uid && { uid }),
        ...searchOptions
      },
      projection
    );
  } catch (error) {
    logger.error(`Failed to get user by id [Processor]`);
    throw error;
  }
};

module.exports = getUser;
