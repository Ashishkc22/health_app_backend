const { isEmpty } = require("lodash");
const { getUser, updateUserById } = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums, DBEnums } = require("../../Enums");
const { bcrptyPassword } = require("../../utils/bcrypt-util");
// assign default services ["agent"]
// create FE role in roles collection
// user info

const setMyPassword = async (req, res, next) => {
  try {
    const userId = req.userDetails.id;
    // check if user with email or phone exists
    const user = await getUser({
      id: userId,
    });

    if (isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_NOT_FOUND);
    }

    if (user.password) {
      throw new CustomError(ErrorEnums.PASSWORD_ALREADY_SET);
    }
    const hashedPassword = bcrptyPassword.hashPassword({
      text: req.body.password,
    });

    await updateUserById({
      id: userId,
      updatedData: {
        password: hashedPassword,
      },
      updateCards: false,
      updateHospitals: false,
    });

    return res.status(200).json({
      status: "success",
      message: "Password set successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = setMyPassword;
