const { get, del, set } = require("../../config.js/cache.config");
const { getUser, getUsersRoleAndServiceDetails } = require("../../processors");
const { isEmpty } = require("lodash");
const { ErrorEnums, DBEnums } = require("../../Enums");
const { CustomError } = require("../../utils/custom-errors");
const { token } = require("../../utils/token");

const verifyLoginOTP = async (req, res, next) => {
  try {
    const { otp, mobile } = req.body;
    const cacheOTP = get(mobile);

    if (!cacheOTP) {
      return res.status(401).json({
        status: "failed",
        message: "OTP has expired. Please try again.",
      });
    }

    if (otp != cacheOTP) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid OTP.",
      });
    }
    del(mobile);

    const user = await getUser({
      phone: mobile,
      role: DBEnums.USER_ROLES.USER,
    });
    if (isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_NOT_FOUND);
    }

    const userRoleAndServiceDetails = await getUsersRoleAndServiceDetails({
      userId: user.id,
    });

    const genratedToken = await token.signToken({
      payload: {
        id: user.id,
        status: user.status,
        email: user.email,
        phone: user.phone,
        team_leader_id: user.team_leader_id,
        tl_id: user.tl_id,
        uid: user.uid,
        role: user.role,
      },
    });

    set(user.id, userRoleAndServiceDetails, 60 * 60 * 24);

    return res.status(200).json({
      status: "success",
      message: "OTP verification successful.",
      data: {
        token: genratedToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = verifyLoginOTP;
