const { getOTPToken, updateUserByEmail } = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums } = require("../../Enums");
const { bcrptyPassword } = require("../../utils/bcrypt-util");

const resetPassword = async (req, res, next) => {
  try {
    const { password, token } = req.body;

    const resetTokenDetails = await getOTPToken({ id: token });

    if (!resetTokenDetails) {
      throw new CustomError(ErrorEnums.INVALID_PASSWORD_RESET_TOKEN);
    }
    const currentDateTime = new Date();
    const time15MinBack = new Date(currentDateTime.getTime() - 15 * 60 * 1000);
    if (new Date(resetTokenDetails.time) < time15MinBack) {
      throw new CustomError(ErrorEnums.PASSWORD_RESET_TOKEN_EXPIRED);
    }

    await updateUserByEmail({
      email: resetTokenDetails.email,
      updateFields: {
        password: bcrptyPassword.hashPassword({ text: password }),
      },
    });
    return res.status(200).json({
      status: "success",
      message: "Done",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = resetPassword;
