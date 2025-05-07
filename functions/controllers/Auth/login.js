const { userSchema } = require("../../models");
const { getUser, getUsersRoleAndServiceDetails } = require("../../processors");
const { isEmpty } = require("lodash");
const { ErrorEnums } = require("../../Enums");
const bcrypt = require("bcrypt");
const { CustomError } = require("../../utils/custom-errors");
const { token } = require("../../utils/token");
const { set } = require("../../config.js/cache.config");

function isHash(text) {
  const hashLengths = [32, 40, 64, 128]; // Common hash lengths
  return /^[a-fA-F0-9]+$/.test(text) && hashLengths.includes(text.length);
}

const login = async (req, res, next) => {
  try {
    const user = await getUser({
      ...(req.body.phone && { phone: req.body.phone }),
      ...(req.body.email && { email: req.body.email }),
    });
    if (isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_NOT_FOUND);
    }

    if (process.env.NODE_ENV === "production") {
      const isPasswordCorrect = await bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!isPasswordCorrect) {
        throw new CustomError(ErrorEnums.INCORRECT_PASSWORD);
      }
    }
    // get role and services detais
    const userRoleAndServiceDetails = await getUsersRoleAndServiceDetails({
      userId: user.id,
    });

    const genratedToken = await token.signToken({
      payload: {
        id: user.id,
        status: user.status,
        email: user.email,
        phone: user.phone,
        name: user.name,
        team_leader_id: user.team_leader_id,
        tl_id: user.tl_id,
        uid: user.uid,
        role: user.role,
      },
    });

    set(user.id, userRoleAndServiceDetails, 60 * 60 * 24);
    return res.status(200).json({
      status: "success",
      data: {
        token: genratedToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = login;
