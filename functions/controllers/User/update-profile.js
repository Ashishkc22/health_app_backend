const { DBEnums } = require("../../Enums");
const { updateUserById } = require("../../processors");

const updateProfile = async (req, res, next) => {
  try {
    const id = req.userDetails.id;
    const { role } = req.userDetails;
    if (role !== DBEnums.USER_ROLES.ADMIN) {
      req.body.status = DBEnums.USER_STATUS.Unverified;
      delete req.body.role;
    }
    const user = await updateUserById({
      id,
      updatedData: req.body,
      updateHospitals: false,
      userId: true,
    });
    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = updateProfile;
