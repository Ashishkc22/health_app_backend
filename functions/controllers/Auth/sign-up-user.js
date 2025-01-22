const { isEmpty } = require("lodash");
const {
  getUser,
  addUser,
} = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums, DBEnums } = require("../../Enums");
const mongoose = require("mongoose");
// assign default services ["agent"]
// create FE role in roles collection
// user info

const userSignUp = async (req, res, next) => {
  let session = {};
  try {
    // check if user with email or phone exists
    const user = await getUser({
      email: req.body.email,
      phone: req.body.phone,
    });

    const role = req.body?.role || DBEnums.USER_ROLES.USER;

    if (!isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_ALREADY_EXISTS);
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const userData = await addUser({
      data: {
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password,
        email: req.body.email,
        image: req.body.image,
        address: req.body.address,
        state: req.body.state,
        district: req.body.district,
        id_proof: req.body.id_proof,
        emergency_contact: req.body.emergency_contact,
        team_leader_id: req.body.team_leader_id,
        device_id: req.body.device_id,
        lat: req.body.lat || 0.0,
        lon: req.body.lon || 0.0,
        status: DBEnums.USER_STATUS.Incomplete,
      },
      role,
      session,
    });

    await session.commitTransaction();

    delete userData.password;

    return res.status(200).json({
      status: "success",
      data: userData,
    });
  } catch (error) {
    if (!isEmpty(session)) await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = userSignUp;
