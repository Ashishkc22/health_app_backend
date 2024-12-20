const { userSchema } = require("../models");
const { CustomError } = require("../utils/custom-errors");
const { logger } = require("../utils/logger");
const { ProcessorErrors } = require("../Enums");
const mongoose = require("mongoose");

const getUser = async ({
  id = "",
  email = "",
  phone = "",
  tlID = "",
  uid = "",
  projection = {},
}) => {
  try {
    if (!id && !email && !phone && !tlID && !uid)
      throw new CustomError(ProcessorErrors.USERS.GET_USER_ERROR);

    return await userSchema.findOne(
      {
        ...(id && { _id: mongoose.Types.ObjectId(id) }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(tlID && { tl_id: tlID }),
        ...(uid && { uid }),
      },
      projection
    );
  } catch (error) {
    logger.error(`Failed to get user by id [Processor]`);
    throw error;
  }
};

module.exports = getUser;
