const { isEmpty } = require("lodash");
const { getUser } = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums, EmailEnums } = require("../../Enums");
const { sendEmail } = require("../../utils/email.js");
const nodeCache = require("../../config.js/cache.config.js");

function generateOTP(len) {
  let result = Math.floor(Math.random() * Math.pow(10, len));

  return result.toString().length < len ? generateOTP(len) : result;
}

const getOtp = async (req, res, next) => {
  try {
    const user = await getUser({ email: req.body.email });
    if (isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_NOT_FOUND);
    }

    const otp = generateOTP(5);

    const emailResponse = await sendEmail(user.email, EmailEnums.body + otp);
    if (!emailResponse) {
      throw new CustomError(ErrorEnums.FAILED_TO_SEND_EMAIL_OTP);
    }

    // storing opt in cache valid for 5 min
    nodeCache.set(user.email, otp, 60 * 5);

    return res.status(200).json({
      status: "success",
      message: "code send successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getOtp;
