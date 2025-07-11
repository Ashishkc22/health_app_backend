const { isEmpty } = require("lodash");
const {
  getUser,
  addUser,
  getUsersRoleAndServiceDetails,
} = require("../../processors");
const { set } = require("../../config.js/cache.config");
const { token } = require("../../utils/token");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums, DBEnums } = require("../../Enums");
const mongoose = require("mongoose");
// assign default services ["agent"]
// create FE role in roles collection
// user info

const userSignUp = async (req, res, next) => {
  let session = {};
  try {
    // check if provided TL id is exists
    if (req.body.team_leader_id) {
      const tlDetails = await getUser({
        tlID: req.body.team_leader_id,
      });
      if (isEmpty(tlDetails)) {
        throw new CustomError(ErrorEnums.TL_DETAIL_NOT_FOUND);
      }
    }

    // check if user with email or phone exists
    const user = await getUser({
      email: req.body.email,
      phone: req.body.phone,
    });

    const role = req.body.team_leader_id
      ? DBEnums.USER_ROLES.FE
      : DBEnums.USER_ROLES.USER;

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

    const userRoleAndServiceDetails = await getUsersRoleAndServiceDetails({
      userId: userData.id,
    });

    const genratedToken = await token.signToken({
      payload: {
        id: userData.id,
        status: userData.status,
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
        team_leader_id: userData.team_leader_id,
        tl_id: userData.tl_id,
        uid: userData.uid,
        role: userData.role,
      },
    });

    set(userData.id, userRoleAndServiceDetails, 60 * 60 * 24);

    delete userData.password;

    return res.status(200).json({
      status: "success",
      data: { token: genratedToken, userData },
    });
  } catch (error) {
    if (!isEmpty(session)) await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = userSignUp;
