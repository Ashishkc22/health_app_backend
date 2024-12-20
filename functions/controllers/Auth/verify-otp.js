const nodecache = require("../../config.js/cache.config");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums } = require("../../Enums");
const { addRequestForPasswordReset } = require("../../processors");
const { isEmpty } = require("lodash");

const verifyOTP = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    const cacheOTP = nodecache.get(email);

    if (!cacheOTP) {
      throw new CustomError(ErrorEnums.EXPIRED_OTP);
    }

    if (otp != cacheOTP) {
      throw new CustomError(ErrorEnums.INVALID_OTP);
    }

    // Generate token
    const tokenDetails = await addRequestForPasswordReset({ email });
    if (isEmpty(tokenDetails)) {
      throw new CustomError(ErrorEnums.FAILED_TO_GENERATE_OTP_ID);
    }
    return res.status(200).json({
      status: "success",
      data: {
        token: tokenDetails.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = verifyOTP;
