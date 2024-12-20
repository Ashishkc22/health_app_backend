const { otpSchema } = require("../models");
const { Types } = require("mongoose");

const getOTPToken = async ({ id = "" }) => {
  try {
    return await otpSchema.findOne({ _id: Types.ObjectId(id) });
  } catch (error) {
    throw error;
  }
};

module.exports = getOTPToken;
