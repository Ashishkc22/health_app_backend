const { DBEnums, ErrorEnums } = require("../../Enums");
const { userSchema, cardSchema } = require("../../models");
const { CustomError } = require("../../utils/custom-errors");
const { isEmpty } = require("lodash");

const verifyCustomer = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const user = await userSchema.findById(userId);
    if (isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_NOT_FOUND);
    }
    const card = await cardSchema.findOne({ userId });
    if (isEmpty(card)) {
      throw new CustomError(ErrorEnums.CARD_NOT_FOUND);
    }
    if (user.status === DBEnums.USER_STATUS.Incomplete) {
      return res.status(400).json({
        status: "failed",
        message: "User is info incomplete.",
      });
    }
    if (user.status === DBEnums.USER_STATUS.Verified) {
      return res.status(400).json({
        status: "failed",
        message: "User is status is already verified.",
      });
    }
    const updatedUser = await userSchema.findOneAndUpdate(
      { _id: userId },
      { status: DBEnums.USER_STATUS.Verified },
      { new: true }
    );
    const updatedCard = await cardSchema.findOneAndUpdate(
      { userId },
      { status: DBEnums.CARD_STATUS.SUBMITTED },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      message: "User verified successfully.",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = verifyCustomer;
