const { userSchema, otpSchema } = require("../models");
const { isEmpty } = require("lodash");
const { CustomError } = require("../utils/custom-errors");
const { ErrorEnums } = require("../Enums");

const addRequestForPasswordReset = async ({ email = "" }) => {
  try {
    const user = await userSchema.find({ email });
    if (isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_NOT_FOUND);
    }

    return await otpSchema({
      time: new Date(),
      user_id: user.id,
      email,
    }).save();
  } catch (error) {
    throw error;
  }
};

module.exports = addRequestForPasswordReset;
