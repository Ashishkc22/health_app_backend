const { userSchema } = require("../models");
const { Types } = require("mongoose");
const { CustomError } = require("../utils/custom-errors");
const { ProcessorErrors } = require("../Enums");

const updateUser = async ({ id = "", email = "", updateFields = {} }) => {
  try {
    if (!id && !email) {
      throw new CustomError(ProcessorErrors.RESET_PASSWORD.MISSING_EMAIL);
    }

    return await userSchema.findOneAndUpdate(
      {
        ...(id && { _id: Types.ObjectId(id) }),
        ...(email && { email }),
      },
      {
        $set: updateFields,
      }
    );
  } catch (error) {
    throw error;
  }
};

module.exports = updateUser;
