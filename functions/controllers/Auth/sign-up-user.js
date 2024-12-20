const { isEmpty } = require("lodash");
const {
  getUser,
  addUserRole,
  getServiceByName,
  addUser,
} = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums, DefaultRolePermissions } = require("../../Enums");
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
    if (!isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_ALREADY_EXISTS);
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const roleDetails = await addUserRole({ session });
    const service = await getServiceByName({
      name: DefaultRolePermissions.SERVICES.AGENT.name,
    });
    if (isEmpty(service)) {
      throw new CustomError(ErrorEnums.SERVICE_NOT_FOUND);
    }

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
        services: [
          {
            serviceId: service._id,
            roleId: roleDetails._id,
          },
        ],
      },
      session,
    });

    await session.commitTransaction();

    delete userData.password;

    return res.status(200).json({
      status: "success",
      data: userData,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = userSignUp;
