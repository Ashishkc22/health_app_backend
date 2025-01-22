const { updateUserById } = require("../../processors");

const updateProfile = async (req, res, next) => {
  try {
    const id = req.userDetails.id;
    const user = await updateUserById({ id, updatedData: req.body, updateCards: false, updateHospitals: false });
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
