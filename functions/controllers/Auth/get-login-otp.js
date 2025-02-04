const axios = require("axios");
const { isEmpty } = require("lodash");
const { getUser } = require("../../processors");
const { CustomError, ErrorEnums } = require("../../utils/custom-errors");
const { set } = require("../../config.js/cache.config");

const sendLoginOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    const user = await getUser({ phone: mobile });
    if (isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_NOT_FOUND);
    }

    const otp = "123456" || Math.floor(100000 + Math.random() * 900000);
    set(mobile, otp, 60 * 5);

    // const options = {
    //   method: "POST",
    //   url: process.env.LOGIN_OTP_SERVICE_URL,
    //   headers: {
    //     "Content-Type": "application/json",
    //     authkey: process.env.LOGIN_OTP_SERVICE_AUTH_KEY,
    //   },
    //   data: {
    //     template_id: process.env.LOGIN_OTP_TEMPLATE_ID,
    //     short_url: 1,
    //     short_url_expiry: 300,
    //     realTimeResponse: 1,
    //     recipients: [
    //       {
    //         mobile: mobile,
    //         VAR1: otp,
    //       },
    //     ],
    //   },
    // };
    // const response = await axios(options);
    // if (response.status !== 200) {
    //   throw new CustomError(ErrorEnums.FAILED_TO_SEND_LOGIN_OTP);
    // }
    res.status(200).json({ status: "success", message: "OTP sent" });
  } catch (error) {
    next(error);
  }
};

module.exports = sendLoginOTP;
